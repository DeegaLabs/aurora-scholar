# End-to-End Testing Checklist

This document provides a comprehensive checklist for testing all major flows of Aurora Scholar locally (web + api + contracts).

## 📋 Prerequisites

Before starting E2E tests, ensure:

- [ ] **PostgreSQL** is running and accessible
- [ ] **Solana CLI** is installed and configured for devnet
- [ ] **Anchor** is installed (for contracts)
- [ ] **Environment variables** are configured (see [ENV_SETUP.md](./ENV_SETUP.md))
- [ ] **Irys account** is funded with SOL (devnet)
- [ ] **Solana program** is deployed to devnet (or using local validator)

## 🚀 Setup Steps

### 1. Start Services

```bash
# Terminal 1: Start API
cd apps/api
pnpm dev

# Terminal 2: Start Web
cd apps/web
pnpm dev

# Terminal 3: (Optional) Run local Solana validator
cd packages/contracts
anchor localnet
```

**Verify:**
- [ ] API running on `http://localhost:3001`
- [ ] Web running on `http://localhost:3000` (or 3002)
- [ ] API health check: `curl http://localhost:3001/api/health`

### 2. Database Setup

```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

**Verify:**
- [ ] Database migrations applied
- [ ] Prisma client generated

### 3. Wallet Connection

1. Open `http://localhost:3000` (or your web port)
2. Connect wallet (Phantom/Solflare) to **devnet**
3. Ensure wallet has SOL balance (request airdrop if needed)

**Verify:**
- [ ] Wallet connected and authenticated
- [ ] JWT token stored in localStorage
- [ ] Wallet address visible in UI

---

## ✅ Test Checklist

### Test 1: Publish Public Article

**Steps:**
1. Navigate to `/editor`
2. Fill in:
   - **Title**: "Test Public Article"
   - **Declared Intuition**: "This is a test article about blockchain"
   - **Content**: Write some content in the editor
   - **AI Scope**: Select "Grammar checking and style suggestions only"
3. Click "Publicar" (Publish)
4. Select "Público" (Public)
5. Confirm transaction in wallet
6. Wait for confirmation

**Expected Results:**
- [ ] Article uploaded to Arweave (check console for `arweaveId`)
- [ ] Transaction confirmed on Solana
- [ ] Article appears in `/journal` (public listing)
- [ ] Article appears in `/dashboard` (my articles)
- [ ] Article is accessible via `/journal` without authentication

**Verify on-chain:**
```bash
# Get article PDA
# Check Solana Explorer for transaction
# Verify article account exists
```

---

### Test 2: Publish Private Article

**Steps:**
1. Navigate to `/editor`
2. Fill in:
   - **Title**: "Test Private Article"
   - **Declared Intuition**: "This is a confidential test"
   - **Content**: Write confidential content
   - **AI Scope**: Select any option
3. Click "Publicar" (Publish)
4. Select "Privado" (Private)
5. Confirm transaction in wallet
6. Wait for confirmation

**Expected Results:**
- [ ] Article uploaded to Arweave (encrypted)
- [ ] Transaction confirmed on Solana
- [ ] Article **does NOT** appear in `/journal` (public listing)
- [ ] Article appears in `/dashboard` (my articles) with "Privado" badge
- [ ] Encryption key stored securely in backend

**Verify encryption:**
- [ ] Arweave content is encrypted (check `arweaveId` directly)
- [ ] Backend has encrypted key in `ArticleSecret` table

---

### Test 3: Grant Access to Private Article

**Prerequisites:**
- [ ] Have a private article published (from Test 2)
- [ ] Have a second wallet address (or use a different browser/profile)

**Steps:**
1. Navigate to `/dashboard`
2. Find your private article
3. Click "Gerenciar acesso" (Manage Access)
4. In the modal:
   - Enter viewer wallet address (second wallet)
   - Select expiration: "24 horas" (24 hours)
   - Click "Conceder acesso" (Grant Access)
5. Confirm transaction

**Expected Results:**
- [ ] Grant created successfully
- [ ] Grant appears in the grants list
- [ ] Grant shows correct expiration date
- [ ] Grant is active (not expired/revoked)

**Verify in database:**
```sql
SELECT * FROM "AccessGrant" WHERE "articleId" = '<your-article-id>';
```

---

### Test 4: Access Private Article (with Grant)

**Prerequisites:**
- [ ] Grant created from Test 3
- [ ] Use the **viewer wallet** (second wallet) in a different browser/profile

**Steps:**
1. Copy the private article link from dashboard (shareable link)
2. Open in **incognito/private window** (or different browser)
3. Connect the **viewer wallet** (the one that received the grant)
4. Navigate to `/private/[articleId]` (use the article ID from the link)
5. The page should:
   - Detect you have access
   - Request key challenge
   - Automatically claim the key
   - Decrypt and display the article

**Expected Results:**
- [ ] Page loads without "no access" error
- [ ] Key challenge/claim flow completes automatically
- [ ] Article content is decrypted and displayed
- [ ] Title, content, declared intuition, and AI scope are visible
- [ ] No errors in console

**Verify:**
- [ ] Check browser console for any errors
- [ ] Verify decrypted content matches original

---

### Test 5: Access Private Article (without Grant)

**Steps:**
1. Use a **different wallet** (third wallet, or one without grant)
2. Navigate to `/private/[articleId]` (same article from Test 4)
3. The page should show an error state

**Expected Results:**
- [ ] Page shows "Sem acesso" (No access) message
- [ ] "Solicitar acesso" (Request Access) button is visible
- [ ] Clicking "Solicitar acesso" copies a pre-filled message
- [ ] Article content is **not** displayed

---

### Test 6: Revoke Access

**Prerequisites:**
- [ ] Grant exists from Test 3

**Steps:**
1. Navigate to `/dashboard`
2. Find the private article
3. Click "Gerenciar acesso"
4. In the grants list, find the grant
5. Click "Revogar" (Revoke)
6. Confirm action

**Expected Results:**
- [ ] Grant is revoked (marked as revoked in UI)
- [ ] Grant no longer appears in active grants list
- [ ] Previously granted wallet can no longer access the article

**Verify:**
- [ ] Try accessing `/private/[articleId]` with the revoked wallet
- [ ] Should show "Acesso revogado" (Access revoked) error

---

### Test 7: Expired Grant

**Prerequisites:**
- [ ] Create a grant with short expiration (24 hours)
- [ ] Wait for expiration (or manually update database for testing)

**Steps:**
1. Use the viewer wallet
2. Navigate to `/private/[articleId]`
3. The page should detect expired grant

**Expected Results:**
- [ ] Page shows "Acesso expirado" (Access expired) message
- [ ] "Solicitar acesso" button is visible
- [ ] Article content is **not** displayed

**Note:** For testing, you can manually update the database:
```sql
UPDATE "AccessGrant" 
SET "expiresAt" = NOW() - INTERVAL '1 day' 
WHERE "id" = '<grant-id>';
```

---

### Test 8: Verify Article in Journal

**Prerequisites:**
- [ ] Have at least one public article published

**Steps:**
1. Navigate to `/journal`
2. Find your public article
3. Click "Verificar" (Verify) button
4. Wait for verification to complete

**Expected Results:**
- [ ] Verification completes successfully
- [ ] Toast shows "Artigo verificado" (Article verified)
- [ ] Verification compares:
  - Arweave content hash
  - Declared intuition hash
  - On-chain hashes match

**Verify:**
- [ ] Check browser console for verification details
- [ ] Verify hashes match between Arweave and on-chain

---

### Test 9: AI Assistant Features

**Steps:**
1. Navigate to `/editor`
2. Write some content
3. Test each AI feature:

**a) Chat Assistant:**
- [ ] Click floating "Chat" button
- [ ] Ask a question
- [ ] Verify response is ethical (guidance, not full text)
- [ ] Check anti-ghostwriting is working

**b) Help Write:**
- [ ] Click "Help Write" button
- [ ] Enter description
- [ ] Verify suggestions are provided
- [ ] Verify suggestions are ethical (not full text)

**c) Suggest Structure:**
- [ ] Click "Suggest Structure"
- [ ] Verify structural suggestions appear
- [ ] Verify suggestions reference declared sources

**d) Check Coherence:**
- [ ] Fill in declared intuition
- [ ] Write content
- [ ] Click "Check Coherence"
- [ ] Verify coherence analysis appears

**Expected Results:**
- [ ] All AI features respond without errors
- [ ] Anti-ghostwriting prevents full text generation
- [ ] Responses are in Portuguese
- [ ] Sources are processed and referenced

---

### Test 10: Dashboard Features

**Steps:**
1. Navigate to `/dashboard`
2. Verify all features:

**a) Article Listing:**
- [ ] All articles (public + private) are listed
- [ ] Articles show correct metadata (title, date, visibility)
- [ ] Private articles have "Privado" badge

**b) Access Control:**
- [ ] "Gerenciar acesso" button works for private articles
- [ ] Can create grants
- [ ] Can list grants
- [ ] Can revoke grants
- [ ] Shareable link is generated

**c) Navigation:**
- [ ] Can navigate to journal
- [ ] Can navigate to editor
- [ ] Wallet connection status is visible

**Expected Results:**
- [ ] All dashboard features work correctly
- [ ] No errors in console
- [ ] UI is responsive

---

## 🔍 Troubleshooting

### Common Issues

**1. "Failed to upload article: IRYS_PRIVATE_KEY environment variable is required"**
- **Solution:** Ensure `IRYS_PRIVATE_KEY` is set in `apps/api/.env`
- **Verify:** Check API logs for environment variable loading

**2. "Publishing failed: ProgramAccountNotFound"**
- **Solution:** Ensure Solana program is deployed to devnet
- **Verify:** Check `SOLANA_RPC_URL` points to devnet
- **Fix:** Deploy program: `cd packages/contracts && anchor deploy --provider.cluster devnet`

**3. "Auth Invalid signature"**
- **Solution:** Ensure wallet is connected and signing correctly
- **Verify:** Check `API_JWT_SECRET` is set in API
- **Fix:** Clear localStorage and reconnect wallet

**4. "Failed to decrypt article"**
- **Solution:** Ensure `ARTICLE_KEY_ENCRYPTION_SECRET` is set
- **Verify:** Check grant exists and is not expired/revoked
- **Fix:** Re-grant access if needed

**5. "Hydration failed" errors**
- **Solution:** This is a Next.js SSR issue, usually non-blocking
- **Verify:** Check if functionality still works despite warning

---

## 📊 Test Results Template

After completing all tests, document results:

```
Date: ___________
Tester: ___________
Environment: Local / Devnet

Test Results:
[ ] Test 1: Publish Public Article - PASS / FAIL
[ ] Test 2: Publish Private Article - PASS / FAIL
[ ] Test 3: Grant Access - PASS / FAIL
[ ] Test 4: Access Private Article (with Grant) - PASS / FAIL
[ ] Test 5: Access Private Article (without Grant) - PASS / FAIL
[ ] Test 6: Revoke Access - PASS / FAIL
[ ] Test 7: Expired Grant - PASS / FAIL
[ ] Test 8: Verify Article in Journal - PASS / FAIL
[ ] Test 9: AI Assistant Features - PASS / FAIL
[ ] Test 10: Dashboard Features - PASS / FAIL

Issues Found:
- 

Notes:
- 
```

---

## 🚀 Next Steps

After all tests pass:

1. **Deploy to staging** (if applicable)
2. **Run tests on staging** environment
3. **Document any issues** found
4. **Update this checklist** with new test cases
5. **Prepare for production** deployment

---

## 📚 Related Documentation

- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables configuration
- [packages/contracts/TESTING.md](../packages/contracts/TESTING.md) - Smart contract testing
- [README.md](../README.md) - Project overview


