-- =============================================================================
-- Book seed template
-- =============================================================================
-- Columns with defaults that are auto-generated (omitted from INSERT):
--   id            uuid          DEFAULT uuid_generate_v4()
--   created_at    timestamptz   DEFAULT now()
--   updated_at    timestamptz   DEFAULT now()
--
-- Usage:
--   psql $DATABASE_URL -f scripts/seed-books.sql
-- =============================================================================

INSERT INTO books (title, author, description, cover_url, metadata, year, categories)
VALUES
  (
    'Harry Potter and the Philosopher''s Stone',
    'J. K. Rowling',
    'Harry discovers he is a wizard and begins his journey at Hogwarts School of Witchcraft and Wizardry, uncovering the mystery of the Philosopher''s Stone.',
    'https://covers.openlibrary.org/b/isbn/0747532699-L.jpg',
    '{"isbn":"0747532699","pages":223,"rating":4.47,"language":"en","publisher":"Bloomsbury","published_date":"1997","metadata_sources":"google_books,openlibrary","metadata_updated_at":"2026-02-22T00:00:00.000+00:00"}'::jsonb,
    1997,
    ARRAY['Fantasy','Young Adult','Adventure']
  ),
  -- ... rest of books
ON CONFLICT DO NOTHING;