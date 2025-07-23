import { Router } from 'express'
import * as walletController from '../controllers/walletController'

export const walletRoutes = Router()

walletRoutes.get('/info', walletController.getWalletInfo)
walletRoutes.post('/import', walletController.importWallet)
walletRoutes.get('/balance/:address', walletController.getBalance)