import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'

export const requireUser = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    res.status(401).json({ success: false, error: '未授权访问' })
    return
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    res.status(401).json({ success: false, error: '未授权访问' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string }
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch (error) {
    res.status(401).json({ success: false, error: '登录已过期，请重新登录' })
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ success: false, error: '无权限访问' })
    return
  }
  next()
}
