-- Migration to add openai_api_key to seo_settings table

-- Only run if column doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'seo_settings' 
                 AND column_name = 'openai_api_key') THEN
        
        ALTER TABLE "seo_settings" ADD COLUMN "openai_api_key" text DEFAULT '';
        
    END IF;
END $$;