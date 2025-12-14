# Architecture Diagram - Aurora Scholar

> System architecture overview

## Architecture in Text/ASCII

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

## Mermaid Diagram - Component Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js)"]
        Editor[Editor TipTap]
        Wallet[Wallet Connect]
        Journal[On-Chain Journal]
    end
    
    subgraph Backend["Backend (Express)"]
        ArticlesCtrl[Articles Controller]
        StorageSvc[Storage Service]
        BlockchainSvc[Blockchain Service]
        AISvc[AI Assistant Service]
        AccessSvc[Access Control Service]
    end
    
    subgraph Storage["Storage"]
        PostgreSQL[(PostgreSQL)]
        Arweave[Arweave via Irys]
    end
    
    subgraph Blockchain["Blockchain"]
        Solana[Solana Devnet]
    end
    
    Editor --> ArticlesCtrl
    Editor --> AISvc
    Wallet --> BlockchainSvc
    Journal --> ArticlesCtrl
    
    ArticlesCtrl --> StorageSvc
    ArticlesCtrl --> BlockchainSvc
    ArticlesCtrl --> AccessSvc
    
    StorageSvc --> Arweave
    BlockchainSvc --> Solana
    AccessSvc --> PostgreSQL
    
    ArticlesCtrl --> PostgreSQL
    AISvc --> PostgreSQL
```

## Data Flow Between Components

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend
    participant Backend
    participant AI as AI Service
    participant Storage as Arweave
    participant Blockchain as Solana
    participant DB as PostgreSQL

    User->>Frontend: Writes article
    Frontend->>AI: Agent continuously observes (WebSocket)
    AI->>Backend: POST /api/ai-assistant/analyze
    Backend->>AI: Processes with LLM
    AI-->>Frontend: Real-time suggestions
    
    alt User has specific question
        User->>Frontend: Clicks Ask AI Guidance
        Frontend->>Frontend: Opens chat
        User->>Frontend: Asks question
        Frontend->>Backend: POST /api/ai-assistant/chat
        Backend->>AI: Processes question with context
        AI-->>Frontend: Contextualized answer
        Frontend-->>User: Displays answer in chat
    end
    
    User->>Frontend: Publishes article
    Frontend->>Backend: POST /api/articles/publish
    Backend->>Storage: Upload content
    Storage-->>Backend: arweaveId
    Backend->>Blockchain: Registers hash
    Blockchain-->>Backend: solanaTxId
    Backend->>DB: Saves metadata
    DB-->>Backend: Confirmation
    Backend-->>Frontend: Success + links
    Frontend-->>User: Confirmation
```

## Architecture Layers

```mermaid
graph LR
    subgraph Presentation["Presentation Layer"]
        Web[Next.js Frontend]
    end
    
    subgraph Application["Application Layer"]
        API[Express API]
        Services[Services Layer]
    end
    
    subgraph Data["Data Layer"]
        DB[(PostgreSQL)]
        Arweave[Arweave]
        Solana[Solana]
    end
    
    Web --> API
    API --> Services
    Services --> DB
    Services --> Arweave
    Services --> Solana
```

## Main Components

### Frontend
- **Editor**: Writing interface with TipTap
- **Wallet Connect**: Integration with Solana wallets
- **Journal**: On-chain journal viewing

### Backend
- **Articles Controller**: Manages article CRUD
- **Storage Service**: Upload to Arweave via Irys
- **Blockchain Service**: Interaction with Solana
- **AI Assistant Service**: AI processing
- **Access Control Service**: Private access management

### Storage
- **PostgreSQL**: Metadata and cache
- **Arweave**: Permanent content

### Blockchain
- **Solana**: On-chain hash and metadata registration

## Complete Publication Flow

```mermaid
flowchart TD
    Start([User finishes article]) --> Choose{Choose public<br/>or private?}
    
    Choose --> GenerateHash[Generate SHA-256 hash]
    GenerateHash --> UploadArweave[Upload to Arweave]
    UploadArweave --> GetArweaveId[Receive arweaveId]
    GetArweaveId --> RegisterSolana[Register on Solana]
    RegisterSolana --> GetSolanaTx[Receive solanaTxId]
    
    GetSolanaTx --> CheckType{Type?}
    
    CheckType -->|Public| SaveDBPublic[Save to PostgreSQL]
    CheckType -->|Private| GenerateToken[Generate access token]
    
    GenerateToken --> SaveToken[Save token to DB]
    SaveToken --> SaveDBPrivate[Save to PostgreSQL]
    
    SaveDBPublic --> ShowJournal[Appears in Journal]
    SaveDBPrivate --> ReturnLink[Returns private link]
    
    ShowJournal --> End([Completed])
    ReturnLink --> End
```

## Related Documentation

- [Complete Architecture](../ARCHITECTURE.md)
- [Use Cases](../USE_CASES.md)
- [MVP](../MVP.md)
