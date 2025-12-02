-- Migration to update notes table
ALTER TABLE notes ADD COLUMN updated_at TEXT;