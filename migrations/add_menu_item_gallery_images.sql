-- Suporta ate 5 fotos por produto:
-- - image: foto principal (fixa)
-- - gallery_images: ate 4 fotos adicionais (rotativas)

ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}'::text[];

UPDATE menu_items
SET gallery_images = '{}'::text[]
WHERE gallery_images IS NULL;

ALTER TABLE menu_items
ALTER COLUMN gallery_images SET DEFAULT '{}'::text[];
