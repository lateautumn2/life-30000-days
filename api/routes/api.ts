import express from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { dbAsync } from '../db/index.js'
import { requireUser, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = express.Router()

// Extend Request type
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string
    userRole?: string
  }
}

// ========================
// User APIs
// ========================

// Get Quote
router.get('/quote', asyncHandler(async (req, res) => {
  const setting = await dbAsync.get("SELECT value FROM settings WHERE key = 'quote_source'")
  const source = setting ? setting.value : 'local'

  if (source === 'local') {
    // Optimized query: get random quote directly from database
    const randomQuote = await dbAsync.get('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1')
    if (randomQuote) {
      res.json({ success: true, data: { quote: randomQuote.content } })
    } else {
      res.json({ success: true, data: { quote: '每一个不曾起舞的日子，都是对生命的辜负。' } })
    }
  } else {
    // online source (hitokoto)
    try {
      const response = await fetch('https://v1.hitokoto.cn')
      const data: any = await response.json()
      res.json({ success: true, data: { quote: data.hitokoto } })
    } catch (e) {
      res.json({ success: true, data: { quote: '每一个不曾起舞的日子，都是对生命的辜负。' } })
    }
  }
}))

// Get User Info
router.get('/users/me', requireUser, asyncHandler(async (req, res) => {
  const user = await dbAsync.get('SELECT id, email, name, role, birth_date FROM users WHERE id = ?', [req.userId])
  if (user) {
    res.json({ success: true, data: user })
  } else {
    res.status(404).json({ success: false, error: '用户不存在' })
  }
}))

// Update User Info
router.put('/users/me', requireUser, asyncHandler(async (req, res) => {
  const { name, birth_date } = req.body
  await dbAsync.run('UPDATE users SET name = ?, birth_date = ? WHERE id = ?', [name, birth_date, req.userId])
  res.json({ success: true })
}))

// Get Connections
router.get('/connections', requireUser, asyncHandler(async (req, res) => {
  const connections = await dbAsync.all('SELECT * FROM connections WHERE user_id = ? ORDER BY created_at DESC', [req.userId])
  res.json({ success: true, data: connections })
}))

// Get Single Connection
router.get('/connections/:id', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params
  const connection = await dbAsync.get('SELECT * FROM connections WHERE id = ? AND user_id = ?', [id, req.userId])
  if (connection) {
    res.json({ success: true, data: connection })
  } else {
    res.status(404).json({ success: false, error: 'Not found' })
  }
}))

// Add Connection
router.post('/connections', requireUser, asyncHandler(async (req, res) => {
  const { name, birth_date } = req.body
  if (!name || !birth_date) {
    res.status(400).json({ success: false, error: 'name and birth_date are required' })
    return
  }
  const id = crypto.randomUUID()
  await dbAsync.run('INSERT INTO connections (id, user_id, name, birth_date) VALUES (?, ?, ?, ?)', [id, req.userId, name, birth_date])
  res.json({ success: true, data: { id, name, birth_date } })
}))

// Delete Connection
router.delete('/connections/:id', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params
  await dbAsync.run('DELETE FROM connections WHERE id = ? AND user_id = ?', [id, req.userId])
  res.json({ success: true })
}))

// Get Memos
router.get('/memos', requireUser, asyncHandler(async (req, res) => {
  const memos = await dbAsync.all(`
    SELECT m.*, c.name as connection_name 
    FROM memos m 
    LEFT JOIN connections c ON m.connection_id = c.id 
    WHERE m.user_id = ? 
    ORDER BY m.date DESC, m.created_at DESC
  `, [req.userId])
  res.json({ success: true, data: memos })
}))

// Add Memo
router.post('/memos', requireUser, asyncHandler(async (req, res) => {
  const { date, content, image, connection_id } = req.body
  if (!date || !content) {
    res.status(400).json({ success: false, error: 'date and content are required' })
    return
  }
  const id = crypto.randomUUID()
  await dbAsync.run(
    'INSERT INTO memos (id, user_id, date, content, image, connection_id) VALUES (?, ?, ?, ?, ?, ?)', 
    [id, req.userId, date, content, image || null, connection_id || null]
  )
  res.json({ success: true, data: { id, date, content, image, connection_id } })
}))

// Update Memo
router.put('/memos/:id', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { date, content, image, connection_id } = req.body
  if (!date || !content) {
    res.status(400).json({ success: false, error: 'date and content are required' })
    return
  }
  await dbAsync.run(
    'UPDATE memos SET date = ?, content = ?, image = ?, connection_id = ? WHERE id = ? AND user_id = ?', 
    [date, content, image || null, connection_id || null, id, req.userId]
  )
  res.json({ success: true, data: { id, date, content, image, connection_id } })
}))

// Delete Memo
router.delete('/memos/:id', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params
  await dbAsync.run('DELETE FROM memos WHERE id = ? AND user_id = ?', [id, req.userId])
  res.json({ success: true })
}))

// ========================
// Admin APIs
// ========================

router.use('/admin', requireUser, requireAdmin)

// Get All Users
router.get('/admin/users', asyncHandler(async (req, res) => {
  const users = await dbAsync.all('SELECT id, email, name, role, birth_date, created_at FROM users ORDER BY created_at DESC')
  res.json({ success: true, data: users })
}))

// Add User
router.post('/admin/users', asyncHandler(async (req, res) => {
  const { email, password, name, birth_date, role } = req.body
  if (!email || !password || !name || !birth_date) {
    res.status(400).json({ success: false, error: 'Missing required fields' })
    return
  }
  const existingUser = await dbAsync.get('SELECT id FROM users WHERE email = ?', [email])
  if (existingUser) {
    res.status(400).json({ success: false, error: '邮箱已被注册' })
    return
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const id = crypto.randomUUID()
  await dbAsync.run(
    'INSERT INTO users (id, email, password, name, role, birth_date) VALUES (?, ?, ?, ?, ?, ?)',
    [id, email, hashedPassword, name, role || 'user', birth_date]
  )
  res.json({ success: true })
}))

// Delete User
router.delete('/admin/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  if (id === req.userId) {
    res.status(400).json({ success: false, error: '不能删除自己' })
    return
  }
  await dbAsync.run('DELETE FROM users WHERE id = ?', [id])
  res.json({ success: true })
}))

// Get Settings
router.get('/admin/settings', asyncHandler(async (req, res) => {
  const settings = await dbAsync.all('SELECT * FROM settings')
  const settingsMap = settings.reduce((acc: Record<string, any>, curr: any) => {
    acc[curr.key] = curr.value
    return acc
  }, {})
  res.json({ success: true, data: settingsMap })
}))

// Update Settings
router.put('/admin/settings', asyncHandler(async (req, res) => {
  const { quote_source } = req.body
  if (quote_source) {
    await dbAsync.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['quote_source', quote_source])
  }
  res.json({ success: true })
}))

// Get Quotes
router.get('/admin/quotes', asyncHandler(async (req, res) => {
  const quotes = await dbAsync.all('SELECT * FROM quotes ORDER BY created_at DESC')
  res.json({ success: true, data: quotes })
}))

// Add Quote
router.post('/admin/quotes', asyncHandler(async (req, res) => {
  const { content, source } = req.body
  if (!content) {
    res.status(400).json({ success: false, error: '内容不能为空' })
    return
  }
  const id = crypto.randomUUID()
  await dbAsync.run('INSERT INTO quotes (id, content, source) VALUES (?, ?, ?)', [id, content, source || ''])
  res.json({ success: true })
}))

// Delete Quote
router.delete('/admin/quotes/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  await dbAsync.run('DELETE FROM quotes WHERE id = ?', [id])
  res.json({ success: true })
}))

export default router
