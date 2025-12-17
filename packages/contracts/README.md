# Aurora Scholar - Smart Contracts

Anchor-based Solana smart contracts for Aurora Scholar platform.

## Setup

1. Install Anchor: https://www.anchor-lang.com/docs/installation

2. Install dependencies:
```bash
pnpm install
```

3. Build:
```bash
pnpm build
```

4. Run tests:
```bash
pnpm test
```

5. Deploy to devnet:
```bash
pnpm deploy
```

## Program ID

After first build, update `Anchor.toml` and `lib.rs` with the generated Program ID.

## Structure

- `programs/aurora_scholar/src/lib.rs` - Main program
- `tests/aurora_scholar.ts` - TypeScript tests

## Testing

**Quick start:**
1. Install Anchor CLI (see installation guide)
2. `pnpm install` - Install dependencies
3. `pnpm build` - Builds contract and generates Program ID
4. Update Program ID in `Anchor.toml` and `lib.rs` (copy from build output)
5. `pnpm test` - Runs all tests (Anchor manages local validator automatically)

**Note:** 
- Yarn is NOT required - we use pnpm
- Solana CLI doesn't need to be in PATH - Anchor manages it internally
- `anchor test` automatically starts/stops local validator if using `localnet`

