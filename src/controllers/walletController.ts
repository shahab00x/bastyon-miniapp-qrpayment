import type { Request, Response } from 'express'
import { getPocketNetProxyInstance } from '../lib'

// Simple in-memory storage for demo purposes
// In production, you'd want to use a proper database with encryption
let currentWallet: { address: string; privateKey: string } | null = null

/**
 * GET /api/wallet/info
 * 
 * Gets current wallet information including address and balance
 */
export async function getWalletInfo(req: Request, res: Response): Promise<void> {
  try {
    // Get the initialized instance of PocketNetProxyApi
    const pocketNetProxyInstance = await getPocketNetProxyInstance()

    let address: string
    let balance = 0

    if (currentWallet) {
      address = currentWallet.address
      
      // Get balance for the current wallet
      try {
        const balanceResult = await pocketNetProxyInstance.rpc.getaddressinfo({ address })
        balance = balanceResult.balance || 0
      } catch (balanceError) {
        console.warn('Could not fetch balance:', balanceError)
      }
    } else {
      // Use a demo address - users need to import their own wallet
      address = 'Please import your wallet to see your address'
    }

    res.status(200).json({
      success: true,
      message: 'Wallet information retrieved successfully',
      data: {
        address,
        balance,
        hasPrivateKey: !!currentWallet
      }
    })
  } catch (error) {
    console.error('Error getting wallet info:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet information',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * POST /api/wallet/import
 * 
 * Imports a wallet using a private key
 */
export async function importWallet(req: Request, res: Response): Promise<void> {
  try {
    const { privateKey } = req.body

    if (!privateKey) {
      res.status(400).json({
        success: false,
        message: 'Private key is required'
      })
      return
    }

    // Get the initialized instance of PocketNetProxyApi
    const pocketNetProxyInstance = await getPocketNetProxyInstance()

    // Try to get balance with private key to validate it and get address
    const balanceResult = await pocketNetProxyInstance.wallet.getBalanceWithPrivateKey({ key: privateKey })
    
    if (!balanceResult || !balanceResult.address) {
      throw new Error('Invalid private key or unable to retrieve address')
    }

    // Store the wallet
    currentWallet = {
      address: balanceResult.address,
      privateKey
    }

    res.status(200).json({
      success: true,
      message: 'Wallet imported successfully',
      data: {
        address: balanceResult.address
      }
    })
  } catch (error) {
    console.error('Error importing wallet:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to import wallet. Please check your private key.',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * GET /api/wallet/balance/:address
 * 
 * Gets the balance for a specific address
 */
export async function getBalance(req: Request, res: Response): Promise<void> {
  try {
    const { address } = req.params

    if (!address) {
      res.status(400).json({
        success: false,
        message: 'Address is required'
      })
      return
    }

    // Get the initialized instance of PocketNetProxyApi
    const pocketNetProxyInstance = await getPocketNetProxyInstance()

    // Get balance for the address
    const result = await pocketNetProxyInstance.rpc.getaddressinfo({ address })

    res.status(200).json({
      success: true,
      message: 'Balance retrieved successfully',
      data: {
        address,
        balance: result.balance || 0
      }
    })
  } catch (error) {
    console.error('Error getting balance:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get balance',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}