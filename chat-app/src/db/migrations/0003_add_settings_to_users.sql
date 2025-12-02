-- Migration to add settings column to users table
ALTER TABLE users ADD COLUMN settings TEXT;