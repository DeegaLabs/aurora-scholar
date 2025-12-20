import Irys from '@irys/sdk';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export interface UploadArticleParams {
  content: string;
  title: string;
  declaredIntuition: string;
  metadata?: Record<string, any>;
}

export interface UploadFileParams {
  file: Buffer;
  contentType: string;
  fileName?: string;
}

export class StorageService {
  private irys: Irys | null = null;
  private nodeUrl: string | null = null;
  private privateKey: string | null = null;

  constructor() {
    // Load lazily in getIrys() so runtime env changes / dotenv timing cannot break initialization.
    this.nodeUrl = null;
    this.privateKey = null;
  }

  /**
   * Initialize Irys instance with Solana wallet
   */
  private async getIrys(): Promise<Irys> {
    if (this.irys) {
      return this.irys;
    }

    // Refresh env-backed config at initialization time.
    // Support both IRYS_NODE_URL (code) and IRYS_NODE (existing env files)
    this.nodeUrl = process.env.IRYS_NODE_URL || process.env.IRYS_NODE || 'https://devnet.irys.xyz';
    this.privateKey = process.env.IRYS_PRIVATE_KEY || null;

    if (!this.privateKey) {
      throw new Error('IRYS_PRIVATE_KEY environment variable is required');
    }

    try {
      // Convert private key from base58 or hex
      let keypair: Keypair;
      
      try {
        // Try base58 first (Solana format)
        const decoded = bs58.decode(this.privateKey);
        keypair = Keypair.fromSecretKey(decoded);
      } catch {
        // Try hex format
        const hexKey = this.privateKey.startsWith('0x') 
          ? this.privateKey.slice(2) 
          : this.privateKey;
        const buffer = Buffer.from(hexKey, 'hex');
        keypair = Keypair.fromSecretKey(buffer);
      }

      this.irys = new Irys({
        url: this.nodeUrl!,
        token: 'solana',
        key: bs58.encode(keypair.secretKey),
        config: {
          providerUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        },
      });

      return this.irys;
    } catch (error: any) {
      throw new Error(`Failed to initialize Irys: ${error.message}`);
    }
  }

  /**
   * Upload article content to Arweave via Irys
   */
  async uploadArticle(params: UploadArticleParams): Promise<string> {
    const { content, title, declaredIntuition, metadata = {} } = params;

    try {
      const irys = await this.getIrys();

      // Prepare data to upload
      const articleData = {
        content,
        title,
        declaredIntuition,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        ...metadata,
      };

      const tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'App-Name', value: 'Aurora Scholar' },
        { name: 'Type', value: 'article' },
        { name: 'Title', value: title },
      ];

      // Upload to Arweave
      const receipt = await irys.upload(JSON.stringify(articleData), {
        tags,
      });

      return receipt.id;
    } catch (error: any) {
      throw new Error(`Failed to upload article: ${error.message}`);
    }
  }

  /**
   * Upload file to Arweave via Irys
   */
  async uploadFile(params: UploadFileParams): Promise<string> {
    const { file, contentType, fileName } = params;

    try {
      const irys = await this.getIrys();

      const tags = [
        { name: 'Content-Type', value: contentType },
        { name: 'App-Name', value: 'Aurora Scholar' },
        { name: 'Type', value: 'file' },
      ];

      if (fileName) {
        tags.push({ name: 'File-Name', value: fileName });
      }

      // Upload file
      const receipt = await irys.upload(file, {
        tags,
      });

      return receipt.id;
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get content from Arweave by transaction ID
   * Tries multiple gateways and retries for better reliability
   */
  async getContent(transactionId: string): Promise<any> {
    // List of Arweave gateways to try (some may index faster than others)
    const gateways = [
      this.getGatewayUrl(), // Primary gateway (from env or default)
      'https://arweave.net',
      'https://ar-io.net',
      'https://arweave.live',
    ];

    const maxRetries = 2;
    let lastError: Error | null = null;

    for (const gateway of gateways) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // Add small delay between retries
          if (attempt > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }

          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          try {
            const response = await fetch(`${gateway}/${transactionId}`, {
              headers: {
                'Accept': 'application/json, text/plain, */*',
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) {
              if (response.status === 404) {
                // Try next gateway or retry
                if (attempt < maxRetries) continue;
                lastError = new Error(`Article not found on Arweave. It may still be processing. Transaction ID: ${transactionId}. You can check it at: https://viewblock.io/arweave/tx/${transactionId}`);
                continue; // Try next gateway
              }
              throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            
            if (contentType?.includes('application/json')) {
              return await response.json();
            }

            const text = await response.text();
            
            // Check if the response is an HTML error page from Arweave
            if (text.includes('This page cannot be found') || 
                text.includes('might have to wait for it to be mined') ||
                text.includes('<!DOCTYPE html>') ||
                text.includes('<html') ||
                (text.includes('expired domains') && text.includes('GoDaddy'))) {
              // This is likely an error page or placeholder, not the actual content
              throw new Error(
                `Article not found on Arweave. The transaction may still be processing. ` +
                `Transaction ID: ${transactionId}. ` +
                `Check status at: https://viewblock.io/arweave/tx/${transactionId} or https://arweave.net/${transactionId}`
              );
            }
            
            // Try to parse as JSON if it looks like JSON
            if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
              try {
                const parsed = JSON.parse(text);
                // Validate that it's actually our article structure
                if (parsed && typeof parsed === 'object' && (parsed.content !== undefined || parsed.title !== undefined)) {
                  return parsed;
                }
                // If it doesn't have expected fields, might be wrong content
                throw new Error('Invalid article structure in Arweave response');
              } catch (parseError: any) {
                // If parsing fails or structure is wrong, check if it's an error
                if (parseError.message?.includes('Invalid article structure')) {
                  throw new Error(
                    `Article content structure is invalid. The transaction may still be processing. ` +
                    `Transaction ID: ${transactionId}. ` +
                    `Check status at: https://arweave.net/${transactionId}`
                  );
                }
                // If it's a JSON parse error but looks like JSON, might be malformed
                throw new Error(
                  `Failed to parse article content. The transaction may still be processing. ` +
                  `Transaction ID: ${transactionId}`
                );
              }
            }

            // If it's not JSON and not HTML error, it might be plain text content
            // But we expect JSON, so this is likely an error
            throw new Error(
              `Article content format is invalid. Expected JSON but received text. ` +
              `The transaction may still be processing. ` +
              `Transaction ID: ${transactionId}. ` +
              `Check status at: https://arweave.net/${transactionId}`
            );
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            throw fetchError;
          }
        } catch (error: any) {
          // If it's a timeout or network error, try next gateway
          if (error.name === 'AbortError' || error.name === 'TypeError') {
            if (attempt < maxRetries) continue;
            lastError = error;
            continue; // Try next gateway
          }
          // For other errors, throw immediately
          throw error;
        }
      }
    }

    // If all gateways failed, throw the last error with helpful message
    if (lastError) {
      throw new Error(
        `Article not found on Arweave after trying multiple gateways. ` +
        `It may still be processing (can take a few minutes). ` +
        `Transaction ID: ${transactionId}. ` +
        `Check status at: https://viewblock.io/arweave/tx/${transactionId} or https://arweave.net/${transactionId}`
      );
    }

    throw new Error(`Failed to get content: Unknown error`);
  }

  /**
   * Get upload price estimate in SOL
   */
  async getUploadPrice(sizeInBytes: number): Promise<number> {
    try {
      const irys = await this.getIrys();
      const price = await irys.getPrice(sizeInBytes);
      
      // Convert from atomic units to SOL
      return Number(price) / 1e9;
    } catch (error: any) {
      throw new Error(`Failed to get upload price: ${error.message}`);
    }
  }

  /**
   * Fund Irys account with SOL
   */
  async fundAccount(amountInSol: number): Promise<string> {
    try {
      const irys = await this.getIrys();
      
      // Convert SOL to atomic units
      const amount = amountInSol * 1e9;
      
      const fundTx = await irys.fund(amount);
      
      return fundTx.id;
    } catch (error: any) {
      throw new Error(`Failed to fund account: ${error.message}`);
    }
  }

  /**
   * Get Irys account balance in SOL
   */
  async getBalance(): Promise<number> {
    try {
      const irys = await this.getIrys();
      const balance = await irys.getLoadedBalance();
      
      // Convert from atomic units to SOL
      return Number(balance) / 1e9;
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get Arweave gateway URL for content retrieval
   */
  getGatewayUrl(): string {
    const gateway = process.env.ARWEAVE_GATEWAY_URL || 'https://arweave.net';
    return gateway;
  }

  /**
   * Get Arweave URL for a transaction ID
   */
  getArweaveUrl(transactionId: string): string {
    return `${this.getGatewayUrl()}/${transactionId}`;
  }
}

// Export singleton instance
export const storageService = new StorageService();

