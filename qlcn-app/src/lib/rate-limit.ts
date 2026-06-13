import { Request, Response, NextFunction } from "express"

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
  message?: string
}

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, max, message = "Too many requests" } = config

  return (req: Request, res: Response, next: NextFunction) => {
    // Use IP as identifier (or user ID if logged in)
    const identifier = req.ip || req.socket.remoteAddress || "unknown"
    const now = Date.now()
    
    let record = rateLimitStore.get(identifier)
    
    if (!record || record.resetTime < now) {
      // Create new record
      record = {
        count: 1,
        resetTime: now + windowMs,
      }
      rateLimitStore.set(identifier, record)
      next()
      return
    }
    
    record.count++
    
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      res.status(429).json({
        success: false,
        error: message,
        retryAfter,
      })
      return
    }
    
    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": max.toString(),
      "X-RateLimit-Remaining": Math.max(0, max - record.count).toString(),
      "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
    })
    
    next()
  }
}

// Pre-configured rate limiters
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.",
})

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
})

export const productionRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 production entries per minute
  message: "Quá nhiều yêu cầu nhập năng suất.",
})

// Get current rate limit status for monitoring
export function getRateLimitStatus(ip: string) {
  const record = rateLimitStore.get(ip)
  if (!record) {
    return { remaining: -1, resetTime: null }
  }
  
  const now = Date.now()
  if (record.resetTime < now) {
    rateLimitStore.delete(ip)
    return { remaining: -1, resetTime: null }
  }
  
  return {
    remaining: Math.max(0, 5 - record.count),
    resetTime: new Date(record.resetTime).toISOString(),
  }
}
