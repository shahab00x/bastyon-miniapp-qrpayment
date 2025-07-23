import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import path from 'path'

import { errorHandler, errorNotFoundHandler } from './middlewares/errorHandler'

// Routes
import { index } from './routes/index'
import { qrRoutes } from './routes/qrRoutes'
import { paymentRoutes } from './routes/paymentRoutes'
import { walletRoutes } from './routes/walletRoutes'

// Create Express server
export const app = express()

// Express configuration
app.set('port', process.env.PORT || 3000)

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use(express.static(path.join(__dirname, '../public')))

// Routes
app.use('/', index)
app.use('/api/qr', qrRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/wallet', walletRoutes)

app.use(errorNotFoundHandler)
app.use(errorHandler)
