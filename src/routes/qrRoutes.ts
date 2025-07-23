import { Router } from 'express'
import * as qrController from '../controllers/qrController'

export const qrRoutes = Router()

qrRoutes.post('/generate', qrController.generateQRCode)