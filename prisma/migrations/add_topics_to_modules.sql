-- Alter the modules table to add topics and description fields
ALTER TABLE modules 
ADD COLUMN topics TEXT[],
ADD COLUMN description TEXT;

-- Create an index for better performance on topics
CREATE INDEX idx_modules_topics ON modules USING GIN (topics);
