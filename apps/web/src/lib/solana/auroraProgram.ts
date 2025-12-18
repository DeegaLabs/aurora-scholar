import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';

import idl from '../../../../api/src/idl/aurora_scholar.json';

export const AURORA_PROGRAM_ID = new PublicKey((idl as any).address);

export function deriveArticlePda(author: PublicKey, contentHashBytes: Uint8Array) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('article'), author.toBuffer(), Buffer.from(contentHashBytes)],
    AURORA_PROGRAM_ID
  );
}

export const SYSTEM_PROGRAM_ID = SystemProgram.programId;

// ---- Instruction builders (Anchor-free; safe in browser) ----
// Discriminator for publish_article taken from IDL.
const PUBLISH_ARTICLE_DISCRIMINATOR = Uint8Array.from([151, 40, 172, 108, 86, 138, 159, 171]);

function u32le(n: number) {
  const b = new Uint8Array(4);
  const v = n >>> 0;
  b[0] = v & 0xff;
  b[1] = (v >>> 8) & 0xff;
  b[2] = (v >>> 16) & 0xff;
  b[3] = (v >>> 24) & 0xff;
  return b;
}

function concatBytes(...chunks: Array<Uint8Array>) {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

function encodeString(s: string) {
  const bytes = new TextEncoder().encode(s);
  return concatBytes(u32le(bytes.length), bytes);
}

/**
 * Build the publish_article instruction without Anchor.
 * Layout = 8-byte discriminator + args (borsh):
 * - content_hash: [u8;32]
 * - intuition_hash: [u8;32]
 * - arweave_id: string
 * - title: string
 * - ai_scope: string
 * - is_public: bool (u8)
 */
export function buildPublishArticleIx(params: {
  article: PublicKey;
  author: PublicKey;
  contentHash: Uint8Array; // 32 bytes
  intuitionHash: Uint8Array; // 32 bytes
  arweaveId: string;
  title: string;
  aiScope: string;
  isPublic: boolean;
}) {
  if (params.contentHash.length !== 32) throw new Error('contentHash must be 32 bytes');
  if (params.intuitionHash.length !== 32) throw new Error('intuitionHash must be 32 bytes');

  const data = concatBytes(
    PUBLISH_ARTICLE_DISCRIMINATOR,
    params.contentHash,
    params.intuitionHash,
    encodeString(params.arweaveId),
    encodeString(params.title),
    encodeString(params.aiScope),
    Uint8Array.from([params.isPublic ? 1 : 0])
  );

  return new TransactionInstruction({
    programId: AURORA_PROGRAM_ID,
    keys: [
      { pubkey: params.article, isSigner: false, isWritable: true },
      { pubkey: params.author, isSigner: true, isWritable: true },
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });
}


