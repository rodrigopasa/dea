-- Adicionar colunas icon e color na tabela categories
ALTER TABLE IF EXISTS "categories" 
  ADD COLUMN "icon" TEXT DEFAULT 'folder',
  ADD COLUMN "color" TEXT DEFAULT '#4f46e5';