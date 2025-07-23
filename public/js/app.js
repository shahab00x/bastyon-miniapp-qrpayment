class QRPaymentApp {
    constructor() {
        this.currentWallet = null;
        this.qrScanner = null;
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupEventListeners();
        this.loadWalletInfo();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
                
                // Stop QR scanner if switching away from send tab
                if (tabName !== 'send' && this.qrScanner) {
                    this.stopQRScanner();
                }
            });
        });
    }

    setupEventListeners() {
        // Receive form
        document.getElementById('receive-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateQRCode();
        });

        // Send form
        document.getElementById('send-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendPayment();
        });

        // Import wallet form
        document.getElementById('import-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.importWallet();
        });

        // QR Scanner buttons
        document.getElementById('start-scan').addEventListener('click', () => {
            this.startQRScanner();
        });

        document.getElementById('stop-scan').addEventListener('click', () => {
            this.stopQRScanner();
        });

        // Refresh buttons
        document.getElementById('refresh-address').addEventListener('click', () => {
            this.loadWalletInfo();
        });

        document.getElementById('refresh-wallet').addEventListener('click', () => {
            this.loadWalletInfo();
        });

        // Copy buttons
        document.getElementById('copy-address').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('qr-address').textContent);
        });

        document.getElementById('copy-wallet-address').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('wallet-address').textContent);
        });
    }

    async loadWalletInfo() {
        try {
            this.showStatus('Loading wallet information...', 'info');
            
            const response = await fetch('/api/wallet/info');
            const data = await response.json();
            
            if (data.success) {
                this.currentWallet = data.data;
                document.getElementById('receive-address').value = data.data.address;
                document.getElementById('wallet-address').textContent = data.data.address;
                document.getElementById('wallet-balance').textContent = `${data.data.balance} PKOIN`;
                this.showStatus('Wallet information loaded', 'success');
            } else {
                throw new Error(data.message || 'Failed to load wallet info');
            }
        } catch (error) {
            console.error('Error loading wallet info:', error);
            this.showStatus('Failed to load wallet information', 'error');
            document.getElementById('receive-address').value = 'Error loading address';
            document.getElementById('wallet-address').textContent = 'Error loading address';
            document.getElementById('wallet-balance').textContent = 'Error loading balance';
        }
    }

    async generateQRCode() {
        try {
            const address = document.getElementById('receive-address').value;
            const amount = document.getElementById('receive-amount').value;
            const message = document.getElementById('receive-message').value;

            if (!address) {
                throw new Error('Address is required');
            }

            const paymentData = {
                address: address,
                amount: amount || null,
                message: message || null
            };

            const response = await fetch('/api/qr/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            const data = await response.json();

            if (data.success) {
                this.displayQRCode(data.data.qrCode, paymentData);
                this.showStatus('QR code generated successfully', 'success');
            } else {
                throw new Error(data.message || 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            this.showStatus(error.message, 'error');
        }
    }

    displayQRCode(qrCodeDataURL, paymentData) {
        const qrResult = document.getElementById('qr-result');
        const qrCodeContainer = document.getElementById('qr-code');
        
        // Create and display QR code image
        qrCodeContainer.innerHTML = `<img src="${qrCodeDataURL}" alt="Payment QR Code" style="max-width: 300px; border-radius: 10px;">`;
        
        // Update payment info
        document.getElementById('qr-address').textContent = paymentData.address;
        
        if (paymentData.amount) {
            document.getElementById('qr-amount').textContent = paymentData.amount;
            document.getElementById('qr-amount-display').style.display = 'block';
        } else {
            document.getElementById('qr-amount-display').style.display = 'none';
        }
        
        if (paymentData.message) {
            document.getElementById('qr-message').textContent = paymentData.message;
            document.getElementById('qr-message-display').style.display = 'block';
        } else {
            document.getElementById('qr-message-display').style.display = 'none';
        }
        
        qrResult.style.display = 'block';
    }

    async startQRScanner() {
        try {
            const qrReader = document.getElementById('qr-reader');
            
            this.qrScanner = new Html5Qrcode("qr-reader");
            
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            };

            await this.qrScanner.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    this.handleQRScan(decodedText);
                },
                (errorMessage) => {
                    // Handle scan errors silently
                }
            );

            document.getElementById('start-scan').style.display = 'none';
            document.getElementById('stop-scan').style.display = 'inline-block';
            this.showStatus('Camera started. Point at QR code to scan.', 'info');
        } catch (error) {
            console.error('Error starting QR scanner:', error);
            this.showStatus('Failed to start camera. Please check permissions.', 'error');
        }
    }

    async stopQRScanner() {
        if (this.qrScanner) {
            try {
                await this.qrScanner.stop();
                this.qrScanner = null;
                document.getElementById('start-scan').style.display = 'inline-block';
                document.getElementById('stop-scan').style.display = 'none';
                document.getElementById('qr-reader').innerHTML = '<p>Camera stopped</p>';
                this.showStatus('Camera stopped', 'info');
            } catch (error) {
                console.error('Error stopping QR scanner:', error);
            }
        }
    }

    handleQRScan(qrData) {
        try {
            // Stop scanner after successful scan
            this.stopQRScanner();
            
            // Parse QR data (assuming JSON format)
            const paymentData = JSON.parse(qrData);
            
            // Fill form with scanned data
            document.getElementById('send-address').value = paymentData.address || '';
            document.getElementById('send-amount').value = paymentData.amount || '';
            document.getElementById('send-message').value = paymentData.message || '';
            
            this.showStatus('QR code scanned successfully!', 'success');
        } catch (error) {
            // If not JSON, assume it's just an address
            document.getElementById('send-address').value = qrData;
            this.showStatus('Address scanned successfully!', 'success');
        }
    }

    async sendPayment() {
        try {
            const address = document.getElementById('send-address').value;
            const amount = document.getElementById('send-amount').value;
            const message = document.getElementById('send-message').value;
            const privateKey = document.getElementById('send-private-key').value;

            if (!address || !amount || !privateKey) {
                throw new Error('Address, amount, and private key are required');
            }

            this.showStatus('Sending payment...', 'info');

            const paymentData = {
                toAddress: address,
                amount: parseFloat(amount),
                message: message || null,
                privateKey: privateKey
            };

            const response = await fetch('/api/payment/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            const data = await response.json();

            if (data.success) {
                this.showStatus(`Payment sent successfully! TX: ${data.data.txid}`, 'success');
                document.getElementById('send-form').reset();
                this.loadWalletInfo(); // Refresh wallet balance
            } else {
                throw new Error(data.message || 'Failed to send payment');
            }
        } catch (error) {
            console.error('Error sending payment:', error);
            this.showStatus(error.message, 'error');
        }
    }

    async importWallet() {
        try {
            const privateKey = document.getElementById('import-private-key').value;

            if (!privateKey) {
                throw new Error('Private key is required');
            }

            this.showStatus('Importing wallet...', 'info');

            const response = await fetch('/api/wallet/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ privateKey })
            });

            const data = await response.json();

            if (data.success) {
                this.showStatus('Wallet imported successfully!', 'success');
                document.getElementById('import-form').reset();
                this.loadWalletInfo(); // Refresh wallet info
            } else {
                throw new Error(data.message || 'Failed to import wallet');
            }
        } catch (error) {
            console.error('Error importing wallet:', error);
            this.showStatus(error.message, 'error');
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showStatus('Copied to clipboard!', 'success');
        }).catch(() => {
            this.showStatus('Failed to copy to clipboard', 'error');
        });
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type} show`;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusElement.classList.remove('show');
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRPaymentApp();
});