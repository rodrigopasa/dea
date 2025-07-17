-- Migração para corrigir a estrutura da tabela pdf_edits
-- Adiciona a coluna input_file_paths como JSONB e torna input_file_path opcional

-- Verifica se a tabela existe
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pdf_edits'
    ) THEN
        -- Verifica a coluna input_file_paths
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pdf_edits' 
            AND column_name = 'input_file_paths'
            AND data_type = 'ARRAY'
        ) THEN
            -- Altera o tipo da coluna de TEXT[] para JSONB
            ALTER TABLE "pdf_edits" 
            ALTER COLUMN "input_file_paths" TYPE JSONB 
            USING CASE 
              WHEN "input_file_paths" IS NULL THEN NULL
              ELSE to_jsonb("input_file_paths")
            END;
        ELSIF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pdf_edits' 
            AND column_name = 'input_file_paths'
        ) THEN
            -- Adiciona a coluna se não existir
            ALTER TABLE pdf_edits ADD COLUMN input_file_paths JSONB DEFAULT '[]';
        END IF;

        -- Verifica e adiciona a coluna operation_params se não existir
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pdf_edits' 
            AND column_name = 'operation_params'
        ) THEN
            ALTER TABLE pdf_edits ADD COLUMN operation_params JSONB DEFAULT '{}';
        END IF;

        -- Verifica e adiciona a coluna original_pdf_id se não existir
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pdf_edits' 
            AND column_name = 'original_pdf_id'
        ) THEN
            ALTER TABLE pdf_edits ADD COLUMN original_pdf_id INTEGER REFERENCES pdfs(id);
        END IF;

        -- Verifica e adiciona a coluna updated_at se não existir
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pdf_edits' 
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE pdf_edits ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
        END IF;

        -- Verifica e adiciona a coluna completed_at se não existir
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pdf_edits' 
            AND column_name = 'completed_at'
        ) THEN
            ALTER TABLE pdf_edits ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        END IF;

        -- Verifica e modifica a restrição NOT NULL da coluna input_file_path se existir
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pdf_edits' 
            AND column_name = 'input_file_path' 
            AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE pdf_edits ALTER COLUMN input_file_path DROP NOT NULL;
        END IF;
    END IF;
END $$;
