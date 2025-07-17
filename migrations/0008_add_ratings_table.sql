-- Criar tabela de avaliações (ratings)
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    pdf_id INTEGER NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Cada usuário só pode ter uma avaliação por PDF
    UNIQUE(user_id, pdf_id),
    
    -- Garantir que a avaliação esteja entre 1 e 5
    CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);