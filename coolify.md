# 🚀 Deploy no Coolify - Guia Completo

## 🔍 Problemas Identificados e Soluções

### ❌ **Problemas Principais que Impedem Deploy no Coolify:**

1. **Módulos Nativos não Compilam** (Canvas, Sharp, PDF libs)
2. **Build Path Inconsistente** (Vite build vs Static serve)
3. **Dockerfile sem Dependências do Sistema**
4. **PORT binding inadequado para Coolify**
5. **Falta de Error Handling em Produção**

### ✅ **Soluções Implementadas:**

#### 1. **Dockerfile Otimizado para Coolify**
- ✅ Dependências do sistema para módulos nativos (Canvas, Sharp, PDF libs)
- ✅ Build em duas etapas para reduzir tamanho da imagem
- ✅ Usuário não-root para segurança
- ✅ Suporte a variável PORT dinâmica do Coolify
- ✅ Cache de node_modules otimizado
- ✅ Limpeza de dev dependencies pós-build

#### 2. **Build Path Inteligente**
- ✅ Detecção automática: `dist/public` (prioridade), `public`, etc.
- ✅ Logs detalhados mostrando onde arquivos estão sendo servidos
- ✅ Error page informativa quando build não encontrado
- ✅ Teste de arquivos antes de servir

#### 3. **Environment & Port Handling**
- ✅ Suporte automático a `$PORT` do Coolify
- ✅ Fallback para porta 5000
- ✅ Logs de debug de ambiente
- ✅ DATABASE_URL com retry automático

#### 4. **Correções de Produção**
- ✅ `.dockerignore` otimizado
- ✅ Error handling para static files
- ✅ Logs estruturados para debugging
- ✅ Graceful shutdown handlers

## 📋 Checklist para Deploy no Coolify

### Antes do Deploy:
- [ ] Verificar se DATABASE_URL está configurada no Coolify
- [ ] Confirmar que as dependências estão no package.json
- [ ] Testar build local: `npm run build`
- [ ] Verificar se dist/public é criado após build

### Configuração no Coolify:
1. **Tipo de Aplicação**: Docker
2. **Build Command**: `npm run build` (automático via Dockerfile)
3. **Start Command**: `npm start` (automático via Dockerfile)
4. **Port**: 5000 (ou deixar automático)

### Variáveis de Ambiente no Coolify:
```
NODE_ENV=production
DATABASE_URL=postgresql://usuario:senha@host:porta/database
```

## 🐛 Problemas Comuns e Soluções

### ❌ **Build falha com erros de Canvas/Sharp**
**Solução**: Dockerfile já inclui dependências do sistema necessárias

### ❌ **"Cannot find build directory"**
**Solução**: 
- Verificar se `npm run build` cria o diretório `public`
- O código agora tenta múltiplos caminhos automaticamente

### ❌ **Database connection fails**
**Solução**:
- Verificar DATABASE_URL no painel do Coolify
- Certificar-se de que o banco PostgreSQL está acessível
- A aplicação tem retry automático para conexão

### ❌ **Port binding issues**
**Solução**: 
- Dockerfile configurado para usar $PORT do Coolify
- Fallback para porta 5000 se não definida

### ❌ **Static files não carregam**
**Solução**:
- Build path flexível implementado
- Logs detalhados mostram onde arquivos estão sendo servidos

## 🔧 Debugging no Coolify

### Logs Importantes:
```bash
# Verificar se build foi bem-sucedido
🔧 Environment Config:
   NODE_ENV: production
   PORT: 3000
   DATABASE_URL: ✅ Set
   Working Directory: /app

# Verificar se arquivos estáticos foram encontrados
✅ Serving static files from: /app/public

# Verificar conexão do banco
✅ Database connection successful!
🎉 Database initialization completed successfully.
```

### Se algo falha:
1. **Verificar logs de build** no Coolify
2. **Confirmar variáveis de ambiente** estão definidas
3. **Testar conexão do banco** separadamente
4. **Verificar se porta está exposta** corretamente

## 🚀 Comandos para Teste Local (Simulando Produção)

```bash
# Simular ambiente de produção
NODE_ENV=production npm run build
NODE_ENV=production npm start

# Testar com Docker (como no Coolify)
docker build -t pdfxandria .
docker run -p 5000:5000 -e DATABASE_URL="sua_url" pdfxandria
```

## 📝 Alterações Feitas

### Dockerfile:
- Dependências do sistema para Canvas/Sharp
- Build em duas etapas
- Usuário não-root
- Suporte a PORT dinâmica

### server/static.ts:
- Build path flexível
- Múltiplos caminhos tentados
- Logs detalhados de debugging
- Error page informativa

### server/index.ts:
- Logs de ambiente para debugging
- Melhor tratamento de PORT

## ✅ Resultado Esperado

Após implementar essas correções:
- ✅ Build deve ser bem-sucedido no Coolify
- ✅ Aplicação deve iniciar sem erros
- ✅ Banco de dados deve conectar automaticamente
- ✅ Arquivos estáticos devem ser servidos corretamente
- ✅ Todas as funcionalidades devem funcionar em produção

**Se ainda houver problemas, verifique os logs específicos do Coolify e compartilhe para análise mais detalhada.**