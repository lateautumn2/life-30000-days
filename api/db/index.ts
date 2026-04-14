import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Default to data/database.sqlite if DB_PATH is not set
const defaultDbDir = path.resolve(__dirname, '../../data')
const defaultDbPath = path.join(defaultDbDir, 'database.sqlite')
const dbPath = process.env.DB_PATH || defaultDbPath

// Ensure the directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database', err)
  } else {
    console.log('Connected to SQLite database.')
    initDb()
  }
})

function initDb() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        birth_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create connections table
    db.run(`
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Create memos table
    db.run(`
      CREATE TABLE IF NOT EXISTS memos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        connection_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE SET NULL
      )
    `)

    // Create quotes table
    db.run(`
      CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)
    
    // Init default settings
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('quote_source', 'local')`)
    
    // Insert some default quotes if empty
    db.get('SELECT COUNT(*) as count FROM quotes', [], (err, row: any) => {
      if (row && row.count === 0) {
        const defaultQuotes = [
          "活在当下，因为这是你唯一能真正拥有的时刻。",
          "每一个不曾起舞的日子，都是对生命的辜负。",
          "最慢的步伐不是跬步，而是徘徊；最快的脚步不是冲刺，而是坚持。"
        ]
        defaultQuotes.forEach((q, i) => {
          db.run(`INSERT INTO quotes (id, content, source) VALUES (?, ?, ?)`, [String(i + 1), q, '系统默认'])
        })
      }
    })
  })
}

// Wrapper for promises
export const dbAsync = {
  get: (sql: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  },
  all: (sql: string, params: any[] = []): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },
  run: (sql: string, params: any[] = []): Promise<sqlite3.RunResult> => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err)
        else resolve(this)
      })
    })
  }
}

export default db
