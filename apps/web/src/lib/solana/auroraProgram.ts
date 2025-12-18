import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';

import idl from '../../../../api/src/idl/aurora_scholar.json';

export const AURORA_PROGRAM_ID = new PublicKey((idl as any).address);

export function getAuroraProgram(connection: anchor.web3.Connection, wallet: anchor.Wallet) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  // Anchor's TS overloads can be finicky across versions; cast to any to avoid provider/programId mismatch.
  return new anchor.Program(idl as any, AURORA_PROGRAM_ID as any, provider as any);
}

export function deriveArticlePda(author: PublicKey, contentHashBytes: Uint8Array) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('article'), author.toBuffer(), Buffer.from(contentHashBytes)],
    AURORA_PROGRAM_ID
  );
}

export const SYSTEM_PROGRAM_ID = SystemProgram.programId;


