-- Criar tabela temporária para backup
CREATE TABLE IF NOT EXISTS favorites_backup AS SELECT * FROM favorites;

-- Verificar se a coluna id existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'favorites'
    AND column_name = 'id'
  ) THEN
    -- Dropar a tabela atual
    DROP TABLE favorites;
    
    -- Recriar com a estrutura correta
    CREATE TABLE favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      pdf_id INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, pdf_id)
    );
    
    -- Restaurar dados
    INSERT INTO favorites (user_id, pdf_id, created_at)
    SELECT user_id, pdf_id, created_at FROM favorites_backup;
  END IF;
END $$;

-- Limpar tabela de backup se existir
DROP TABLE IF EXISTS favorites_backup;
