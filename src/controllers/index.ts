import type { Request, Response } from 'express'
import { getPocketNetProxyInstance } from '../lib'

/**
 * GET /
 *
 * Serves the QR Payment app main page.
 * This route handles the root path of the application and serves the main HTML file.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @returns {Promise<void>} A promise that resolves when the rendering is complete.
 *
 * @example
 * app.get('/', index);
 */
export async function index(req: Request, res: Response): Promise<void> {
  res.sendFile('index.html', { root: './public' })
}

/**
 * GET /nodeinfo
 *
 * Retrieves node information from the PocketNet network.
 * This route demonstrates how to interact with the PocketNetProxy instance to fetch
 * node information using the `getnodeinfo` RPC method and return the result as a JSON response.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @returns {Promise<void>} A promise that resolves to a JSON response containing the node information.
 *
 * @example
 * app.get('/nodeinfo', getNodeInfo);
 *
 * {
 *   "message": "Node information retrieved successfully",
 *   "data": {
 *   }
 * }
 */
export async function getNodeInfo(req: Request, res: Response): Promise<void> {
  // Get the initialized instance of PocketNetProxyApi
  const pocketNetProxyInstance = await getPocketNetProxyInstance()

  // Call the getnodeinfo RPC method
  const result = await pocketNetProxyInstance.rpc.getnodeinfo()

  // Send a successful response with the node information
  res.status(200).json({
    message: 'Node information retrieved successfully',
    data: result,
  })
}
