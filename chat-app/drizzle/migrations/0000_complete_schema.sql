-- Komplett database-skjema for RealTimeChatApp
-- Denne filen erstatter alle tidligere migrasjoner

PRAGMA foreign_keys = OFF;

-- Brukere
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  password TEXT,
  status TEXT DEFAULT 'offline',
  status_text TEXT,
  avatar_url TEXT,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
);

-- Sesjoner for autentisering
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
  expires_at TEXT
);

-- Meldinger mellom brukere
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
);

-- Vennskap (toveis relasjon)
CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  friend_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(user_id, friend_id)
);

-- Venneforespørsler
CREATE TABLE IF NOT EXISTS friend_requests (
  id TEXT PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT
);

-- Notater (bruker TEXT id for UUID)
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT
);

-- Brukerinnstillinger
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'no',
  notifications INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
);

-- Indekser for ytelse
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

PRAGMA foreign_keys = ON;
