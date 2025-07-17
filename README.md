# Plataforma de Processamento de PDF

Uma plataforma completa para manipulação e compartilhamento de documentos PDF, com ferramentas avançadas de edição e um sistema de acesso baseado em limites diários.

## Visão Geral

Esta plataforma oferece um conjunto completo de ferramentas para trabalhar com arquivos PDF:

- **Visualização de PDF** - Visualização interativa de documentos
- **Edição de Metadados** - Modificação de informações de autor, título e outros
- **Proteção com Senha** - Adição de segurança aos documentos
- **Manipulação de Páginas** - Excluir, extrair, rotacionar páginas
- **Conversão de Formatos** - PDF para Word, PDF para Imagem
- **Compressão** - Redução do tamanho de arquivos PDF
- **Mesclagem/Divisão** - Combinação ou separação de documentos
- **Marca d'água** - Inserção de textos personalizados

## Stack Tecnológico

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Manipulação de PDF**: pdftk, pdf2docx, sharp

## Modelo de Negócio

A plataforma opera com o seguinte modelo:

### Usuários Gratuitos
- Acesso a todas as ferramentas PDF
- Limite de 5 operações por dia
- Limite de 3 downloads de PDF compartilhados por dia

### Usuários Premium
- Acesso ilimitado a todas as ferramentas
- Downloads ilimitados
- Armazenamento estendido

## Atualizações Recentes

### Atualização de Modelo de Negócio (Abril 2025)
- Todas as ferramentas PDF agora estão disponíveis para usuários gratuitos (anteriormente algumas eram exclusivas para premium)
- O limite diário de 5 operações para usuários gratuitos é mantido
- Removido o conceito de "ferramentas premium" e substituído por um sistema de limite diário de uso

## Instalação e Configuração

### Implantação no Replit

Esta aplicação é otimizada para execução no Replit:

1. O projeto já está configurado com as dependências necessárias
2. O banco de dados PostgreSQL é provisionado automaticamente
3. Execute `npm run dev` para iniciar a aplicação em modo de desenvolvimento
4. Execute `npm run db:push` para sincronizar o schema do banco de dados

### Requisitos Básicos
- Node.js 18+
- PostgreSQL 14+
- pdftk
- Python 3.11 com pdf2docx
- poppler-utils
- ghostscript
- imagemagick

### Configuração Rápida (Desenvolvimento)

```bash
# Clonar o repositório
git clone [url-do-repositorio]

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Preparar ambiente de produção
node prepare-production.js

# Iniciar em desenvolvimento
npm run dev

# Ou em produção
npm run start
```

## Estrutura de Diretórios

```
/client          # Código frontend React
/server          # Backend Node.js/Express
/shared          # Código compartilhado (esquemas, tipos)
/uploads         # Arquivos enviados pelos usuários
/migrations      # Migrações do banco de dados
```

## Administração

Um usuário admin é criado automaticamente na primeira execução:
- Username: admin
- Senha: admin123

É altamente recomendado alterar esta senha após o primeiro login.

## Licença

Todos os direitos reservados.