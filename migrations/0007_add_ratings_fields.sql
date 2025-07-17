-- Update the schema for PDFs table to add rating fields
ALTER TABLE pdfs
ADD COLUMN avg_rating FLOAT DEFAULT 0,
ADD COLUMN total_ratings INTEGER DEFAULT 0;