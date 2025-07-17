-- Add is_approved column to pdfs table with default value of true
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;

-- Update existing PDFs to be approved by default
UPDATE pdfs SET is_approved = TRUE WHERE is_approved IS NULL;