import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuroraScholar } from "../target/types/aurora_scholar";
import { expect } from "chai";
import { createHash } from "crypto";

describe("aurora_scholar", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuroraScholar as Program<AuroraScholar>;
  const author = provider.wallet;

  const createContentHash = (content: string): number[] => {
    const hash = createHash("sha256").update(content).digest();
    return Array.from(hash);
  };

  describe("publish_article", () => {
    it("should publish a public article successfully", async () => {
      const content = "Test article content";
      const intuition = "My research hypothesis";
      const contentHash = createContentHash(content);
      const intuitionHash = createContentHash(intuition);

      const [articlePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("article"),
          author.publicKey.toBuffer(),
          Buffer.from(contentHash),
        ],
        program.programId
      );

      await program.methods
        .publishArticle(
          contentHash,
          intuitionHash,
          "arweave-tx-id-123",
          "Test Article Title",
          "AI used for grammar checking only",
          true
        )
        .accounts({
          article: articlePda,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const article = await program.account.article.fetch(articlePda);

      expect(article.author.toString()).to.equal(author.publicKey.toString());
      expect(article.title).to.equal("Test Article Title");
      expect(article.isPublic).to.be.true;
      expect(article.arweaveId).to.equal("arweave-tx-id-123");
      expect(article.aiScope).to.equal("AI used for grammar checking only");
    });

    it("should publish a private article successfully", async () => {
      const content = "Private article content";
      const intuition = "Private hypothesis";
      const contentHash = createContentHash(content);
      const intuitionHash = createContentHash(intuition);

      const [articlePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("article"),
          author.publicKey.toBuffer(),
          Buffer.from(contentHash),
        ],
        program.programId
      );

      await program.methods
        .publishArticle(
          contentHash,
          intuitionHash,
          "arweave-private-456",
          "Private Article",
          "No AI assistance",
          false
        )
        .accounts({
          article: articlePda,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const article = await program.account.article.fetch(articlePda);
      expect(article.isPublic).to.be.false;
    });
  });

  describe("update_visibility", () => {
    it("should update article visibility", async () => {
      const content = "Article to update";
      const contentHash = createContentHash(content);
      const intuitionHash = createContentHash("intuition");

      const [articlePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("article"),
          author.publicKey.toBuffer(),
          Buffer.from(contentHash),
        ],
        program.programId
      );

      // First publish
      await program.methods
        .publishArticle(
          contentHash,
          intuitionHash,
          "arweave-update-789",
          "Update Test",
          "AI scope",
          true
        )
        .accounts({
          article: articlePda,
          author: author.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Then update visibility
      await program.methods
        .updateVisibility(false)
        .accounts({
          article: articlePda,
          author: author.publicKey,
        })
        .rpc();

      const article = await program.account.article.fetch(articlePda);
      expect(article.isPublic).to.be.false;
    });
  });
});


