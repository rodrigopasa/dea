-- Criar tabela ratings
CREATE TABLE IF NOT EXISTS ratings (
    id serial,
    pdf_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk PRIMARY KEY (user_id, pdf_id)
);