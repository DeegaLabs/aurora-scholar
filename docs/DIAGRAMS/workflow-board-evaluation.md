# Workflow - Evaluation Boards

> Detailed flows of the evaluation board system

## Main Flow: Board Creation and Evaluation

```mermaid
flowchart TD
    Start([User creates board]) --> ChooseType{Public or<br/>private board?}
    
    ChooseType -->|Public| RegisterPublic[Registers on-chain Solana]
    ChooseType -->|Private| SavePrivate[Saves to PostgreSQL]
    
    RegisterPublic --> AddEvaluators[Adds evaluators]
    SavePrivate --> AddEvaluators
    
    AddEvaluators --> SetDeadlines[Sets deadlines]
    SetDeadlines --> BoardReady[Board ready]
    
    BoardReady --> UserLinks[User links article]
    UserLinks --> Validate{Meets criteria?}
    
    Validate -->|No| Reject[Rejects linking]
    Validate -->|Yes| Accept[Accepts linking]
    
    Accept --> NotifyEvaluators[Notifies evaluators]
    NotifyEvaluators --> EvaluationPeriod[Evaluation period]
    
    EvaluationPeriod --> OfficialEval[Official evaluators evaluate]
    
    EvaluationPeriod --> PublicVote{Public board Hybrid mode?}
    PublicVote -->|Yes| CommunityVote[Community votes]
    PublicVote -->|No| CalculateResult
    
    OfficialEval --> CalculateResult[Calculates result]
    CommunityVote --> CalculateResult
    
    CalculateResult --> CheckResult{Result?}
    
    CheckResult -->|Approved| Approved[Article approved]
    CheckResult -->|Rejected| Rejected[Article rejected]
    CheckResult -->|Needs correction| CorrectionPeriod[Correction period]
    
    CorrectionPeriod --> UserCorrects[Author user corrects]
    UserCorrects --> CreateVersion[Creates new version]
    CreateVersion --> Resubmit[Resubmits to board]
    Resubmit --> EvaluationPeriod
    
    Approved --> End([End])
    Rejected --> End
```

## Sequence Flow: Complete Public Board

```mermaid
sequenceDiagram
    participant Usuario as Creator User
    participant Autor as Author User
    participant Comunidade as Community
    participant Avaliador as Evaluator
    participant Frontend
    participant Backend
    participant Solana
    participant DB as PostgreSQL

    Usuario->>Frontend: Creates public board
    Frontend->>Backend: POST /api/boards
    Backend->>Solana: create_board(type: PUBLIC)
    Solana-->>Backend: boardId
    Backend->>DB: Saves metadata
    Backend-->>Frontend: {success, boardId}
    
    Usuario->>Frontend: Adds evaluators (if Restricted/Hybrid mode)
    Frontend->>Backend: POST /api/boards/[id]/evaluators
    Backend->>DB: Saves evaluators
    Backend-->>Frontend: Confirmation
    
    Autor->>Frontend: Links article to board
    Frontend->>Backend: POST /api/boards/[id]/link-article
    Backend->>Solana: link_article_to_board()
    Solana-->>Backend: linkId
    Backend->>DB: Saves submission
    Backend->>Backend: Notifies evaluators
    Backend-->>Frontend: {success, submissionId}
    
    Avaliador->>Frontend: Evaluates article
    Frontend->>Backend: POST /api/boards/[id]/evaluate
    Backend->>Solana: record_evaluation()
    Solana-->>Backend: evaluationId
    Backend->>DB: Saves evaluation
    
    alt Public board Hybrid mode
        Comunidade->>Frontend: Votes on article
        Frontend->>Backend: POST /api/boards/[id]/vote
        Backend->>Solana: record_community_vote()
        Solana-->>Backend: voteId
        Backend->>DB: Saves vote (cache)
    end
    
    Backend->>Backend: Calculates aggregated result
    Note over Backend: official_weight (70%) * evaluations + community_weight (30%) * votes
    
    alt Result: Needs correction
        Backend->>Backend: Sets correction period
        Backend->>Backend: Notifies author
        Autor->>Frontend: Receives notification
        Autor->>Frontend: Corrects article
        Autor->>Frontend: Resubmits
        Frontend->>Backend: POST /api/boards/[id]/resubmit
        Backend->>Backend: Creates new version
        Backend->>Solana: register_version()
        Backend->>DB: Saves new version
        Backend->>Backend: Notifies evaluators
    else Result: Approved/Rejected
        Backend->>DB: Updates final status
        Backend->>Backend: Notifies all
    end
```

## Correction Period Flow

```mermaid
sequenceDiagram
    participant Usuario as Author User
    participant Avaliador as Evaluator
    participant Frontend
    participant Backend
    participant Solana
    participant DB as PostgreSQL
    participant Arweave

    Avaliador->>Backend: Evaluates with Needs Correction
    Backend->>DB: Saves evaluation
    Backend->>DB: Updates status: NEEDS_CORRECTION
    Backend->>Backend: Sets correctionDeadline
    Backend->>Backend: Notifies author
    
    Usuario->>Frontend: Receives notification
    Usuario->>Frontend: Accesses feedback
    Frontend->>Backend: GET /api/submissions/[id]/evaluation
    Backend->>DB: Searches evaluation
    DB-->>Backend: {feedback, suggestions, comments}
    Backend-->>Frontend: Complete evaluation
    Frontend-->>Usuario: Displays detailed feedback
    
    Usuario->>Frontend: Accesses original article
    Frontend->>Backend: GET /api/articles/[id]
    Backend->>Arweave: Searches content
    Arweave-->>Backend: Original content
    Backend-->>Frontend: Article
    Frontend-->>Usuario: Opens in editor
    
    Usuario->>Frontend: Makes corrections
    Usuario->>Frontend: Saves new version
    Frontend->>Backend: POST /api/articles/[id]/new-version
    Note over Frontend,Backend: {articleId, correctedContent}
    
    Backend->>Backend: Generates new hash
    Backend->>Arweave: Uploads new version
    Arweave-->>Backend: newArweaveId
    Backend->>Solana: register_version()
    Note over Backend,Solana: {articleId, newHash, versionNumber}
    Solana-->>Backend: versionId
    
    Backend->>DB: Saves ArticleVersion
    Note over Backend,DB: {articleId, version, arweaveId, hash}
    
    Backend->>Backend: Updates author reputation
    Note over Backend: +3 points for correction
    
    Usuario->>Frontend: Resubmits to board
    Frontend->>Backend: POST /api/boards/[id]/resubmit
    Note over Frontend,Backend: {submissionId, newVersionId}
    
    Backend->>DB: Updates Submission
    Note over Backend,DB: {status: PENDING_REVIEW, currentVersionId}
    
    Backend->>Backend: Updates author reputation
    Note over Backend: +2 points for resubmission
    
    Backend->>Backend: Notifies evaluators
    Backend-->>Frontend: {success, reputationGained}
    
    Avaliador->>Frontend: Receives resubmission notification
    Avaliador->>Frontend: Accesses resubmission
    Frontend->>Backend: GET /api/submissions/[id]
    Backend->>DB: Searches submission + history
    DB-->>Backend: {currentVersion, previousVersions[], evaluations[]}
    Backend-->>Frontend: Complete data
    Frontend-->>Avaliador: Displays corrected version + version history
```

## Submission States

```mermaid
stateDiagram-v2
    [*] --> Pending: Submitted
    Pending --> UnderEvaluation: Evaluation started
    UnderEvaluation --> Approved: All approved
    UnderEvaluation --> NeedsCorrection: Needs correction
    UnderEvaluation --> Rejected: All rejected
    
    NeedsCorrection --> CorrectionPeriod: Period open
    CorrectionPeriod --> PendingReview: Resubmitted
    CorrectionPeriod --> Rejected: Period expired
    
    PendingReview --> UnderEvaluation: Re-evaluation
    PendingReview --> Approved: Correction approved
    
    Approved --> [*]
    Rejected --> [*]
```

## Comparison: Public Board vs Private Board

```mermaid
flowchart LR
    subgraph Public["Public Board"]
        P1[On-chain registration]
        P2[Community votes]
        P3[Total transparency]
        P4[Aggregated result]
    end
    
    subgraph Private["Private Board"]
        PR1[PostgreSQL registration]
        PR2[Only evaluators]
        PR3[Controlled access]
        PR4[Official evaluation]
    end
    
    P1 --> P2
    P2 --> P3
    P3 --> P4
    
    PR1 --> PR2
    PR2 --> PR3
    PR3 --> PR4
```

## Related Documentation

- [Use Cases](../USE_CASES.md) - UC09 to UC13
- [Roadmap](../ROADMAP.md) - Phase 2: Board System
- [Architecture](../ARCHITECTURE.md) - Section 8: Evaluation Boards
