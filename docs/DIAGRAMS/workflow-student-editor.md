# Workflow - User Editor

> Detailed flows of user using the editor

## Main Flow: Write and Publish Article

```mermaid

flowchart TD
    Start([User accesses editor]) --> Write[Writes text]
    Write --> UploadSources{Add sources?}
    
    UploadSources -->|Yes| ProcessSources[Process sources]
    ProcessSources --> AskAI{Need AI help?}
    UploadSources -->|No| AskAI
    
    AskAI -->|Has question| OpenChat[Opens chat for question]
    AskAI -->|Agent observes| ReceiveSuggestions[Receives automatic suggestions]
    AskAI -->|No| ContinueWriting[Continues writing]
    
    OpenChat --> ChatResponse[Receives answer in chat]
    ChatResponse --> ContinueWriting
    
    ReceiveSuggestions --> Apply{Apply suggestions?}
    Apply -->|Yes| UpdateText[Updates text]
    Apply -->|No| ContinueWriting
    UpdateText --> ContinueWriting
    
    ContinueWriting --> MoreWriting{Continue writing?}
    MoreWriting -->|Yes| Write
    MoreWriting -->|No| Finish[Finishes article]
    
    Finish --> ConnectWallet{Wallet connected?}
    ConnectWallet -->|No| Connect[Connects wallet]
    Connect --> ChoosePrivacy{Choose public or private?}
    ConnectWallet -->|Yes| ChoosePrivacy
    
    ChoosePrivacy -->|Public| PublishPublic[Publishes as public]
    ChoosePrivacy -->|Private| SetExpiration[Sets expiration]
    SetExpiration --> PublishPrivate[Publishes as private]
    
    PublishPublic --> Upload[Upload to Arweave]
    PublishPrivate --> Upload
    
    Upload --> Register[Registers on Solana]
    Register --> Success{Success?}
    
    Success -->|Yes| CheckType{Type?}
    Success -->|No| Error[Displays error]
    
    CheckType -->|Public| ShowJournal[Appears in Journal]
    CheckType -->|Private| ShowLink[Displays private link]
    
    Error --> Retry{Try again?}
    Retry -->|Yes| Upload
    Retry -->|No| End([End])
    
    ShowJournal --> End
    ShowLink --> End
```

## Sequence Flow: Complete Publication

```mermaid

sequenceDiagram
    participant Usuario as User
    participant Editor
    participant Agent as AI Agent
    participant Backend
    participant Irys
    participant Arweave
    participant Solana
    participant DB as PostgreSQL

    Usuario->>Editor: Opens editor
    Editor->>Agent: Connects agent (WebSocket)
    Agent->>Agent: Starts continuous observation
    
    Usuario->>Editor: Writes article
    Usuario->>Editor: Adds sources
    Editor->>Backend: Upload sources
    Backend-->>Editor: Sources processed
    
    loop Agent continuously observes
        Editor->>Agent: Notifies change (debounce)
        Agent->>Backend: POST /api/ai-assistant/analyze
        Backend-->>Agent: Real-time suggestions
        Agent-->>Editor: Updates sidebar
    end
    
    alt User has specific question
        Usuario->>Editor: Clicks Ask AI Guidance
        Editor->>Editor: Opens chat
        Usuario->>Editor: Asks question
        Editor->>Backend: POST /api/ai-assistant/chat
        Backend-->>Editor: Contextualized answer
        Editor-->>Usuario: Displays answer in chat
    end
    
    Usuario->>Editor: Applies suggestions (if desired)
    
    Usuario->>Editor: Finishes article
    Usuario->>Editor: Clicks Publish
    Editor->>Editor: Displays options (Public/Private)
    Usuario->>Editor: Chooses option
    
    Editor->>Backend: POST /api/articles/publish
    Note over Editor,Backend: {content, title, isPublic, expiresIn}
    
    Backend->>Backend: Validates data
    Backend->>Backend: Generates SHA-256 hash
    
    Backend->>Irys: Upload content
    Irys->>Arweave: Stores permanently
    Arweave-->>Irys: Transaction ID
    Irys-->>Backend: arweaveId
    
    Backend->>Solana: publish_article()
    Note over Backend,Solana: {hash, arweaveId, title, isPublic}
    Solana-->>Backend: solanaTxId
    
    alt Private article
        Backend->>Backend: Generates unique token
        Backend->>DB: Saves AccessToken
    end
    
    Backend->>DB: Saves metadata
    Note over Backend,DB: {id, title, arweaveId, solanaTxId, status}
    DB-->>Backend: Confirmation
    
    Backend-->>Editor: {success, links, token?}
    Editor-->>Usuario: Displays confirmation
    
    alt Public article
        Editor->>Editor: Updates On-Chain Journal
    else Private article
        Editor->>Editor: Displays private link
    end
```

## Temporary Access Flow

```mermaid

sequenceDiagram
    participant Usuario as Author User
    participant Compartilhado as Shared User
    participant Frontend
    participant Backend
    participant DB as PostgreSQL

    Note over Usuario: Article already published as private/shared
    
    Usuario->>Frontend: Accesses management
    Frontend->>Backend: GET /api/articles/[id]/access
    Backend->>DB: Searches AccessToken
    DB-->>Backend: Current token
    Backend-->>Frontend: {token, expiresAt}
    
    Usuario->>Frontend: Chooses expiration (7 days)
    Frontend->>Backend: POST /api/access-control/update-token
    Note over Frontend,Backend: {articleId, expiresIn: 7d}
    
    Backend->>Backend: Calculates new expiration
    Backend->>DB: Updates AccessToken
    Note over Backend,DB: expiresAt = now + 7 days
    DB-->>Backend: Confirmation
    
    Backend-->>Frontend: {token, expiresAt, link}
    Frontend-->>Usuario: Displays updated link
    
    Usuario->>Compartilhado: Shares link
    Compartilhado->>Frontend: Accesses /article/[id]?token=[token]
    Frontend->>Backend: GET /api/articles/[id]?token=[token]
    
    Backend->>DB: Validates AccessToken
    DB-->>Backend: {valid, expiresAt}
    
    alt Token valid and not expired
        Backend->>Backend: Searches article
        Backend-->>Frontend: {article, content}
        Frontend-->>Compartilhado: Displays article
    else Token invalid or expired
        Backend-->>Frontend: 403 Forbidden
        Frontend-->>Compartilhado: Error: Access denied/expired
    end
```

## AI Assistant Flow

```mermaid

flowchart TD
    Start([User opens editor]) --> ConnectAgent[Agent connects automatically]
    ConnectAgent --> Observe[Agent observes document]
    
    Observe --> UserWrites[User writes or pastes text]
    UserWrites --> Debounce[Debounce 2-3 seconds]
    
    Debounce --> AgentAnalyzes[Agent analyzes text + sources]
    AgentAnalyzes --> ProcessSources{Has sources?}
    
    ProcessSources -->|Yes| ExtractSources[Extracts text from sources]
    ProcessSources -->|No| PreparePrompt[Prepares ethical prompt]
    ExtractSources --> PreparePrompt
    
    PreparePrompt --> CallLLM[Calls LLM]
    CallLLM --> ValidateResponse{Valid response?}
    
    ValidateResponse -->|No| Reject[Rejects response]
    Reject --> Retry{Try again?}
    Retry -->|Yes| CallLLM
    Retry -->|No| Error[Displays error]
    
    ValidateResponse -->|Yes| FormatResponse[Formats suggestions]
    FormatResponse --> DisplaySuggestions[Displays suggestions in sidebar]
    
    DisplaySuggestions --> UserReview[User reviews suggestions]
    UserReview --> ApplyDecision{Apply suggestion?}
    
    ApplyDecision -->|Yes| UpdateText[Updates text]
    ApplyDecision -->|No| Ignore[Ignores suggestion]
    
    UpdateText --> Continue[Continues writing]
    Ignore --> Continue
    Error --> Continue
    
    UserWrites --> HasQuestion{Has specific question?}
    HasQuestion -->|Yes| OpenChat[Opens chat]
    OpenChat --> AskQuestion[Asks question in chat]
    AskQuestion --> GetAnswer[Receives answer]
    GetAnswer --> Continue
    
    HasQuestion -->|No| Continue
    Continue --> MoreText{Continue writing?}
    
    MoreText -->|Yes| UserWrites
    MoreText -->|No| Finish([Finishes])
```

## Journal Viewing Flow

```mermaid

flowchart TD
    Start([User accesses Journal]) --> LoadArticles[Loads public articles]
    LoadArticles --> DisplayList[Displays article list]
    
    DisplayList --> UserAction{User action}
    
    UserAction -->|Filter| ApplyFilter[Applies filters]
    ApplyFilter --> UpdateList[Updates list]
    UpdateList --> DisplayList
    
    UserAction -->|Search| Search[Searches by title/author]
    Search --> UpdateList
    
    UserAction -->|Click article| SelectArticle[Selects article]
    SelectArticle --> LoadContent[Loads Arweave content]
    LoadContent --> DisplayArticle[Displays complete article]
    
    DisplayArticle --> ShowHash[Displays on-chain hash]
    ShowHash --> ShowLink[Displays Solana Explorer link]
    ShowLink --> Verify{Verify authenticity?}
    
    Verify -->|Yes| CheckHash[Compares local hash vs on-chain]
    CheckHash --> ShowResult[Displays verification result]
    Verify -->|No| End([End])
    ShowResult --> End
```

## Article States

```mermaid

stateDiagram-v2
    [*] --> Draft: Create article
    Draft --> Writing: Start writing
    Writing --> Draft: Save draft
    Writing --> AgentObserving: Agent continuously observes
    AgentObserving --> Writing: Automatic suggestions
    Writing --> ChatOpen: Open chat for question
    ChatOpen --> Writing: Answer received
    Writing --> Publishing: Finish and publish
    Publishing --> PublishedPublic: Publish as public
    Publishing --> PublishedPrivate: Publish as private
    PublishedPublic --> [*]: Article in journal
    PublishedPrivate --> Shared: Share link
    Shared --> Expired: Link expires
    Shared --> [*]: Valid access
    Expired --> [*]: Access denied
```

## Related Documentation

- [Use Cases](../USE_CASES.md) - Each case detailed
- [Architecture](../ARCHITECTURE.md) - Technical decisions
- [MVP](../MVP.md) - MVP features
