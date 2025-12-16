# Aurora Scholar - MVP

> Decentralized scientific publishing platform on Solana

## Vision

**Assisted Academic Writing Monitoring** - A platform where users write their own academic texts with ethical AI guidance (never substitution), ensuring authenticity, transparency, and immutable authorship through blockchain.

The AI acts as a **monitor** that guides, explains, and validates - never writes for the user.

## MVP Objective

Allow a user to write an academic text following a complete ethical workflow, receive ethical AI guidance, and register the final version on Solana, making it:

- **Public** (appears in On-Chain Journal)
- **Private** (accessible via link + optional expiration)

All in a simple, functional application that can be demonstrated in a 3-minute video.

## Technical Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js + Tailwind CSS | 16.0.10 / 3.x |
| Backend | Express + TypeScript | latest |
| Database | PostgreSQL | latest |
| Blockchain | Solana (Anchor) | latest |
| Storage | Arweave via Irys | latest |
| Editor | TipTap | latest |

## MVP Features (Hackathon)

### Core (Must Have)

#### 1. Academic Article Editor

**Minimum features:**
- Rich-text editor with TipTap (minimalist Google Docs style)
- Markdown support
- Local draft saving (localStorage)
- Article preview
- Sidebar for source management

**Interface:**
- **Declared Intuition field** - User states their initial idea/declaration
- Main text box (rich text)
- Sidebar with AI suggestions (continuous updates)
- AI agent status indicator (connected/disconnected)
- "Ask AI Guidance" button (opens chat for specific questions)
- "Register on Blockchain" button
- "Preview Article" button

#### 2. Three-Layer Ethical System

Aurora Scholar implements a **Three-Layer Ethical System** that ensures authentic academic writing:

**Layer 1: Declared Intuition**
- User declares their initial idea/vision for the article
- This declaration is captured and registered on-chain
- Serves as the foundation for coherence monitoring
- Hash of declared intuition is stored on Solana

**Layer 2: Linguistic Mediation (AI Assistant)**
- AI acts as a **mediator**, not a writer
- Always-active agent that continuously observes the document
- Provides real-time guidance on structure, language, and references
- **Never writes** - only suggests, explains, and guides
- Based exclusively on declared sources provided by user

**Layer 3: Coherence Monitoring**
- AI continuously validates consistency between:
  - Declared intuition (Layer 1)
  - Declared sources (uploaded by user)
  - Final written text
- Alerts if there are inconsistencies or if text seems too automated
- Ensures the final work aligns with user's original intention

**How it works:**
- ✅ Automatically connects when editor opens
- ✅ Observes text changes in real-time (2-3s debounce)
- ✅ Continuously analyzes text + declared sources + declared intuition
- ✅ Updates sidebar with real-time suggestions
- ✅ Detects when text is pasted (not written)
- ✅ Immediately alerts if text seems too automated
- ✅ Monitors coherence between all three layers

**Chat for Specific Questions:**
- ✅ "Ask AI Guidance" button opens interactive chat
- ✅ User can ask specific questions about the text
- ✅ Agent responds based on document context + declared sources
- ✅ Conversation history maintained during session
- ✅ Chat complements continuous agent observation

**What the AI does (does NOT write):**
- ✅ Explains concepts
- ✅ Suggests structure (abstract, introduction, methodology, etc.)
- ✅ Indicates references based on declared sources
- ✅ Light grammatical review
- ✅ Methodological help
- ✅ Alerts if text seems excessively automated (AI-pasted)
- ✅ Guides user to rewrite with more criticality
- ✅ Proposes structure according to ABNT/General standards
- ✅ Monitors coherence between intuition, sources, and text

**Security rules:**
- AI never writes the complete text
- AI only corrects, explains, guides, and alerts
- Based exclusively on declared sources provided by user
- No hallucinations or automatic writing
- Continuous validation of text authenticity
- Coherence validation between all three layers

**Technologies:**
- WebSocket for real-time communication
- OpenAI API or other LLM via backend
- Debounce to optimize requests
- Vectorization for declared sources processing

**Customizable Agents (Phase 2 - Future):**
- User will be able to configure specific agents:
  - **Author-Based**: Searches internet for author information (e.g., "Paulo Freire Agent", "Foucault Agent")
  - **Source-Based**: Uses specific source loaded by user
  - **Data-Based**: Uses dataset or user's own knowledge
- Each agent has its own style, rules, and knowledge
- Agents can be shared between users

#### 3. Declared Sources (NotebookLM-style)

**Concept:** Users explicitly declare and upload sources that the AI can use as reference. The AI **never generates new content** - it only guides based on these declared sources.

**Supported file types:**
- PDFs (books, scientific articles)
- Links (web pages, articles)
- Images (with OCR for text extraction)
- Videos (with automatic transcription)
- Audio (with automatic transcription)
- Plain text
- Bibliographic references

**Features:**
- Multiple file/link upload
- List of declared sources visible in sidebar
- AI processes and vectorizes sources for reference
- AI uses **only** these declared sources as knowledge base
- Sources available for consultation during writing
- **Ethical limit**: AI never generates content beyond what's in declared sources

**Processing:**
- Text extraction from PDFs, images, videos, audio
- Vectorization and embedding for AI reference
- Metadata extraction (title, author, date, etc.)
- Indexed for fast retrieval during AI guidance

#### 4. Wallet Connect

- Phantom/Solflare integration
- Authentication via wallet
- Connection required for on-chain publication

#### 5. On-Chain Publication

**Storage:**
- Full content → Arweave via Irys
- Metadata + hash + timestamp → Solana Devnet

**Items registered on blockchain:**
- SHA-256 hash of final text
- SHA-256 hash of declared intuition (Layer 1)
- Timestamp
- Author (public wallet)
- AI scope (what AI was allowed to do - registered for transparency)
- Status: Public or Private
- Private access expiration date (optional)
- Link to content on Arweave

**Technologies:**
- Solana Web3.js or Anchor
- Upload via Irys SDK (Arweave)

#### 6. Privacy and Temporary Access System

**Publication options:**

**🔒 Private:**
- Generates link with access token
- Sets expiration:
  - 24 hours
  - 7 days
  - 30 days
  - No expiration (until manually revoked)
- Access hash verified on-chain
- Users with link can view while access is valid

**🌐 Public:**
- Goes directly to "On-Chain Journal"
- Appears for everyone
- Visible in public listing

#### 7. On-Chain Journal (Display Page)

**Features:**
- List of public articles
- Displays: title, author, date, on-chain hash
- Link to view PDF/HTML on Arweave
- Link to verify hash on Solana Explorer
- Basic filters (date, author)
- Search by title/author

### Nice to Have (if time permits)

- [ ] Basic researcher profile
- [ ] Article version history
- [ ] Formatted PDF export
- [ ] QR Code sharing
- [ ] Access notifications (when someone views private article)
- [ ] Dashboard with published article statistics

## Economic Model

### MVP (Hackathon)
- **Free for users** - Platform completely free
- **User pays only:** On-chain fees (Solana + Arweave)
- **Platform covers:** AI and hosting costs
- **Focus:** Validate concept and functionality

### Future Vision (Phase 3)
- **AI Freemium Model:**
  - Free tier: 100-200 requests/month
  - Paid tier: 1000+ requests/month or unlimited
  - Maintains democratic access
  - Sustainability without excluding users

## Future Features (Roadmap)

> Do not implement in hackathon - only document

- **Evaluation Board System**
  - Users create public or private boards
  - Evaluator registration
  - Article submission to boards
  - Evaluation by official evaluators
  - Community voting in public boards
  - Correction period after evaluation
  - Version history and corrections
- Decentralized peer review
- On-chain citation system
- Academic governance DAO (users/authors/institutions)
- Author-based custom agents
- Advanced dataset/source upload
- Gamified academic ethics trails
- Scientific reputation tokens
- ORCID integration
- User authenticity metrics
- Badge and certification system

## Submission Requirements (Hackathon)

According to [Solana Student Hackathon Fall 2025](https://solana.com/universities/hackathon-fall-2025):

- [ ] **Open-source code** (public GitHub repository)
- [ ] **Smart contracts deployed** on devnet or mainnet
- [ ] **Demo video** up to 3 minutes
- [ ] **Functional deployment** (frontend + backend)
- [ ] **README** with setup instructions

**Hackathon Timeline:**
- Development period: 11/24/2024 - 12/19/2024
- Submission deadline: 12/19/2024

## Success Criteria (Hackathon)

1. **Functional**: Successfully publish an article from editor to blockchain
2. **Demo**: Complete flow working for 3-minute video
3. **Code**: Clean, documented, running locally
4. **Pitch**: Clear vision of problem and solution

## 9-Step User Flow

1. **Declare Intuition** - User states their initial idea/declaration
2. **Upload Declared Sources** - PDFs, links, videos, etc. (AI uses only these)
3. **Write with AI Guidance** - Real-time ethical assistance (AI never writes)
4. **AI Monitors Coherence** - Continuous validation of consistency
5. **Review and Refine** - User reviews suggestions and improves
6. **Generate Final Version** - User finalizes their work
7. **Register on-Chain** - Hash + timestamp + AI scope on Solana
8. **Store Permanently** - Full content on Arweave
9. **Share** - Public (On-Chain Journal) or Private (temporary links)

## Demonstration Flow (3-minute Video)

1. **User opens the site** (0:00-0:10)
   - Clean and direct interface
   - Buttons: "Create Article" and "On-Chain Journal"

2. **Opens editor and follows workflow** (0:10-0:40)
   - Declares initial intuition
   - Uploads declared sources (PDF, link)
   - Starts writing with AI guidance
   - Shows AI suggestions (does not write)
   - Shows coherence monitoring

3. **User registers on-chain** (0:40-1:30)
   - Chooses public or private
   - Shows: "Uploading to Arweave..."
   - Shows: "Hash registered on Solana (including intuition hash and AI scope)."
   - Displays hash and verification link

4. **Opens On-Chain Journal** (1:30-2:00)
   - Shows newly published article
   - Views complete article
   - Verifies hash on Solana Explorer

5. **Demonstrates private access** (2:00-2:40)
   - Publishes private article
   - Generates temporary link (7 days)
   - Shares and accesses

6. **Closing** (2:40-3:00)
   - Summary of delivered value
   - Future vision (Roadmap, ZK compatibility)

## Project Structure

```
aurora-scholar/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   ├── contracts/    # Anchor smart contracts
│   ├── sdk/          # Shared SDK
│   └── ui/           # Shared UI components
├── docs/
│   ├── MVP.md        # This file
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── USE_CASES.md  # Detailed use cases
│   └── PITCH.md
├── pnpm-workspace.yaml
└── README.md
```

## Hackathon Deliverables

1. Public GitHub repository
2. Functional deployment (Vercel + Railway/Render)
3. Smart contract on devnet
4. 3-minute demo video
5. README with setup instructions

## Simplified MVP Architecture

```
Frontend (Next.js)
   |
   |— AI Assistant (API)
   |
Backend (Node/Express)
   |
   |— Upload to Arweave/Irys
   |— On-chain registration on Solana
```

## Related Documentation

- [Technical Architecture](./ARCHITECTURE.md) - Technical decisions and detailed structure
- [Roadmap](./ROADMAP.md) - Future project evolution
- [Use Cases](./USE_CASES.md) - Detailed flows with diagrams
- [Pitch](./PITCH.md) - Presentation script
