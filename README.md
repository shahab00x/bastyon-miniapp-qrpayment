# Bastyon QR Payment Mini App

A QR code-based payment application for the Bastyon network that allows users to send and receive PKOIN using QR codes.

## Features

- **QR Code Generation**: Generate QR codes for receiving PKOIN payments
- **QR Code Scanning**: Scan QR codes to send payments (using device camera)
- **Wallet Management**: Import wallet using private key and view balance
- **Real-time Balance**: Check wallet balance and refresh information
- **Secure Transactions**: Direct integration with Bastyon network via pocketnet-proxy-api

## How It Works

### For Receivers:
1. Navigate to the "Receive" tab
2. Enter the amount you want to receive
3. Generate a QR code containing payment information
4. Share the QR code with the sender

### For Senders:
1. Navigate to the "Send" tab
2. Click "Scan QR Code" to use your device camera
3. Scan the receiver's QR code
4. Confirm the payment details and send

### Wallet Management:
1. Navigate to the "Wallet" tab
2. Import your wallet using your private key
3. View your address and current PKOIN balance
4. Refresh wallet information as needed

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Bastyon wallet with private key

### Installation

1. Clone this repository:
```bash
git clone https://github.com/shahab00x/bastyon-miniapp-qrpayment.git
cd bastyon-miniapp-qrpayment
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:12000`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── controllers/
│   ├── index.ts           # Main page controller
│   ├── qrController.ts    # QR code generation
│   ├── paymentController.ts # Payment processing
│   └── walletController.ts  # Wallet operations
├── routes/
│   ├── index.ts           # Main routes
│   ├── qrRoutes.ts        # QR code routes
│   ├── paymentRoutes.ts   # Payment routes
│   └── walletRoutes.ts    # Wallet routes
├── types/
│   └── index.ts           # TypeScript definitions
├── app.ts                 # Express app configuration
├── server.ts              # Server startup
└── index.ts               # Main entry point

public/
├── index.html             # Main web interface
├── css/
│   └── style.css          # Application styles
└── js/
    └── app.js             # Frontend JavaScript
```

## API Endpoints

### QR Code Generation
- `POST /api/qr/generate` - Generate QR code for payment request

### Payment Processing
- `POST /api/payment/send` - Send PKOIN to specified address

### Wallet Operations
- `GET /api/wallet/info` - Get wallet information and balance
- `POST /api/wallet/import` - Import wallet using private key

## Technologies Used

- **Backend**: Express.js with TypeScript
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **QR Code**: qrcode library for generation, html5-qrcode for scanning
- **Blockchain**: pocketnet-proxy-api for Bastyon network integration
- **Styling**: Modern CSS with gradient backgrounds and responsive design

## Security Notes

- Private keys are handled securely and never stored permanently
- All transactions are processed directly through the Bastyon network
- QR codes contain only necessary payment information
- CORS is configured for secure cross-origin requests

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.