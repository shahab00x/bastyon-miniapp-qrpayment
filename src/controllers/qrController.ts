import type { Request, Response } from 'express'
import QRCode from 'qrcode'

interface PaymentRequest {
  address: string
  amount?: number | null
  message?: string | null
}

/**
 * POST /api/qr/generate
 * 
 * Generates a QR code for payment requests
 */
export async function generateQRCode(req: Request, res: Response): Promise<void> {
  try {
    const { address, amount, message }: PaymentRequest = req.body

    if (!address) {
      res.status(400).json({
        success: false,
        message: 'Address is required'
      })
      return
    }

    // Create payment data object
    const paymentData = {
      address,
      amount: amount || null,
      message: message || null,
      timestamp: Date.now()
    }

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(paymentData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    })

    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode: qrCodeDataURL,
        paymentData
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}