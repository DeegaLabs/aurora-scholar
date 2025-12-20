# Aurora Scholar - Documentation Summary

> Executive summary of all project documentation

## 📋 Project Overview

**Aurora Scholar** is a decentralized scientific publishing platform on Solana blockchain that ensures authenticity, immutable authorship, and transparency in the academic process.

### Main Objective
Democratize scientific publishing through blockchain, ensuring that academic texts are authentic, verifiable, and permanently registered.

### Target Audience
- Users (students, researchers, teachers, institutions)
- Anyone who produces academic content
- Universities and educational institutions

## 📚 Documentation Structure

### 1. MVP.md - Minimum Viable Product
**Focus:** Essential features for hackathon (11/24 - 12/19/2024)

**Core Features:**
- ✅ Academic editor with TipTap (Google Docs style)
- ✅ **Internationalization (i18n)** - Full support for Portuguese (PT-BR) and English (EN)
- ✅ **Three-Layer Ethical System**
  - Layer 1: Declared Intuition (user states initial idea)
  - Layer 2: Linguistic Mediation (AI guides, never writes)
  - Layer 3: Coherence Monitoring (validates consistency)
- ✅ **Ethical AI Assistant** (always-active agent, continuously observes)
  - Does not write for the user
  - Guides on structure, references, grammar
  - Alerts about authenticity (detects too automated text)
  - Monitors coherence between intuition, sources, and text
  - Chat for specific questions
  - Structure suggestions based on content
  - Coherence checking against declared intuition
  - Language-aware responses (respects user's selected language)
- ✅ **Declared Sources**
  - User uploads PDFs, links, videos, audios
  - AI uses **only** these declared sources as reference
  - Vectorization and embedding for AI processing
  - Never generates content beyond declared sources
- ✅ **Dashboard** - Manage articles (public and private) with access control
- ✅ Wallet Connect (Phantom/Solflare)
- ✅ On-chain publication (Arweave + Solana)
  - Hash of content + declared intuition + AI scope
- ✅ Access control (Public/Private with expiration and wallet-based grants)
- ✅ On-Chain Journal (public article listing with search and filters)

**Technical Stack:**
- Frontend: Next.js 16.1.0 + Tailwind CSS + next-intl (i18n)
- Backend: Express + TypeScript
- Database: PostgreSQL
- Blockchain: Solana (Anchor)
- Storage: Arweave via Irys
- Editor: TipTap
- AI: Google Gemini API (with language-aware responses)
- Authentication: JWT with Solana wallet signature

### 2. ARCHITECTURE.md - Technical Decisions
**Structure:** Monorepo with pnpm workspaces

```
aurora-scholar/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   ├── contracts/    # Anchor smart contracts
│   ├── sdk/          # Shared SDK
│   └── ui/           # UI components
```

**Main Decisions:**
- **Arweave via Irys** (not IPFS) - permanent storage, single payment
- **PostgreSQL** - metadata, cache, full-text search
- **TipTap** - modern rich-text editor
- **Anchor** - Solana framework for smart contracts
- **WebSocket** - real-time communication with AI agent

**Smart Contracts:**
- `publish_article()` - hash, declared intuition hash, AI scope, and metadata registration
- `create_board()` - board creation (Phase 2)
- `submit_to_board()` - article submission
- `record_evaluation()` - on-chain evaluations

**ZK Compatibility:**
- Architecture designed to be ZK-compatible (Phase 3)
- Future ZK circuits can prove authenticity without revealing content

### 3. ROADMAP.md - Project Evolution

**Phase 1: MVP (Hackathon)**
- Base editor + AI assistant
- On-chain publication
- Access control
- On-chain journal

**Phase 2: Post-Hackathon**
- **Custom Agents** (based on authors, sources, or data)
- **Evaluation Board System** (public/private/hybrid)
- **Academic Ethics DAO** (decentralized governance)
- **Gamified Trails** (education on academic ethics)
- Content type extension (TCCs, monographs, etc.)
- Advanced source plugins
- Decentralized peer review system
- On-chain citation system

**Phase 3: Expansion**
- Integrations (ORCID, DOI, databases)
- Scientific reputation tokens (SBTs)
- Knowledge marketplace
- Mobile apps (iOS/Android)
- Browser extension
- Public API
- **Zero-Knowledge Proofs** (future vision for privacy-preserving verification)

### 4. USE_CASES.md - Detailed Use Cases
**15 complete use cases** with Mermaid diagrams:

**MVP (UC01-UC08):**
- UC01: User writes article with always-active AI assistant (Three-Layer System)
  - Declared Intuition (Layer 1)
  - Linguistic Mediation (Layer 2)
  - Coherence Monitoring (Layer 3)
- UC02: User uploads declared sources
- UC03: Public publication (with intuition hash and AI scope)
- UC04: Private publication
- UC05: Temporary sharing
- UC06: Journal viewing
- UC07: Authenticity verification
- UC08: Continuous AI agent processing
- UC15: Chat for specific questions

**Phase 2 (UC09-UC14):**
- UC09: Evaluation board creation
- UC10: Article linking to board
- UC11: Article evaluation
- UC12: Community voting (hybrid boards)
- UC13: Correction period
- UC14: Custom agent configuration

**Characteristics:**
- All diagrams corrected and functional
- Generic terminology (no fixed roles)
- Contextual permissions (not role-based)

### 5. PITCH.md - Project Presentation
**3-minute script** for hackathon:

1. **Problem (0:00-0:20)**: Academic text authenticity
2. **Solution (0:20-1:00)**: Editor + Ethical AI + Blockchain
3. **Why Solana (1:00-1:50)**: Speed, cost, transparency
4. **Demo (1:50-2:40)**: Complete publication flow
5. **Future Vision (2:40-3:00)**: DAO, agents, boards

**Alternative versions:**
- Short version (30 seconds)
- Long version (5 minutes)

### 6. DIAGRAMS/ - Visual Diagrams

**architecture-diagram.md:**
- ASCII architecture
- Mermaid component diagram
- Data flow between components
- Architecture layers
- Complete publication flow

**workflow-student-editor.md:**
- Main flow: write and publish
- Sequence: complete publication
- Temporary access
- AI assistant (always-active agent)
- Journal viewing
- Article states

**workflow-board-evaluation.md:**
- Board creation and evaluation
- Complete public board
- Correction period
- Submission states
- Comparison: public vs private

### 7. BRANDING/ - Visual Identity

**naming-rationale.md:**
- **Aurora**: Clarity, authenticity, origin of light
- **Scholar**: Academic, scholar, knowledge
- Suggested tagline: "Academic Authorship & On-Chain Publishing"
- Documented alternatives considered

**logo-ideas.md:**
- 4 main visual concepts
- Color palette (orange/yellow/blue)
- Typography (Inter + academic serif)
- Usage guidelines
- Design references

## 🎯 Main Differentiators

### 1. Three-Layer Ethical System
- **Layer 1: Declared Intuition** - User states initial idea (registered on-chain)
- **Layer 2: Linguistic Mediation** - AI guides structure and language (never writes)
- **Layer 3: Coherence Monitoring** - AI validates consistency between intuition, sources, and text
- **Always-active agent** - continuously observes document
- **Does not write** - only guides, explains, suggests
- **Authenticity alert** - detects too automated text
- **Interactive chat** - for specific questions
- **Declared Sources** - AI uses only explicitly declared sources

### 2. Verifiable Authenticity
- SHA-256 hash of content registered on-chain
- SHA-256 hash of declared intuition registered on-chain
- AI scope registered on-chain (what AI was allowed to do)
- Immutable timestamp
- Author identified by wallet
- Public verification on Solana Explorer
- ZK-compatible architecture (future: prove without revealing)

### 3. Flexible Permission System
- **No fixed roles** - contextual permissions
- Any user can create board, evaluate, publish
- Reputation system to encourage participation
- Boards: Open, Restricted, Hybrid

### 4. Permanent Storage
- Full content on Arweave (permanent, single payment)
- Metadata and hash on Solana (verifiable)
- Permanent and immutable links

## 🔄 Main Flows

### Article Publication (9-Step Flow)
1. User declares initial intuition (Layer 1)
2. User uploads declared sources (PDFs, links, etc.)
3. User writes with AI guidance (Layer 2 - Linguistic Mediation)
4. AI monitors coherence (Layer 3 - Coherence Monitoring)
5. User reviews and refines
6. User finalizes work
7. Upload to Arweave (permanent storage)
8. On-chain registration on Solana (content hash + intuition hash + AI scope)
9. Share: Public (On-Chain Journal) or Private (temporary links)

### Board System (Phase 2)
1. User creates board (public/private/hybrid)
2. Defines evaluators (if restricted/hybrid)
3. User links article to board
4. Official evaluators evaluate
5. Community votes (if hybrid board)
6. Aggregated result calculated
7. Correction period (if needed)
8. New version created and resubmitted

## 📊 Success Metrics

### MVP (Hackathon)
- ✅ Functional on-chain publication
- ✅ 3-minute demo
- ✅ Production deployment
- ✅ Smart contract on devnet

### Phase 2
- 100+ articles published
- 10+ universities using
- 50+ custom agents created
- DAO with 20+ active members

### Phase 3
- 1000+ articles published
- Integration with 5+ academic platforms
- Mobile apps with 10k+ downloads
- API with 100+ developers

## 🛠️ Main Technologies

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js + Tailwind CSS | 16.0.10 |
| Backend | Express + TypeScript | latest |
| Database | PostgreSQL | latest |
| Blockchain | Solana (Anchor) | latest |
| Storage | Arweave via Irys | latest |
| Editor | TipTap | latest |
| AI | OpenAI API or other LLM | - |

## 📝 Documentation by File

### Main Files
- **MVP.md** (304 lines) - MVP features, stack, hackathon requirements
- **ARCHITECTURE.md** (821 lines) - Technical decisions, structure, smart contracts
- **ROADMAP.md** (384 lines) - Evolution phases, timeline, metrics
- **USE_CASES.md** (1856 lines) - 15 use cases with Mermaid diagrams
- **PITCH.md** (306 lines) - Presentation script, short/long versions

### Diagrams
- **architecture-diagram.md** (207 lines) - Visual architecture
- **workflow-student-editor.md** (296 lines) - Editor flows
- **workflow-board-evaluation.md** (238 lines) - Board flows

### Branding
- **naming-rationale.md** (141 lines) - Name rationale
- **logo-ideas.md** (220 lines) - Visual concepts and guidelines

## ✅ Documentation Status

### Complete and Updated
- ✅ All Mermaid diagrams corrected
- ✅ Generic terminology (no fixed roles)
- ✅ Three-Layer Ethical System documented
- ✅ Declared Intuition (Layer 1) documented
- ✅ Declared Sources documented
- ✅ Coherence Monitoring (Layer 3) documented
- ✅ Always-active AI agent documented
- ✅ Board system detailed
- ✅ Chat for specific questions included
- ✅ Correction and resubmission flows
- ✅ Reputation system documented
- ✅ ZK compatibility mentioned (Phase 3)

### Consistency
- ✅ Uniform terminology across all files
- ✅ Functional cross-references
- ✅ Diagrams aligned with use cases
- ✅ Architecture aligned with MVP

## 🚀 Next Steps

1. **MVP Implementation** (Hackathon)
   - Monorepo setup
   - Editor development
   - Solana integration
   - Deploy and demo

2. **Post-Hackathon**
   - Custom agents
   - Board system
   - Academic DAO
   - Gamified trails

3. **Expansion**
   - Academic integrations
   - Mobile apps
   - Public API
   - Marketplace

## 📖 How to Use This Documentation

1. **For Developers**: Start with `ARCHITECTURE.md` and `MVP.md`
2. **For Product Managers**: Focus on `MVP.md`, `ROADMAP.md` and `USE_CASES.md`
3. **For Presentations**: Use `PITCH.md` and diagrams in `DIAGRAMS/`
4. **For Design**: Consult `BRANDING/` for visual identity
5. **For Planning**: See `ROADMAP.md` for future evolution

## 🔗 Quick Links

- [MVP](./MVP.md) - Minimum viable product
- [Architecture](./ARCHITECTURE.md) - Technical decisions
- [Roadmap](./ROADMAP.md) - Project evolution
- [Use Cases](./USE_CASES.md) - Detailed flows
- [Pitch](./PITCH.md) - Presentation
- [Diagrams](./DIAGRAMS/) - Visualizations
- [Branding](./BRANDING/) - Visual identity

---

**Status:** Complete documentation ready for implementation
