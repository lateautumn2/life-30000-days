import express from 'express'
import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { dbAsync } from '../db/index.js'
import crypto from 'crypto'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'

// Register
router.post('/register', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, birth_date } = req.body

  if (!email || !password || !name || !birth_date) {
    res.status(400).json({ success: false, error: '所有字段都是必填的' })
    return
  }

  const existingUser = await dbAsync.get('SELECT id FROM users WHERE email = ?', [email])
  if (existingUser) {
    res.status(400).json({ success: false, error: '邮箱已被注册' })
    return
  }

  const countRes = await dbAsync.get('SELECT COUNT(*) as count FROM users')
  const role = countRes.count === 0 ? 'admin' : 'user'

  const hashedPassword = await bcrypt.hash(password, 10)
  const id = crypto.randomUUID()

  await dbAsync.run(
    'INSERT INTO users (id, email, password, name, role, birth_date) VALUES (?, ?, ?, ?, ?, ?)',
    [id, email, hashedPassword, name, role, birth_date]
  )

  const token = jwt.sign({ userId: id, role }, JWT_SECRET, { expiresIn: '7d' })

  res.json({
    success: true,
    data: { token, user: { id, email, name, role, birth_date } }
  })
}))

// Login
router.post('/login', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ success: false, error: '邮箱和密码是必填的' })
    return
  }

  const user = await dbAsync.get('SELECT * FROM users WHERE email = ?', [email])
  if (!user) {
    res.status(400).json({ success: false, error: '用户不存在' })
    return
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    res.status(400).json({ success: false, error: '密码错误' })
    return
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

  res.json({
    success: true,
    data: { 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        birth_date: user.birth_date 
      } 
    }
  })
}))

export default router
