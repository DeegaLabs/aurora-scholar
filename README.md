# Aurora Scholar

> Decentralized scientific publishing platform on Solana blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Built%20on-Solana-14F213)](https://solana.com)

## 🎯 Vision

**Assisted Academic Writing Monitoring** - A platform where users write their own academic texts with ethical AI guidance (never substitution), ensuring authenticity, transparency, and immutable authorship through blockchain. The AI acts as a **monitor** that guides, explains, and validates - never writes for the user.

## ✨ Main Features

- **Academic Editor** with Ethical AI Assistant (always-active agent)
- **Three-Layer Ethical System** (Declared Intuition, Linguistic Mediation, Coherence Monitoring)
- **Declared Sources** (NotebookLM-style) - User uploads PDFs, links, etc. - AI uses only these as reference
- **On-Chain Publishing** on Solana (immutable hash + timestamp)
- **Permanent Storage** on Arweave
- **Access Control** (Public/Private with expiration)
- **On-Chain Journal** (public article listing)
- **Evaluation Board System** (Phase 2)

## 🌐 Aurora Scholar Ecosystem

Aurora Scholar operates as an integrated ecosystem where each component works together:

**9-Step User Flow:**
1. **Declare Intuition** - User states their initial idea/declaration
2. **Upload Declared Sources** - PDFs, links, videos, etc. (AI uses only these)
3. **Write with AI Guidance** - Real-time ethical assistance (AI never writes)
4. **AI Monitors Coherence** - Continuous validation of consistency
5. **Review and Refine** - User reviews suggestions and improves
6. **Generate Final Version** - User finalizes their work
7. **Register on-Chain** - Hash + timestamp on Solana (immutable proof)
8. **Store Permanently** - Full content on Arweave (permanent, single payment)
9. **Share** - Public (On-Chain Journal) or Private (temporary links)

**Three-Layer Ethical System:**
- **Layer 1: Declared Intuition** - User's initial idea is captured and registered
- **Layer 2: Linguistic Mediation** - AI guides structure and language (never writes)
- **Layer 3: Coherence Monitoring** - AI validates consistency between intuition, sources, and final text

**Key Components:**
- **Editor + AI Assistant**: Real-time ethical guidance as user writes
- **Declared Sources Processing**: Vectorization and embedding for AI reference
- **On-Chain Registration**: Hash + timestamp + AI scope on Solana
- **Permanent Storage**: Full content on Arweave
- **Verification**: Anyone can verify authenticity via Solana Explorer

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL
- Solana CLI (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/aurora-scholar.git
cd aurora-scholar

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your settings

# Start the database
pnpm db:setup

# Start development
pnpm dev
```

## 📁 Project Structure

```
aurora-scholar/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/           # Express backend
├── packages/
│   ├── contracts/     # Anchor smart contracts
│   ├── sdk/           # Shared SDK
│   └── ui/            # Shared UI components
├── docs/              # Complete documentation
└── pnpm-workspace.yaml
```

## 🛠️ Technical Stack

- **Frontend:** Next.js 16.0.10, React, Tailwind CSS, TipTap
- **Backend:** Express, TypeScript, Prisma
- **Blockchain:** Solana (Anchor framework)
- **Storage:** Arweave via Irys
- **Database:** PostgreSQL
- **AI:** OpenAI/Anthropic API

## 📚 Documentation

- [MVP](./docs/MVP.md) - MVP features for hackathon
- [Architecture](./docs/ARCHITECTURE.md) - Technical decisions
- [Roadmap](./docs/ROADMAP.md) - Project evolution
- [Use Cases](./docs/USE_CASES.md) - Detailed flows
- [Pitch](./docs/PITCH.md) - Project presentation

## 🎓 Hackathon

This project was developed for the **Solana Student Hackathon Fall 2025**.

**Timeline:**
- Development period: 11/24/2024 - 12/19/2024
- Submission deadline: 12/19/2024

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request.

## 🔗 Links

- [Complete Documentation](./docs/README.md)
- [Solana Explorer](https://explorer.solana.com)
- [Arweave](https://www.arweave.org)

---

**Status:** In development for hackathon
