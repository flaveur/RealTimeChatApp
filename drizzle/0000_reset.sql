PRAGMA foreign_keys=OFF;

-- Sletter tabeller hvis de finnes fra før (så du får en ren database)
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS friends;

-- Brukere
CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'offline'
);

-- Meldinger
CREATE TABLE messages (
    id TEXT PRIMARY KEY NOT NULL,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Økter / tokens
CREATE TABLE sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE
);

-- Venner
CREATE TABLE friends (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL
);

PRAGMA foreign_keys=ON;
