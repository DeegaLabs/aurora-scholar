# Aurora Scholar

> Decentralized scientific publishing platform on Solana blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Built%20on-Solana-14F213)](https://solana.com)

## 🎯 Vision

Democratize scientific publishing through blockchain, ensuring immutable authorship, open access, and transparency in the peer review process.

## ✨ Main Features

- **Academic Editor** with Ethical AI Assistant (always-active agent)
- **On-Chain Publishing** on Solana (immutable hash + timestamp)
- **Permanent Storage** on Arweave
- **Access Control** (Public/Private with expiration)
- **On-Chain Journal** (public article listing)
- **Evaluation Board System** (Phase 2)

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
