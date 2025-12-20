# Aurora Scholar - Architecture

> Technical decisions and monorepo structure

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │
│  │ Editor  │  │ Wallet  │  │ Journal │  │ Profile (future)    │ │
│  │ TipTap  │  │ Connect │  │ View    │  │                     │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └─────────────────────┘ │
└───────┼────────────┼───────────┼────────────────────────────────┘
        │            │           │
        ▼            ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Articles    │  │ Storage     │  │ Blockchain              │  │
│  │ Controller  │  │ Service     │  │ Service                 │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ AI          │  │ Access      │  │                         │  │
│  │ Assistant   │  │ Control     │  │                         │  │
│  │ Service     │  │ Service     │  │                         │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
    ┌──────────┐    ┌──────────┐          ┌──────────┐
    │PostgreSQL│    │ Arweave  │          │  Solana  │
    │ (metadata│    │ (content)│          │(on-chain)│
    └──────────┘    └──────────┘          └──────────┘
```

## Monorepo Structure

```
aurora-scholar/
├── apps/
│   ├── web/                      # Next.js 16.1.0 frontend with i18n
│   │   ├── src/
│   │   │   ├── app/              # App Router
│   │   │   │   ├── page.tsx      # Home/Landing
│   │   │   │   ├── editor/       # Article editor
│   │   │   │   ├── journal/      # Article listing
│   │   │   │   └── article/[id]/ # View article
│   │   │   ├── components/
│   │   │   │   ├── editor/       # TipTap components
│   │   │   │   ├── wallet/       # Wallet connect
│   │   │   │   └── ui/           # Shared UI
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── types/            # TypeScript types
│   │   │   ├── utils/            # Utility functions
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                      # Express backend
│       ├── src/
│       │   ├── index.ts          # Entry point
│       │   ├── routes/
│       │   │   ├── articles.ts
│       │   │   ├── ai-assistant.ts
│       │   │   ├── access-control.ts
│       │   │   └── boards.ts            # Boards (Phase 2)
│       │   ├── controllers/
│       │   │   ├── articles.controller.ts
│       │   │   ├── ai-assistant.controller.ts
│       │   │   └── boards.controller.ts # Boards (Phase 2)
│       │   ├── services/
│       │   │   ├── storage.service.ts    # Arweave/Irys
│       │   │   ├── blockchain.service.ts # Solana
│       │   │   ├── ai-assistant.service.ts # AI Assistant
│       │   │   ├── access-control.service.ts # Access control
│       │   │   └── board.service.ts      # Evaluation boards (Phase 2)
│       │   ├── models/
│       │   │   └── article.model.ts
│       │   ├── middleware/
│       │   │   ├── error-handler.ts
│       │   │   └── validation.ts
│       │   ├── types/            # TypeScript types
│       │   ├── utils/            # Utility functions
│       │   └── config/
│       │       └── database.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── packages/
│   ├── contracts/                # Anchor smart contracts
│   │   ├── programs/
│   │   │   └── aurora-scholar/
│   │   │       └── src/
│   │   │           └── lib.rs
│   │   ├── tests/
│   │   ├── Anchor.toml
│   │   └── package.json
│   │
│   ├── sdk/                      # Shared SDK
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types.ts          # Shared types
│   │   │   ├── arweave.ts        # Arweave helpers
│   │   │   └── solana.ts         # Solana helpers
│   │   └── package.json
│   │
│   └── ui/                       # Shared UI components
│       ├── src/
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   └── index.ts
│       └── package.json
│
├── docs/
│   ├── MVP.md
│   ├── ARCHITECTURE.md           # This file
│   ├── ROADMAP.md
│   ├── USE_CASES.md              # Detailed use cases
│   └── PITCH.md
│
├── .env.example
├── .gitignore
├── package.json                  # Root package.json
├── pnpm-workspace.yaml
├── turbo.json                    # Turborepo config (optional)
└── README.md
```

## Technical Decisions

### 1. Monorepo with pnpm Workspaces

**Why:** Code sharing between frontend/backend, synchronized versions, single `node_modules`.

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 2. Arweave via Irys (not IPFS)

**Why:**
- Single payment = guaranteed permanence
- Native integration with Solana ecosystem
- Irys SDK is simple and well-documented
- Metaplex uses Arweave as standard

**Upload Flow:**
```
Article (JSON) → Irys SDK → Arweave → Transaction ID → Solana (registration)
```

### 3. PostgreSQL for Metadata

**Why:** Query caching, full-text search, indexes for fast filters.

**Simplified Schema:**
```prisma
model Article {
  id                  String   @id @default(uuid())
  title               String
  abstract            String?
  declaredIntuition   String?  // User's initial idea/declaration (Layer 1)
  declaredIntuitionHash String? // Hash of declared intuition (for on-chain registration)
  aiScope             String?  // What AI was allowed to do (registered on-chain)
  authorWallet        String
  arweaveId           String   @unique
  solanaTxId          String?  @unique
  status              Status   @default(DRAFT)
  isPublic            Boolean  @default(false)
  createdAt           DateTime @default(now())
  publishedAt         DateTime?
  declaredSources     Source[] // Declared sources
  versions            ArticleVersion[]
  submissions        Submission[]
  accessTokens        AccessToken[]
}

model Source {
  id            String   @id @default(uuid())
  articleId     String
  type          SourceType
  url           String?  // For links
  filePath      String?  // For uploaded files
  content       String?  // Extracted text from PDF, etc.
  metadata      Json?    // Title, author, date, etc.
  vectorized    Boolean  @default(false) // For AI processing
  embedding     Json?    // Vector embeddings for AI reference
  createdAt     DateTime @default(now())
  article       Article  @relation(fields: [articleId], references: [id])
  
  @@index([articleId])
}

enum SourceType {
  PDF
  LINK
  VIDEO
  AUDIO
  IMAGE
  TEXT
}

model ArticleVersion {
  id            String   @id @default(uuid())
  articleId     String
  versionNumber Int
  arweaveId     String
  hash          String
  solanaTxId    String?
  createdAt     DateTime @default(now())
  article       Article  @relation(fields: [articleId], references: [id])
}

model AccessToken {
  id            String   @id @default(uuid())
  articleId     String
  token         String   @unique
  expiresAt     DateTime?
  createdAt     DateTime @default(now())
  article       Article  @relation(fields: [articleId], references: [id])
}

model Board {
  id              String   @id @default(uuid())
  name            String
  description     String?
  type            BoardType @default(PRIVATE)
  creatorWallet   String
  solanaBoardId   String?  @unique
  submissionDeadline DateTime?
  evaluationDeadline DateTime?
  correctionPeriodDays Int? @default(7)
  createdAt       DateTime @default(now())
  evaluators      BoardEvaluator[]
  submissions     Submission[]
}

model BoardEvaluator {
  id            String   @id @default(uuid())
  boardId       String
  evaluatorWallet String
  role          String?  @default("EVALUATOR")
  board         Board    @relation(fields: [boardId], references: [id])
  
  @@unique([boardId, evaluatorWallet])
}

model Submission {
  id            String   @id @default(uuid())
  boardId       String
  articleId     String
  studentWallet String
  status        SubmissionStatus @default(PENDING)
  currentVersionId String?
  correctionDeadline DateTime?
  createdAt     DateTime @default(now())
  board         Board    @relation(fields: [boardId], references: [id])
  article       Article  @relation(fields: [articleId], references: [id])
  evaluations   Evaluation[]
  communityVotes CommunityVote[]
}

model Evaluation {
  id            String   @id @default(uuid())
  submissionId  String
  evaluatorWallet String
  score         Float?
  approved      Boolean?
  comments      String?
  suggestions   String?
  solanaEvalId  String?  @unique
  createdAt     DateTime @default(now())
  submission    Submission @relation(fields: [submissionId], references: [id])
  
  @@unique([submissionId, evaluatorWallet])
}

model CommunityVote {
  id            String   @id @default(uuid())
  submissionId  String
  voterWallet   String
  vote          VoteType
  solanaVoteId  String?  @unique
  createdAt     DateTime @default(now())
  submission    Submission @relation(fields: [submissionId], references: [id])
  
  @@unique([submissionId, voterWallet])
}

enum Status {
  DRAFT
  PUBLISHED
}

enum BoardType {
  PUBLIC
  PRIVATE
}

enum SubmissionStatus {
  PENDING
  UNDER_EVALUATION
  APPROVED
  NEEDS_CORRECTION
  REJECTED
  PENDING_REVIEW
}

enum VoteType {
  APPROVE
  REJECT
  ABSTAIN
}
```

### 4. TipTap for Editor

**Why:**
- Headless = full UI control
- Extensible (citations, math, code blocks)
- Output in JSON or HTML
- Good documentation

### 5. Anchor for Smart Contracts

**Why:** Standard Solana framework, type-safe, integrated tests.

**Contract Structure:**
```rust
// programs/aurora-scholar/src/lib.rs

#[program]
pub mod aurora_scholar {
    pub fn publish_article(
        ctx: Context<PublishArticle>,
        arweave_id: String,
        content_hash: [u8; 32],
        declared_intuition_hash: [u8; 32], // Hash of user's declared intuition (Layer 1)
        ai_scope: String, // What AI was allowed to do (for transparency)
        title: String,
        is_public: bool,
    ) -> Result<()> {
        let article = &mut ctx.accounts.article;
        article.author = ctx.accounts.author.key();
        article.arweave_id = arweave_id;
        article.content_hash = content_hash;
        article.declared_intuition_hash = declared_intuition_hash;
        article.ai_scope = ai_scope;
        article.title = title;
        article.is_public = is_public;
        article.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn update_visibility(
        ctx: Context<UpdateVisibility>,
        is_public: bool,
    ) -> Result<()> {
        require!(
            ctx.accounts.article.author == ctx.accounts.author.key(),
            ErrorCode::Unauthorized
        );
        ctx.accounts.article.is_public = is_public;
        Ok(())
    }
}

#[account]
pub struct Article {
    pub author: Pubkey,
    pub arweave_id: String,
    pub content_hash: [u8; 32],
    pub declared_intuition_hash: [u8; 32], // Hash of declared intuition (Layer 1)
    pub ai_scope: String, // What AI was allowed to do
    pub title: String,
    pub is_public: bool,
    pub timestamp: i64,
}
```

**ZK Compatibility Note:**
The contract structure is designed to be ZK-compatible. Future ZK circuits can prove:
- Content hash matches registered hash (without revealing content)
- Declared intuition hash consistency (without revealing intuition)
- Author signature validity (without revealing identity)
- AI scope compliance (without revealing sources)

### 6. Ethical AI Assistant (Always-Active Agent)

**Architecture:**
- Dedicated service in backend: `ai-assistant.service.ts`
- WebSocket connection for real-time communication
- Endpoint: `POST /api/ai-assistant/analyze` (continuous analysis)
- Endpoint: `POST /api/ai-assistant/chat` (chat for specific questions)
- Endpoint: `WS /api/ai-assistant/connect` (agent connection)
- Integration with LLM (OpenAI, Anthropic, or similar)

**Always-Active Agent:**
- Automatically connects when editor opens
- Continuously observes document changes
- 2-3 second debounce to avoid excessive requests
- Updates sidebar in real-time with suggestions

**Input:**
```typescript
{
  text: string;                    // Current document text
  declaredIntuition: string;       // User's declared intuition (Layer 1)
  declaredSources: Source[];       // Declared sources
  agentConfig?: AgentConfig;       // Agent configuration (default or custom)
  context?: string;                // Additional context
  cursorPosition?: number;        // Cursor position
}
```

**Output:**
```typescript
{
  suggestions: Suggestion[];        // Structural suggestions
  corrections: Correction[];        // Grammatical corrections
  references: Reference[];            // Suggested references (from declared sources only)
  warnings: Warning[];               // Ethics alerts
  authenticityAlerts: Alert[];      // Authenticity alerts (too automated text)
  coherenceAlerts: CoherenceAlert[]; // Coherence monitoring (Layer 3)
  timestamp: number;                 // Analysis timestamp
}
```

**Agent Configuration:**
```typescript
interface AgentConfig {
  id: string;
  name: string;
  type: 'DEFAULT' | 'AUTHOR_BASED' | 'SOURCE_BASED' | 'DATA_BASED';
  prompt: string;              // Custom prompt
  rules: string[];             // Specific rules
  style?: string;              // Writing style
  tone?: string;              // Tone (formal, informal, critical)
  knowledgeAreas?: string[];   // Knowledge areas
  ethicalLimits?: string[];    // Ethical limits
  sourceId?: string;           // Source ID (if SOURCE_BASED)
  authorName?: string;         // Author name (if AUTHOR_BASED)
  dataset?: any;               // Dataset (if DATA_BASED)
}
```

**Security rules:**
- AI never writes the complete text
- AI only corrects, explains, guides, and alerts
- Based exclusively on provided sources (or agent configuration)
- Text authenticity validation (detects too automated text)
- Response validation (ensures it didn't write text)

**Chat for Specific Questions:**
- Endpoint: `POST /api/ai-assistant/chat`
- Input:
```typescript
{
  question: string;           // User's question
  text: string;              // Current document text
  cursorPosition?: number;   // Cursor position (context)
  sources: Source[];         // Loaded sources
  chatHistory?: Message[];   // Conversation history
  agentConfig?: AgentConfig; // Agent configuration
}
```
- Output:
```typescript
{
  answer: string;            // Agent's answer
  suggestions?: string[];    // Additional suggestions
  references?: Reference[];  // Relevant references
  timestamp: number;         // Response timestamp
}
```
- Features:
  - Conversation history maintained during session
  - Document context automatically included
  - Responses based on loaded sources
  - Support for follow-up questions

**Customizable Agents (Phase 2):**
- User can create agents based on:
  - **Authors**: Searches internet for specific author information
  - **Sources**: Uses specific source loaded by user
  - **Data**: Uses dataset or user's own knowledge
- Each agent has its own configuration and prompt
- Agents can be shared between users
- Custom agent affects both continuous analysis and chat

**Technical Decision: Node.js vs Python for AI**

**For MVP: Node.js is sufficient**

**Justification:**
- ✅ Use of external AI APIs (OpenAI, Anthropic) - just HTTP calls
- ✅ Backend is already Express/TypeScript - avoids microservice complexity
- ✅ Always-active agent = WebSocket + simple HTTP calls
- ✅ High concurrency/async native to Node.js (I/O-bound)
- ✅ Direct integration with Next.js frontend
- ✅ Lower operational complexity (unified monorepo)

**MVP Implementation:**
- TypeScript service: `ai-assistant.service.ts`
- Communication via HTTP with AI APIs
- WebSocket for real-time communication
- Light processing (formatting, validation, debounce)

**Node.js Limitations for AI:**
- ❌ Limited ML libraries (vs Python: LangChain, LlamaIndex)
- ❌ Inferior performance in CPU-intensive processing
- ❌ Smaller AI ecosystem than Python

**For Phase 2 (Complex Custom Agents):**

**Consideration: Python Microservice**

When custom agents become more complex (embedding processing, local models, complex chains), consider:

- **Python microservice** for AI processing
- **Node.js as orchestrator/API gateway**
- Communication via HTTP/gRPC between services
- Python for: heavy processing, complex chains, embeddings
- Node.js for: orchestration, WebSocket, frontend integration

**Hybrid Architecture (Phase 2):**
```
Frontend (Next.js)
    ↓
Backend Node.js (Express)
    ↓
├─→ PostgreSQL (metadata)
├─→ Solana (blockchain)
└─→ Python Microservice (complex AI)
    ├─→ LangChain/AutoGen
    ├─→ Embedding processing
    └─→ Local models (optional)
```

**Decision:** Keep Node.js in MVP, evolve to hybrid architecture in Phase 2 if needed.

### 7. Private Access Control

**Architecture:**
- Service: `access-control.service.ts`
- Endpoint: `POST /api/access-control/generate-token`
- PostgreSQL table: `AccessToken`

**Flow:**
1. Article published as private
2. Backend generates unique token
3. Sets expiration (24h, 7d, 30d, or unlimited)
4. Saves to PostgreSQL
5. Returns link: `/article/[id]?token=[token]`
6. Access validation: verifies token and expiration

**Validation:**
```typescript
// Validation middleware
async function validateAccess(req, res, next) {
  const { token } = req.query;
  const accessToken = await AccessToken.findUnique({
    where: { token },
    include: { article: true }
  });
  
  if (!accessToken) {
    return res.status(404).json({ error: 'Invalid token' });
  }
  
  if (accessToken.expiresAt && accessToken.expiresAt < new Date()) {
    return res.status(403).json({ error: 'Token expired' });
  }
  
  req.article = accessToken.article;
  next();
}
```

### 8. Evaluation Board System (Phase 2)

**Architecture:**
- Service: `board.service.ts`
- Endpoints:
  - `POST /api/boards` - Create board
  - `GET /api/boards/[id]` - Get board
  - `POST /api/boards/[id]/submit` - Submit article
  - `POST /api/boards/[id]/evaluate` - Evaluate article
  - `POST /api/boards/[id]/vote` - Vote (public board)
  - `POST /api/boards/[id]/resubmit` - Resubmit after correction

**Public Boards:**
- On-chain registration on Solana
- Smart contract: `Board` account
- Community votes registered on-chain
- Total transparency

**Private Boards:**
- Stored in PostgreSQL
- Access controlled by tokens
- Evaluations only by official evaluators

**Smart Contract Structure (Public Board):**
```rust
#[account]
pub struct Board {
    pub creator: Pubkey,
    pub name: String,
    pub board_type: BoardType, // PUBLIC
    pub submission_deadline: i64,
    pub evaluation_deadline: i64,
    pub created_at: i64,
}

#[account]
pub struct Submission {
    pub board: Pubkey,
    pub article_id: String,
    pub student: Pubkey,
    pub status: SubmissionStatus,
    pub created_at: i64,
}

#[account]
pub struct Evaluation {
    pub submission: Pubkey,
    pub evaluator: Pubkey,
    pub score: Option<u8>,
    pub approved: bool,
    pub created_at: i64,
}

#[account]
pub struct CommunityVote {
    pub submission: Pubkey,
    pub voter: Pubkey,
    pub vote: VoteType, // APPROVE, REJECT, ABSTAIN
    pub created_at: i64,
}
```

**Evaluation Flow:**
1. User creates board (public or private)
2. User links article to board
3. Official evaluators evaluate
4. If public board: community votes
5. System calculates aggregated result
6. If correction needed: correction period
7. Author user corrects and resubmits
8. New evaluation or final approval

## Data Flow

### Public Article Publication (9-Step Flow)

```
1. User declares intuition (Layer 1)
2. User uploads declared sources (PDFs, links, etc.)
3. Backend processes sources (vectorization, embeddings)
4. User writes in Editor (TipTap) with AI guidance
5. AI monitors coherence (Layer 3) continuously
6. User reviews and refines
7. User connects wallet (Phantom)
8. User clicks "Publish" → Chooses "Public"
9. Frontend → Backend API (POST /api/articles/publish)
10. Backend:
    a. Generates SHA-256 hash of content
    b. Generates SHA-256 hash of declared intuition
    c. Determines AI scope (what AI was allowed to do)
    d. Uploads to Arweave via Irys
    e. Receives Arweave Transaction ID
    f. Calls Solana smart contract (publish_article with intuition hash and AI scope)
    g. Saves metadata to PostgreSQL
11. Returns confirmation + links (Solana Explorer, Arweave)
12. Article appears in On-Chain Journal
```

### Private Article Publication

```
1. User declares intuition (Layer 1)
2. User uploads declared sources
3. User writes in Editor (TipTap) with AI guidance
4. AI monitors coherence (Layer 3)
5. User connects wallet (Phantom)
6. User clicks "Publish" → Chooses "Private"
7. Sets expiration (24h, 7d, 30d, unlimited)
8. Frontend → Backend API (POST /api/articles/publish)
9. Backend:
   a. Generates SHA-256 hash of content
   b. Generates SHA-256 hash of declared intuition
   c. Determines AI scope
   d. Uploads to Arweave via Irys
   e. Calls Solana smart contract (is_public: false, with intuition hash and AI scope)
   f. Generates unique access token
   g. Saves AccessToken to PostgreSQL
   h. Saves metadata to PostgreSQL
10. Returns private link: /article/[id]?token=[token]
11. Article does NOT appear in On-Chain Journal
```

### Temporary Sharing

```
1. Article already published as private
2. User accesses management page
3. Generates new token or renews existing
4. Sets new expiration
5. Shares link with another user
6. Shared user accesses link
7. Backend validates token and expiration
8. If valid: displays article
9. If expired: returns 403 error
```

### Article Reading

```
1. User accesses /article/[id] (public) or /article/[id]?token=[token] (private)
2. Frontend fetches metadata from Backend
3. Backend:
   - If public: returns data directly
   - If private: validates token and expiration
4. Backend returns: title, author, arweaveId, solanaTxId, hash
5. Frontend fetches content from Arweave using arweaveId
6. Renders article
7. Displays link to verify hash on Solana Explorer
```

### AI Assistant Processes Request (Three-Layer System)

```
1. User declares intuition (Layer 1)
2. User uploads declared sources (PDFs, links, etc.)
3. Backend processes sources:
   a. Extracts text from PDFs, images, videos, audio
   b. Vectorizes and creates embeddings
   c. Indexes for fast retrieval
4. User writes text in editor
5. AI agent continuously observes (WebSocket)
6. Frontend → Backend API (POST /api/ai-assistant/analyze)
7. Backend:
   a. Receives text + declared intuition + declared sources
   b. Uses vectorized sources for reference (only declared sources)
   c. Sends to LLM with ethical prompt (never writes)
   d. LLM returns suggestions (not complete text)
   e. Validates response (ensures it didn't write)
   f. Monitors coherence (Layer 3) between intuition, sources, and text
8. Returns suggestions, corrections, references, coherence alerts
9. Frontend displays suggestions in sidebar in real-time
10. User decides to apply or ignore
11. Chat for specific questions (POST /api/ai-assistant/chat)
```

## Code Standards

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ArticleCard.tsx` |
| Hooks | camelCase + use | `useWallet.ts` |
| Services | camelCase + .service | `storage.service.ts` |
| Types | PascalCase | `Article`, `PublishRequest` |
| Variables | camelCase | `arweaveId`, `contentHash` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |

### Import Structure

```typescript
// 1. External
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

// 2. Internal packages
import { Article } from '@aurora-scholar/sdk'

// 3. Local components
import { ArticleCard } from '@/components'

// 4. Local Utils/Hooks
import { usePublish } from '@/hooks'
import { formatDate } from '@/utils'
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/aurora_scholar"

# Solana
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_SOLANA_RPC="https://api.devnet.solana.com"
SOLANA_PRIVATE_KEY="your-wallet-private-key"

# Arweave/Irys
IRYS_NODE="https://devnet.irys.xyz"
IRYS_PRIVATE_KEY="your-wallet-private-key"

# AI Assistant
OPENAI_API_KEY="your-openai-api-key"
# or
ANTHROPIC_API_KEY="your-anthropic-api-key"

# API
NEXT_PUBLIC_API_URL="http://localhost:3001"
PORT=3001

# Security
JWT_SECRET="your-jwt-secret"
```

## Main Dependencies

### apps/web
```json
{
  "dependencies": {
    "next": "^16.0.10",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    "@solana/wallet-adapter-react": "^0.15.0",
    "@solana/wallet-adapter-react-ui": "^0.9.0",
    "@solana/wallet-adapter-wallets": "^0.19.0",
    "@solana/web3.js": "^1.87.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### apps/api
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "@irys/sdk": "^1.0.0",
    "@coral-xyz/anchor": "^0.30.0",
    "@solana/web3.js": "^1.87.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "zod": "^3.22.0",
    "openai": "^4.20.0"
  }
}
```

### packages/contracts
```json
{
  "dependencies": {
    "@coral-xyz/anchor": "^0.30.0"
  }
}
```

## Error Handling

### Backend
- Global error middleware
- Validation with Zod
- Retry logic for Arweave upload
- Fallback for Solana transactions
- Structured logging

### Frontend
- React error boundaries
- Toast notifications for feedback
- Loading states during publication
- Wallet error handling

## Internationalization (i18n)

### Implementation

**Technology:** `next-intl` for Next.js App Router

**Structure:**
```
apps/web/
├── messages/
│   ├── en.json          # English translations
│   ├── pt-BR.json       # Portuguese (Brazil) translations
│   └── pt.json          # Portuguese (maps to pt-BR)
├── src/
│   ├── i18n.ts          # i18n configuration
│   └── middleware.ts    # Locale detection middleware
```

**Supported Languages:**
- English (EN) - Default
- Portuguese (PT-BR) - Full support

**Features:**
- Language switcher in settings (gear icon)
- Language preference stored in cookies (`NEXT_LOCALE`)
- All UI components use translations
- AI responses respect selected language
- Automatic locale detection from browser/cookie

**Translation Namespaces:**
- `common` - Common UI elements
- `editor` - Editor interface and features
- `dashboard` - Dashboard page
- `journal` - Journal page
- `publish` - Publication modals
- `wallet` - Wallet connection
- `errors` - Error messages

**AI Language Awareness:**
- Backend detects locale from `Accept-Language` header or request body
- AI system prompts adjusted based on locale
- Responses generated in user's selected language
- Portuguese (PT) triggers Brazilian Portuguese responses

**Usage Example:**
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('editor');
return <button>{t('publish')}</button>;
```

## Security

### Data Validation
- Input validation with Zod
- Editor content sanitization
- Wallet signature validation
- Rate limiting on critical APIs

### Private Access
- Unique and unpredictable tokens
- Server-side expiration validation
- On-chain authenticity verification

## Related Documentation

- [MVP](./MVP.md) - MVP overview and features
- [Roadmap](./ROADMAP.md) - Future project evolution
- [Use Cases](./USE_CASES.md) - Detailed flows with diagrams
- [Pitch](./PITCH.md) - Presentation script

## Next Steps

1. ✅ MVP.md defined
2. ✅ ARCHITECTURE.md defined
3. ✅ Monorepo initialized with pnpm
4. ✅ Next.js + Tailwind setup
5. ✅ Express + Prisma setup
6. ✅ Anchor project setup
7. ✅ MVP features implemented
8. ✅ Internationalization (i18n) implemented
9. ✅ Dashboard and Journal pages completed
10. ⏳ Phase 2 features (Evaluation Boards, Custom Agents)
