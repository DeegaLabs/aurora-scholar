# Aurora Scholar - Roadmap

> Project evolution from MVP to complete vision

## Overview

This roadmap is divided into phases, starting with the MVP (delivered in hackathon) and evolving into a complete decentralized academic publishing platform.

## Phase 1: MVP (Hackathon)

**Objective:** Deliver a functional, simple, stable solution fully aligned with Solana Student Hackathon requirements.

**Timeline:** 11/24/2024 - 12/19/2024

### Module 1: Base Academic Editor (Frontend)

**Features:**
- Minimalist "Google Docs" style text editor
- Ethical AI Assistant that:
  - Does not write for the user
  - Explains concepts
  - Helps structure sections (abstract, introduction, methodology...)
  - Suggests sources from what the user provides (book, PDF, text)
  - Indicates academic standards (ABNT / APA in simple form)
  - Checks rudimentary authenticity (alerts if text seems automated)
  - Guides user to rewrite with more criticality

**Technologies:** React / Next.js, OpenAI API or other LLM

### Module 2: On-Chain Publication (Solana)

**Storage:**
- Full content → Arweave via Irys
- Metadata + hash + timestamp → Solana Devnet

**Publication options:**
- **Public:** Appears in "On-Chain Journal"
- **Private:** Generates access token, user can share link with other users

### Module 3: Access Control (Private / Public)

**Features:**
- Private link with validity:
  - 24 hours
  - 7 days
  - 30 days
  - Unlimited (until manually revoked)
- Access hash verified on-chain
- Users with link can view private article while access is valid

### Module 4: On-Chain Academic Journal (Reader)

**Features:**
- Lists public articles (title, author, course, date)
- Opens PDF/HTML saved on Arweave
- Displays hash and blockchain timestamp
- Allows authenticity verification
- Basic filters (date, author)
- Search by title/author

### Hackathon Deliverables

- ✅ Working editor
- ✅ Explanatory AI
- ✅ Functional on-chain publication
- ✅ List of public articles (on-chain journal)
- ✅ Private access with validity
- ✅ Up to 3 min video demonstrating everything

## Phase 2: Post-Hackathon (Evolution)

**Objective:** Expand features and create decentralized academic ecosystem.

### 2.1. Custom Agents

**Feature:**
Users can configure specific AI agents that continuously observe the document, each with its own style, knowledge, and rules. Agents are always active, not just when requested.

**Technical Evolution - Python Microservice (Optional):**

As custom agents become more complex (embedding processing, advanced chains, local models), consider evolving to hybrid architecture:

- **Python microservice** for heavy AI processing
  - LangChain/AutoGen for multi-agent systems
  - Embedding processing and vectorization
  - Local models (optional)
  - Complex reasoning chains

- **Node.js maintains orchestration**
  - API Gateway and WebSocket
  - Frontend integration
  - Communication with PostgreSQL and Solana

- **Inter-service communication**
  - HTTP REST or gRPC
  - Message queue (optional) for asynchronous processing

**Decision:** Evaluate need based on agent complexity. If light processing continues sufficient, keep Node.js. If heavy ML needed, migrate to Python microservice.

**Agent Types:**

**1. Author-Based Agents:**
- System searches internet for specific author information
- Examples: "Paulo Freire Agent", "Foucault Agent", "Darwin Agent", "Piaget Agent", "Kant Agent"
- Agent incorporates author's thinking style, concepts, and theories
- Author sources and knowledge are automatically searched on internet (free to search)

**2. Source-Based Agents:**
- User selects specific source already loaded
- Agent uses only that source as knowledge base
- Useful for work focused on a specific work
- Agent suggests based exclusively on selected source

**3. Data-Based Agents:**
- User uploads dataset or own knowledge
- Agent incorporates this knowledge into its prompt
- Useful for specific areas or institutional knowledge
- Allows complete agent personalization

**Each agent characteristics:**
- Custom prompt based on type
- Allowed sources
- Configurable ethical limit
- Writing tone (formal, informal, critical)
- Anti-plagiarism rules
- Thinking style
- Specific concepts and theories
- Knowledge areas

**How it works:**
- Agent always active (continuously observes document)
- Automatically connects when editor opens
- Analyzes text in real-time as user writes or pastes
- User can have multiple agents configured
- Can switch between agents in editor
- Agents can be shared between users
- Public agents can be discovered and reused

**Fundamental rule:** Agents guide, but never write for the user.

### 2.2. Evaluation Board System

**Main features:**

**Board Creation:**
- Users create boards (public or private)
- Boards can be public, private, or hybrid
- Evaluator registration (by wallet or email) - if Restricted/Hybrid mode
- Deadline definition (submission and evaluation)
- Configurable evaluation criteria

**Article Linking:**
- Users link already published articles to boards
- Criteria validation before linking
- Automatic notification to evaluators
- On-chain registration (if public board)

**Evaluation:**
- Official evaluators evaluate articles
- Scoring system or approval/rejection
- Comments and detailed feedback
- Correction suggestions
- On-chain evaluation registration

**Public Boards:**
- Any user can view submitted articles
- Community can vote (approve/reject)
- Weight system: community votes (30%) + official evaluations (70%)
- Aggregated result automatically calculated
- Total process transparency

**Correction Period:**
- After evaluation indicating need for correction
- Author user receives detailed feedback
- Defined period for corrections (e.g., 7 days)
- New article version creation
- Complete version history maintained
- Resubmission for re-evaluation
- Evaluators can approve corrections directly

**Technologies:**
- Solana smart contracts for public boards
- PostgreSQL for private boards and metadata
- Notification system
- On-chain version history

**Benefits:**
- Transparent and verifiable evaluation process
- Community participation in public boards
- Immutable evaluation history
- Traceable and verifiable corrections

### 2.3. Academic Ethics DAO

**Participants:**
- Users
- Institutions
- Reviewers
- Researchers

**Features:**
- Vote on ethics rules
- Decide AI limits
- Review public articles
- Suggest educational trails
- Validate authors and agents
- Publish guidelines that editor automatically follows

**Result:** Creates a "decentralized ethics" of knowledge.

### 2.4. Gamified Trails

**Educational trails:**
- Ethics in AI use
- Scientific research
- How to structure articles
- Standards and references
- Research methodology
- Academic writing

**Reward system:**
- Badges for trail completion
- Educational tokens (non-financial)
- Access to new agents
- Unlock advanced features
- On-chain certifications

### 2.5. Content Type Extension

**Beyond articles:**
- Academic posts
- Monographs
- TCCs (Course Completion Works)
- Technical reports
- Reviews
- Critical summaries
- Class notes
- All user intellectual production

### 2.6. Advanced Source Plugins

**Source types:**
- Books (integration with digital libraries)
- PDFs (with improved OCR)
- Videos (with transcription and analysis)
- Audio (with transcription and analysis)
- Images (with advanced OCR)
- User's own notes
- Scientific articles (integration with databases)

**Feature:** AI reads material and guides based exclusively on these sources.

### 2.7. Decentralized Peer Review System

**Features:**
- Users can review public articles
- On-chain comment system
- Immutable review history
- Reviewer reputation
- Incentives for quality review

### 2.8. On-Chain Citation System

**Features:**
- Verifiable on-chain citations
- Permanent links between articles
- Impact metrics
- Citation tracking
- Academic knowledge graph

## Phase 3: Expansion and Integration

**Objective:** Make Aurora Scholar a complete platform integrated with the academic ecosystem.

### 3.1. Academic Integrations

- **ORCID:** Integration with researcher profiles
- **DOI:** On-chain DOI generation for articles
- **Databases:** Integration with SciELO, PubMed, etc.
- **Libraries:** Integration with university library systems
- **LMS:** Integration with Moodle, Canvas, etc.

### 3.2. Scientific Reputation Tokens

**Features:**
- Non-transferable tokens (SBTs) for academic achievements
- Verifiable on-chain reputation
- Portable academic history
- Decentralized credential system

### 3.3. AI Freemium Model

**Objective:** Sustainability through subscription model for AI use, maintaining democratic access.

**Subscription Tiers:**

**Free:**
- 100-200 AI requests/month
- Always-active agent (with increased debounce)
- Basic chat (5-10 questions/month)
- Upload up to 3 simultaneous sources
- Sufficient for small/medium articles

**Scholar (Paid - Monthly):**
- 1000+ AI requests/month
- Always-active agent (unlimited)
- Unlimited chat
- Custom agents (up to 3)
- Unlimited source upload
- Processing priority
- Advanced authenticity analysis

**Pro (Paid - Monthly):**
- Unlimited requests
- All Scholar features
- Unlimited custom agents
- API access for integrations
- Priority support
- Advanced analytics

**Institutional:**
- For universities/institutions
- Licenses per student/researcher
- Usage and analytics dashboard
- Dedicated support
- LMS integration
- Custom pricing

**Implementation:**
- Rate limiting per user
- Token/request counter
- Automatic monthly reset
- Limit notifications
- Stripe/Paddle integration
- Webhook to update limits

### 3.4. Knowledge Marketplace

**Features:**
- Premium article publishing
- Content subscription system
- Educational resource sharing
- Monetization for authors (optional)

### 3.5. Mobile Applications

**Features:**
- iOS and Android app
- Offline editing
- Automatic synchronization
- Review and comment notifications

### 3.6. Browser Extension

**Features:**
- Authorship detector in texts
- On-chain article verification
- Integration with academic sites
- Quick article publish

### 3.7. Public API

**Features:**
- Complete REST API
- SDK for developers
- Webhooks for integrations
- Complete documentation

## Timeline and Milestones

### Q1 2025 (Post-Hackathon)
- Custom agents (MVP)
- Academic DAO (prototype)
- Gamified trails (first trail)

### Q2 2025
- Complete Academic DAO
- Peer review system
- ORCID integration

### Q3 2025
- On-chain citation system
- Reputation tokens
- Browser extension

### Q4 2025
- Mobile apps
- Knowledge marketplace
- Public API

## Phase Dependencies

```
Phase 1 (MVP)
    │
    ├─→ Phase 2.1 (Agents) ──→ Phase 2.2 (DAO)
    │                              │
    ├─→ Phase 2.3 (Trails) ───────┘
    │                              │
    └─→ Phase 2.4 (Extension) ────┴─→ Phase 3 (Expansion)
```

## Success Metrics

### Phase 1 (MVP)
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

## Technical Considerations

### Scalability
- Architecture prepared for growth
- CDN usage for Arweave content
- Efficient article indexing
- Smart caching

### Security
- Smart contract auditing
- Rigorous access validation
- Personal data protection
- LGPD/GDPR compliance

### Sustainability

**MVP (Hackathon):**
- Platform completely free for users
- User pays only on-chain fees (Solana + Arweave)
- Platform covers AI and hosting costs
- Focus on validating concept and functionality

**Phase 2 (Post-Hackathon):**
- Reputation system (non-financial)
- Academic DAO for governance
- Funding via DAO treasury (optional)
- University partnerships
- Open source core

**Phase 3 (AI Freemium Model):**
- **Free Tier:**
  - 100-200 AI requests/month
  - Always-active agent (limited)
  - Basic chat (5-10 questions/month)
  - Sufficient for small/medium articles
  
- **Paid Tier (Scholar/Pro):**
  - 1000+ AI requests/month
  - Always-active agent (unlimited)
  - Unlimited chat
  - Custom agents
  - Unlimited source upload
  - Processing priority
  
- **Institutional Tier:**
  - For universities/institutions
  - Licenses per student
  - Usage dashboard
  - Priority support

**Justification:**
- Covers AI API costs (OpenAI/Anthropic)
- Maintains democratic access (generous free tier)
- Known and accepted market model
- Allows sustainability without excluding users

## Related Documentation

- [MVP](./MVP.md) - MVP details delivered in hackathon
- [Architecture](./ARCHITECTURE.md) - Technical decisions and structure
- [Use Cases](./USE_CASES.md) - Detailed flows
- [Pitch](./PITCH.md) - Project presentation
