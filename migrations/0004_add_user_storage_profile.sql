-- Adicionar colunas relacionadas ao limite de armazenamento e perfil do usuário
ALTER TABLE IF EXISTS "users" 
  ADD COLUMN "storage_limit" INTEGER DEFAULT 1073741824, -- 1GB em bytes por padrão
  ADD COLUMN "storage_used" INTEGER DEFAULT 0,
  ADD COLUMN "name" TEXT,
  ADD COLUMN "email" TEXT;