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
  private nodeUrl: string;
  private privateKey: string | null = null;

  constructor() {
    // Support both IRYS_NODE_URL (code) and IRYS_NODE (existing env files)
    this.nodeUrl = process.env.IRYS_NODE_URL || process.env.IRYS_NODE || 'https://devnet.irys.xyz';
    this.privateKey = process.env.IRYS_PRIVATE_KEY || null;
  }

  /**
   * Initialize Irys instance with Solana wallet
   */
  private async getIrys(): Promise<Irys> {
    if (this.irys) {
      return this.irys;
    }

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
        url: this.nodeUrl,
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
   */
  async getContent(transactionId: string): Promise<any> {
    try {
      // Fetch data from Arweave gateway
      const response = await fetch(`${this.getGatewayUrl()}/${transactionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error: any) {
      throw new Error(`Failed to get content: ${error.message}`);
    }
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

