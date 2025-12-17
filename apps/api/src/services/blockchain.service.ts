import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { createHash } from 'crypto';
import IDL from '../idl/aurora_scholar.json';

export interface PublishArticleParams {
  author: PublicKey;
  content: string;
  declaredIntuition: string;
  arweaveId: string;
  title: string;
  aiScope: string;
  isPublic: boolean;
  signer: Keypair;
}

export interface ArticleData {
  author: PublicKey;
  contentHash: Buffer;
  intuitionHash: Buffer;
  arweaveId: string;
  title: string;
  aiScope: string;
  isPublic: boolean;
  timestamp: number;
  bump: number;
}

export class BlockchainService {
  private connection: Connection;
  private program: Program;

  constructor(rpcUrl?: string) {
    const url = rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(url, 'confirmed');
    
    // Create a dummy wallet for provider (will be replaced by signer in methods)
    const dummyWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
    } as Wallet;

    const provider = new AnchorProvider(
      this.connection,
      dummyWallet,
      { commitment: 'confirmed' }
    );

    this.program = new Program(IDL as any, provider);
  }

  /**
   * Calculate SHA-256 hash of content
   */
  private hashContent(content: string): Buffer {
    return createHash('sha256').update(content).digest();
  }

  /**
   * Derive PDA for article account
   */
  private async deriveArticlePDA(author: PublicKey, contentHash: Buffer): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('article'),
        author.toBuffer(),
        contentHash,
      ],
      this.program.programId
    );
  }

  /**
   * Publish article to Solana blockchain
   */
  async publishArticle(params: PublishArticleParams): Promise<string> {
    const { author, content, declaredIntuition, arweaveId, title, aiScope, isPublic, signer } = params;

    // Validate inputs
    if (title.length > 128) {
      throw new Error('Title too long (max 128 chars)');
    }
    if (aiScope.length > 256) {
      throw new Error('AI scope too long (max 256 chars)');
    }

    // Calculate hashes
    const contentHash = this.hashContent(content);
    const intuitionHash = this.hashContent(declaredIntuition);

    // Derive PDA
    const [articlePDA] = await this.deriveArticlePDA(author, contentHash);

    // Create provider with actual signer
    const provider = new AnchorProvider(
      this.connection,
      {
        publicKey: signer.publicKey,
        signTransaction: async (tx: any) => {
          tx.sign(signer);
          return tx;
        },
        signAllTransactions: async (txs: any[]) => {
          return txs.map(tx => {
            tx.sign(signer);
            return tx;
          });
        },
      } as Wallet,
      { commitment: 'confirmed' }
    );

    const program = new Program(IDL as any, provider);

    try {
      const tx = await program.methods
        .publishArticle(
          Array.from(contentHash),
          Array.from(intuitionHash),
          arweaveId,
          title,
          aiScope,
          isPublic
        )
        .accounts({
          article: articlePDA,
          author: author,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (error: any) {
      throw new Error(`Failed to publish article: ${error.message}`);
    }
  }

  /**
   * Get article data from blockchain
   */
  async getArticle(author: PublicKey, contentHash: Buffer): Promise<ArticleData | null> {
    try {
      const [articlePDA] = await this.deriveArticlePDA(author, contentHash);
      const account = await (this.program.account as any).article.fetch(articlePDA);

      return {
        author: account.author,
        contentHash: Buffer.from(account.contentHash),
        intuitionHash: Buffer.from(account.intuitionHash),
        arweaveId: account.arweaveId,
        title: account.title,
        aiScope: account.aiScope,
        isPublic: account.isPublic,
        timestamp: account.timestamp.toNumber(),
        bump: account.bump,
      };
    } catch (error: any) {
      if (error.message?.includes('Account does not exist')) {
        return null;
      }
      throw new Error(`Failed to get article: ${error.message}`);
    }
  }

  /**
   * Get all public articles (requires indexing or event parsing)
   * Note: This is a simplified version. In production, you'd use an indexer
   */
  async getPublicArticles(_limit: number = 100): Promise<ArticleData[]> {
    // This is a placeholder. In production, you'd:
    // 1. Use an indexer (e.g., Helius, QuickNode)
    // 2. Parse events from the blockchain
    // 3. Maintain a database cache of public articles
    
    // For now, return empty array
    // TODO: Implement proper indexing
    return [];
  }

  /**
   * Update article visibility
   */
  async updateVisibility(
    author: PublicKey,
    contentHash: Buffer,
    isPublic: boolean,
    signer: Keypair
  ): Promise<string> {
    const [articlePDA] = await this.deriveArticlePDA(author, contentHash);

    // Create provider with actual signer
    const provider = new AnchorProvider(
      this.connection,
      {
        publicKey: signer.publicKey,
        signTransaction: async (tx: any) => {
          tx.sign(signer);
          return tx;
        },
        signAllTransactions: async (txs: any[]) => {
          return txs.map(tx => {
            tx.sign(signer);
            return tx;
          });
        },
      } as Wallet,
      { commitment: 'confirmed' }
    );

    const program = new Program(IDL as any, provider);

    try {
      const tx = await program.methods
        .updateVisibility(isPublic)
        .accounts({
          article: articlePDA,
          author: author,
        })
        .rpc();

      return tx;
    } catch (error: any) {
      if (error.message?.includes('Unauthorized')) {
        throw new Error('You are not authorized to update this article');
      }
      throw new Error(`Failed to update visibility: ${error.message}`);
    }
  }

  /**
   * Verify article integrity by comparing hashes
   */
  async verifyArticle(
    author: PublicKey,
    content: string,
    declaredIntuition: string
  ): Promise<boolean> {
    const contentHash = this.hashContent(content);
    const intuitionHash = this.hashContent(declaredIntuition);

    const article = await this.getArticle(author, contentHash);

    if (!article) {
      return false;
    }

    // Compare hashes
    const contentMatch = contentHash.equals(article.contentHash);
    const intuitionMatch = intuitionHash.equals(article.intuitionHash);

    return contentMatch && intuitionMatch;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

