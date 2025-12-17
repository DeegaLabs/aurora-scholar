# Como Testar o Smart Contract Aurora Scholar

## 📋 Pré-requisitos

### 1. Instalar Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

Adicionar ao PATH:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Verificar instalação:
```bash
solana --version
```

### 2. Instalar Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

Verificar instalação:
```bash
anchor --version
```

### 3. Configurar Wallet Solana (devnet)

```bash
# Gerar nova wallet (se não tiver)
solana-keygen new

# Configurar para devnet
solana config set --url devnet

# Verificar configuração
solana config get

# Airdrop SOL para testes (devnet)
solana airdrop 2
```

### 4. Instalar Dependências do Projeto

```bash
cd packages/contracts
pnpm install
```

---

## 🧪 Passo a Passo para Testar

### Passo 1: Build do Contrato

```bash
cd packages/contracts
anchor build
```

**O que acontece:**
- Compila o contrato Rust
- Gera o Program ID
- Gera os tipos TypeScript em `target/types/`

**Importante:** Após o build, você verá um Program ID. Atualize:
- `Anchor.toml` → linha `aurora_scholar = "SEU_PROGRAM_ID_AQUI"`
- `lib.rs` → linha `declare_id!("SEU_PROGRAM_ID_AQUI");`

### Passo 2: Executar Testes

```bash
anchor test
```

**O que acontece:**
- Inicia um validator local do Solana
- Deploy do contrato
- Executa os testes em `tests/aurora_scholar.ts`
- Mostra resultados

### Passo 3: Verificar Resultados

Os testes devem passar:
- ✅ `publish_article` - publica artigo público
- ✅ `publish_article` - publica artigo privado  
- ✅ `update_visibility` - atualiza visibilidade

---

## 🔍 Testes Individuais

### Teste 1: Publicar Artigo Público

```typescript
// tests/aurora_scholar.ts - linha 19-58
it("should publish a public article successfully", async () => {
  // Cria hash do conteúdo
  // Cria hash da intuição
  // Publica no blockchain
  // Verifica dados salvos
});
```

**O que verifica:**
- Artigo criado com sucesso
- Autor correto
- Título correto
- `isPublic = true`
- Arweave ID salvo
- AI scope salvo

### Teste 2: Publicar Artigo Privado

```typescript
// tests/aurora_scholar.ts - linha 60-93
it("should publish a private article successfully", async () => {
  // Similar ao teste 1, mas com isPublic = false
});
```

**O que verifica:**
- Artigo criado com `isPublic = false`

### Teste 3: Atualizar Visibilidade

```typescript
// tests/aurora_scholar.ts - linha 96-140
it("should update article visibility", async () => {
  // Publica artigo público
  // Atualiza para privado
  // Verifica mudança
});
```

**O que verifica:**
- Apenas o autor pode atualizar
- Visibilidade muda corretamente

---

## 🐛 Troubleshooting

### Erro: "anchor: command not found"

**Solução:**
```bash
# Instalar Anchor via cargo
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Adicionar ao PATH
export PATH="$HOME/.cargo/bin:$PATH"
```

### Erro: "solana: command not found"

**Solução:**
```bash
# Instalar Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Adicionar ao PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### Erro: "Insufficient funds"

**Solução:**
```bash
# Airdrop SOL na devnet
solana airdrop 2

# Verificar saldo
solana balance
```

### Erro: "Program ID mismatch"

**Solução:**
1. Executar `anchor build`
2. Copiar Program ID do output
3. Atualizar `Anchor.toml` e `lib.rs`

### Erro: "Cannot find module '../target/types/aurora_scholar'"

**Solução:**
```bash
# Build primeiro para gerar tipos
anchor build

# Depois testar
anchor test
```

---

## 📊 Comandos Úteis

```bash
# Build apenas
anchor build

# Testar apenas (sem rebuild)
anchor test --skip-local-validator

# Ver logs detalhados
anchor test --skip-local-validator -- --verbose

# Deploy na devnet
anchor deploy

# Verificar Program ID
solana address -k target/deploy/aurora_scholar-keypair.json

# Verificar conta no blockchain
solana account <PROGRAM_ID> --url devnet
```

---

## ✅ Checklist de Teste

Antes de commitar, verificar:

- [ ] `anchor build` executa sem erros
- [ ] `anchor test` passa todos os testes
- [ ] Program ID atualizado no `Anchor.toml`
- [ ] Program ID atualizado no `lib.rs`
- [ ] Testes cobrem:
  - [ ] Publicação pública
  - [ ] Publicação privada
  - [ ] Atualização de visibilidade
  - [ ] Validação de autorização

---

## 🚀 Próximos Passos

Após testes passarem:

1. **Deploy na devnet:**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

2. **Verificar no Explorer:**
   - Acessar: https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet

3. **Usar no backend:**
   - Copiar Program ID para variável de ambiente
   - Usar no `blockchain.service.ts` (Tarefa 2)

