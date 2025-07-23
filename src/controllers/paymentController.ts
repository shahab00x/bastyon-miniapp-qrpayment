import type { Request, Response } from 'express'
import { getPocketNetProxyInstance } from '../lib'

interface SendPaymentRequest {
  toAddress: string
  amount: number
  message?: string | null
  privateKey: string
}

/**
 * POST /api/payment/send
 * 
 * Sends a PKOIN payment to the specified address
 */
export async function sendPayment(req: Request, res: Response): Promise<void> {
  try {
    const { toAddress, amount, message, privateKey }: SendPaymentRequest = req.body

    if (!toAddress || !amount || !privateKey) {
      res.status(400).json({
        success: false,
        message: 'Recipient address, amount, and private key are required'
      })
      return
    }

    if (amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      })
      return
    }

    // Get the initialized instance of PocketNetProxyApi
    const pocketNetProxyInstance = await getPocketNetProxyInstance()

    // Send the transaction using the wallet method
    const result = await pocketNetProxyInstance.wallet.sendFundsWithPrivateKey({
      address: toAddress,
      amount: amount,
      key: privateKey,
      feeMode: 'exclude' // Sender pays the fee
    })

    res.status(200).json({
      success: true,
      message: 'Payment sent successfully',
      data: {
        txid: result.txid || result.hash || result,
        amount,
        toAddress,
        message
      }
    })
  } catch (error) {
    console.error('Error sending payment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET /api/payment/status/:txid
 * 
 * Gets the status of a payment transaction
 */
export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { txid } = req.params

    if (!txid) {
      res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      })
      return
    }

    // Get the initialized instance of PocketNetProxyApi
    const pocketNetProxyInstance = await getPocketNetProxyInstance()

    // Get transaction information
    const result = await pocketNetProxyInstance.rpc.getrawtransaction(txid, true)

    res.status(200).json({
      success: true,
      message: 'Transaction status retrieved successfully',
      data: {
        txid,
        confirmations: result.confirmations || 0,
        blocktime: result.blocktime,
        status: result.confirmations > 0 ? 'confirmed' : 'pending'
      }
    })
  } catch (error) {
    console.error('Error getting payment status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}