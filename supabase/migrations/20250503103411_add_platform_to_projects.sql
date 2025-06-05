-- Add `platform` column to `projects` table
ALTER TABLE projects
ADD COLUMN platform TEXT CHECK (platform IN ('twitter', 'linkedin', 'telegram')) DEFAULT 'twitter';

-- Update existing rows with default value (if needed)
UPDATE projects SET platform = 'twitter' WHERE platform IS NULL;
