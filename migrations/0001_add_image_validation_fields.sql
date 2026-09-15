-- Migration: Add image validation metadata fields to food_items table
-- Reversible and safe: Uses IF NOT EXISTS to prevent destructive changes

ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_source text;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_source_url text;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_license text;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_status text DEFAULT 'VERIFIED';
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_confidence integer DEFAULT 95;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_hash text;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_perceptual_hash text;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_verified_at text;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_verification_reason text;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_search_query text;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_alt_text text;

-- Create index on image_status for fast filtering
CREATE INDEX IF NOT EXISTS food_items_image_status_idx ON food_items (image_status);
CREATE INDEX IF NOT EXISTS food_items_image_hash_idx ON food_items (image_hash);
