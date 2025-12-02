-- Seed demo brukere
INSERT OR IGNORE INTO users (id, username, display_name, password, status, created_at) 
VALUES (1, 'demo', 'Demo User', '$2a$10$sGdHGqbQ4fJVWGof77mfkO/Rnt8KjW1inZAEPrP7YOTrJVdycE0Je', 'online', datetime('now'));

INSERT OR IGNORE INTO users (id, username, display_name, password, status, created_at) 
VALUES (2, 'testuser', 'Test Bruker', '$2a$10$sGdHGqbQ4fJVWGof77mfkO/Rnt8KjW1inZAEPrP7YOTrJVdycE0Je', 'offline', datetime('now'));

-- Legg til vennskap mellom demo og testuser
INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at)
VALUES (1, 2, datetime('now'));

INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at)
VALUES (2, 1, datetime('now'));

-- Seed noen meldinger mellom brukerne
INSERT OR IGNORE INTO messages (sender_id, receiver_id, content, created_at)
VALUES (1, 2, 'Hei! Velkommen til chat-appen.', datetime('now', '-5 minutes'));

INSERT OR IGNORE INTO messages (sender_id, receiver_id, content, created_at)
VALUES (2, 1, 'Takk! Dette ser bra ut.', datetime('now', '-3 minutes'));

INSERT OR IGNORE INTO messages (sender_id, receiver_id, content, created_at)
VALUES (1, 2, 'Ja, den støtter meldinger, venner og notater!', datetime('now', '-1 minutes'));
