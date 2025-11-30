-- Add password column if missing (may error on some SQLite versions)
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
ALTER TABLE users ADD COLUMN password TEXT;
COMMIT;

INSERT INTO users (username, display_name, password, created_at) VALUES ('demo', 'Demo User', '$2a$10$RXLuJIbEyGoYUn8vggOEeO.XDhmCqIXOHogQjPYeQYybpeOWJzPKK', datetime('now'));
INSERT INTO messages (user_id, body, created_at) VALUES (1, 'Welcome to the demo chat', datetime('now'));
INSERT INTO messages (user_id, body, created_at) VALUES (1, 'This message was seeded', datetime('now'));
