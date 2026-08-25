import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { adminOnly } from '../middlewares/adminOnly.js'
import { getStats } from '../controllers/stats.js'

const router = Router()

// GET /api/v1/stats — admin only
router.get('/', authenticate, adminOnly, getStats)

export default router
