PRAGMA foreign_keys=OFF;

-- Sletter tabeller hvis de finnes fra før (ren database)
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;

-- Users (matcher src/db/users.ts)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'admin', -- or 'user' if you prefer to seed only admin in code
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
);

-- Sessions (matcher src/db/sessions.ts)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

-- Friendships (matcher src/db/friendships.ts)
CREATE TABLE friendships (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, friend_id)
);

-- Messages (matcher src/db/messages.ts)
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    edited_at INTEGER,
    read_at INTEGER
);

-- Notes (matcher src/db/notes.ts)
CREATE TABLE notes (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT DEFAULT 'CURRENT_TIMESTAMP',
    updated_at TEXT
);

PRAGMA foreign_keys=ON;
