-- Adicionar coluna fileHash à tabela pdfs
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS file_hash VARCHAR(255);

-- Adicionar índice para busca rápida por hash
CREATE INDEX IF NOT EXISTS pdfs_file_hash_idx ON pdfs(file_hash);