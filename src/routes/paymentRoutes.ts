import { Router } from 'express'
import * as paymentController from '../controllers/paymentController'

export const paymentRoutes = Router()

paymentRoutes.post('/send', paymentController.sendPayment)
paymentRoutes.get('/status/:txid', paymentController.getPaymentStatus)