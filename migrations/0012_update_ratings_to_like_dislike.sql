-- Esta migração garante que a tabela ratings use o formato de like/dislike em vez de estrelas

-- Primeiro, verifique se a tabela ratings existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ratings') THEN
        -- Verifique se a coluna rating existe (sistema de estrelas)
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'ratings' AND column_name = 'rating') THEN
            
            -- Drop restrições existentes que possam interferir
            ALTER TABLE ratings DROP CONSTRAINT IF EXISTS valid_rating;
            
            -- Adicione a coluna is_positive se ela não existir
            IF NOT EXISTS (SELECT FROM information_schema.columns 
                           WHERE table_name = 'ratings' AND column_name = 'is_positive') THEN
                ALTER TABLE ratings ADD COLUMN is_positive BOOLEAN;
                
                -- Converte os ratings existentes para o formato like/dislike
                -- Considera ratings 4-5 como positivos, abaixo disso como negativos
                UPDATE ratings SET is_positive = CASE WHEN rating >= 4 THEN TRUE ELSE FALSE END;
                
                -- Torna is_positive NOT NULL após a conversão
                ALTER TABLE ratings ALTER COLUMN is_positive SET NOT NULL;
            END IF;
            
            -- Remove a coluna rating
            ALTER TABLE ratings DROP COLUMN IF EXISTS rating;
        END IF;
        
        -- Garante que os campos estejam no formato correto
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'ratings' AND column_name = 'is_positive') THEN
            -- Garante que a coluna is_positive seja NOT NULL
            ALTER TABLE ratings ALTER COLUMN is_positive SET NOT NULL;
        END IF;
    END IF;
END $$;

-- Atualizar as contagens na tabela pdfs se existir
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_name = 'pdfs' AND column_name = 'likes_count') AND
       EXISTS (SELECT FROM information_schema.columns 
               WHERE table_name = 'pdfs' AND column_name = 'dislikes_count') THEN
        
        -- Atualiza as contagens de likes/dislikes para cada PDF
        UPDATE pdfs p SET
            likes_count = (SELECT COUNT(*) FROM ratings r WHERE r.pdf_id = p.id AND r.is_positive = TRUE),
            dislikes_count = (SELECT COUNT(*) FROM ratings r WHERE r.pdf_id = p.id AND r.is_positive = FALSE),
            total_ratings = (SELECT COUNT(*) FROM ratings r WHERE r.pdf_id = p.id);
    END IF;
END $$;