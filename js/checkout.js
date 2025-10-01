// Checkout functionality for Shri Shyam Collection

class CheckoutManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.init();
    }

    async init() {
        this.loadOrderSummary();
        this.setupEventListeners();
        this.calculateTotals();
        
        // Auto-populate billing information if user is logged in
        if (this.token) {
            await this.autoPopulateBillingInfo();
        }
    }

    setupEventListeners() {
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        const checkoutForm = document.getElementById('checkoutForm');
        
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePlaceOrder();
            });
        }

        // Update totals when payment method changes
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.calculateTotals();
            });
        });

        // PIN code validation and shipping calculation
        const pincodeInput = document.getElementById('pincode');
        if (pincodeInput) {
            pincodeInput.addEventListener('input', (e) => {
                this.validatePincode(e.target.value);
            });
        }

        // Payment method form handling
        this.setupPaymentFormHandlers();
    }

    setupPaymentFormHandlers() {
        // Payment method selection
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.showPaymentForm(e.target.value);
                this.calculateTotals();
            });
        });

        // UPI method selection
        document.querySelectorAll('input[name="upiMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleUPIMethod(e.target.value);
            });
        });

        // Card number formatting
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                this.formatCardNumber(e.target);
            });
        }

        // Expiry date formatting
        const expiryInput = document.getElementById('expiryDate');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                this.formatExpiryDate(e.target);
            });
        }

        // CVV formatting
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                this.formatCVV(e.target);
            });
        }

        // Bank selection
        const otherBanksSelect = document.getElementById('otherBanks');
        if (otherBanksSelect) {
            otherBanksSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    // Uncheck popular bank radios
                    document.querySelectorAll('input[name="bank"]').forEach(radio => {
                        radio.checked = false;
                    });
                }
            });
        }

        // Popular bank selection
        document.querySelectorAll('input[name="bank"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Clear other banks dropdown
                    const otherBanks = document.getElementById('otherBanks');
                    if (otherBanks) otherBanks.value = '';
                }
            });
        });
    }

    showPaymentForm(paymentMethod) {
        // Hide all payment forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });

        // Show selected payment form
        const formId = `${paymentMethod}Form`;
        const selectedForm = document.getElementById(formId);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }
    }

    toggleUPIMethod(method) {
        const qrSection = document.getElementById('qrSection');
        const upiIdSection = document.getElementById('upiIDSection');

        if (method === 'qr') {
            qrSection.style.display = 'block';
            upiIdSection.style.display = 'none';
        } else {
            qrSection.style.display = 'none';
            upiIdSection.style.display = 'block';
        }
    }

    formatCardNumber(input) {
        let value = input.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        input.value = value;
    }

    formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        input.value = value;
    }

    formatCVV(input) {
        input.value = input.value.replace(/\D/g, '');
    }

    async autoPopulateBillingInfo() {
        try {
            const response = await fetch(`${this.baseURL}/auth/billing-info`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                this.populateFormFields(data.data);
                this.showAutoFillNotification();
            }
        } catch (error) {
            console.error('Error fetching billing info:', error);
        }
    }

    populateFormFields(billingData) {
        // Populate personal information
        if (billingData.personal) {
            this.setFieldValue('firstName', billingData.personal.firstName);
            this.setFieldValue('lastName', billingData.personal.lastName);
            this.setFieldValue('email', billingData.personal.email);
            this.setFieldValue('phone', billingData.personal.phone);
        }

        // Populate address information
        if (billingData.address) {
            this.setFieldValue('address', billingData.address.addressLine1);
            this.setFieldValue('city', billingData.address.city);
            this.setFieldValue('state', billingData.address.state);
            this.setFieldValue('pincode', billingData.address.pincode);
        }

        // Set preferred payment method
        if (billingData.preferences && billingData.preferences.preferredPaymentMethod) {
            const paymentRadio = document.querySelector(`input[name="payment"][value="${billingData.preferences.preferredPaymentMethod}"]`);
            if (paymentRadio) {
                paymentRadio.checked = true;
            }
        }

        // Add saved addresses as options if available
        if (billingData.savedAddresses && billingData.savedAddresses.length > 1) {
            this.addSavedAddressesSelector(billingData.savedAddresses);
        }
    }

    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value) {
            field.value = value;
            // Add a visual indicator that the field was auto-filled
            field.classList.add('auto-filled');
        }
    }

    addSavedAddressesSelector(savedAddresses) {
        const billingForm = document.getElementById('checkoutForm');
        if (!billingForm) return;

        // Create address selector
        const addressSelectorHTML = `
            <div class="saved-addresses-section">
                <h4>Choose from saved addresses:</h4>
                <div class="saved-addresses">
                    ${savedAddresses.map(addr => `
                        <div class="saved-address-option" data-address-id="${addr.id}">
                            <label>
                                <input type="radio" name="savedAddress" value="${addr.id}" ${addr.isDefault ? 'checked' : ''}>
                                <div class="address-preview">
                                    <strong>${addr.firstName} ${addr.lastName}</strong> (${addr.type})
                                    <p>${addr.addressLine1}, ${addr.city}, ${addr.state} - ${addr.pincode}</p>
                                    <small>${addr.phone}</small>
                                </div>
                            </label>
                        </div>
                    `).join('')}
                    <div class="saved-address-option">
                        <label>
                            <input type="radio" name="savedAddress" value="new">
                            <div class="address-preview">
                                <strong>Use different address</strong>
                                <p>Enter new billing address</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Insert before the first form group
        const firstFormRow = billingForm.querySelector('.form-row');
        if (firstFormRow) {
            firstFormRow.insertAdjacentHTML('beforebegin', addressSelectorHTML);
            
            // Add event listeners for address selection
            document.querySelectorAll('input[name="savedAddress"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.value === 'new') {
                        this.clearFormFields();
                    } else {
                        const selectedAddress = savedAddresses.find(addr => addr.id === e.target.value);
                        if (selectedAddress) {
                            this.populateAddressFields(selectedAddress);
                        }
                    }
                });
            });
        }
    }

    populateAddressFields(address) {
        this.setFieldValue('firstName', address.firstName);
        this.setFieldValue('lastName', address.lastName);
        this.setFieldValue('address', address.addressLine1);
        this.setFieldValue('city', address.city);
        this.setFieldValue('state', address.state);
        this.setFieldValue('pincode', address.pincode);
        this.setFieldValue('phone', address.phone);
    }

    clearFormFields() {
        ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
                field.classList.remove('auto-filled');
            }
        });
    }

    showAutoFillNotification() {
        // Create a subtle notification that billing info was auto-filled
        const notification = document.createElement('div');
        notification.className = 'auto-fill-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Billing information auto-filled from your profile</span>
            <button type="button" class="clear-btn" onclick="this.parentElement.remove()">×</button>
        `;
        
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.insertBefore(notification, checkoutForm.firstChild);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    loadOrderSummary() {
        const orderItemsContainer = document.getElementById('orderItems');
        if (!orderItemsContainer || this.cart.length === 0) {
            this.showEmptyCart();
            return;
        }

        orderItemsContainer.innerHTML = this.cart.map(item => this.createOrderItemHTML(item)).join('');
    }

    createOrderItemHTML(item) {
        return `
            <div class="order-item">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                    <span class="item-quantity">${item.quantity}</span>
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size}, Color: ${item.color}</p>
                    <span class="item-price">₹${item.price.toLocaleString()} × ${item.quantity}</span>
                </div>
                <div class="item-total">
                    ₹${(item.price * item.quantity).toLocaleString()}
                </div>
            </div>
        `;
    }

    calculateTotals() {
        if (this.cart.length === 0) return;

        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = Math.round(subtotal * 0.18); // 18% GST
        const shipping = subtotal >= 1999 ? 0 : 99;
        const total = subtotal + tax + shipping;

        // Update display
        this.updateTotalDisplay('orderSubtotal', subtotal);
        this.updateTotalDisplay('orderTax', tax);
        this.updateTotalDisplay('orderShipping', shipping === 0 ? 'Free' : `₹${shipping}`);
        this.updateTotalDisplay('orderTotal', total);
    }

    updateTotalDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            if (typeof value === 'number') {
                element.textContent = `₹${value.toLocaleString()}`;
            } else {
                element.textContent = value;
            }
        }
    }

    validatePincode(pincode) {
        if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
            // Simulate pincode validation
            this.showNotification('Delivery available to this pincode', 'success');
            return true;
        }
        return false;
    }

    handlePlaceOrder() {
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;

        // Create order object
        const order = {
            id: this.generateOrderId(),
            items: this.cart,
            customer: formData,
            paymentMethod: selectedPayment,
            totals: this.getOrderTotals(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        // Process order based on payment method
        this.processOrder(order);
    }

    validateForm() {
        const form = document.getElementById('checkoutForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Validate email
        const emailField = document.getElementById('email');
        if (emailField.value && !this.isValidEmail(emailField.value)) {
            this.showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate phone
        const phoneField = document.getElementById('phone');
        if (phoneField.value && !this.isValidPhone(phoneField.value)) {
            this.showFieldError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }

        // Validate pincode
        const pincodeField = document.getElementById('pincode');
        if (pincodeField.value && !this.validatePincode(pincodeField.value)) {
            this.showFieldError(pincodeField, 'Please enter a valid 6-digit PIN code');
            isValid = false;
        }

        // Validate payment method specific fields
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        if (!this.validatePaymentFields(paymentMethod)) {
            isValid = false;
        }

        return isValid;
    }

    validatePaymentFields(paymentMethod) {
        switch (paymentMethod) {
            case 'upi':
                return this.validateUPIFields();
            case 'card':
                return this.validateCardFields();
            case 'netbanking':
                return this.validateNetBankingFields();
            case 'wallet':
                return this.validateWalletFields();
            case 'cod':
                return true; // COD doesn't require additional validation
            default:
                return false;
        }
    }

    validateUPIFields() {
        const upiMethod = document.querySelector('input[name="upiMethod"]:checked')?.value;
        
        if (upiMethod === 'id') {
            const upiIdInput = document.getElementById('upiIdInput');
            if (!upiIdInput.value.trim()) {
                this.showFieldError(upiIdInput, 'Please enter your UPI ID');
                return false;
            }
            
            if (!this.isValidUPIId(upiIdInput.value)) {
                this.showFieldError(upiIdInput, 'Please enter a valid UPI ID (e.g., yourname@paytm)');
                return false;
            }
            
            this.clearFieldError(upiIdInput);
        }
        
        return true;
    }

    validateCardFields() {
        let isValid = true;
        
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');
        const cardHolder = document.getElementById('cardHolder');

        // Validate card number
        if (!cardNumber.value.trim()) {
            this.showFieldError(cardNumber, 'Card number is required');
            isValid = false;
        } else if (!this.isValidCardNumber(cardNumber.value)) {
            this.showFieldError(cardNumber, 'Please enter a valid card number');
            isValid = false;
        } else {
            this.clearFieldError(cardNumber);
        }

        // Validate expiry date
        if (!expiryDate.value.trim()) {
            this.showFieldError(expiryDate, 'Expiry date is required');
            isValid = false;
        } else if (!this.isValidExpiryDate(expiryDate.value)) {
            this.showFieldError(expiryDate, 'Please enter a valid expiry date (MM/YY)');
            isValid = false;
        } else {
            this.clearFieldError(expiryDate);
        }

        // Validate CVV
        if (!cvv.value.trim()) {
            this.showFieldError(cvv, 'CVV is required');
            isValid = false;
        } else if (!this.isValidCVV(cvv.value)) {
            this.showFieldError(cvv, 'Please enter a valid CVV');
            isValid = false;
        } else {
            this.clearFieldError(cvv);
        }

        // Validate cardholder name
        if (!cardHolder.value.trim()) {
            this.showFieldError(cardHolder, 'Cardholder name is required');
            isValid = false;
        } else {
            this.clearFieldError(cardHolder);
        }

        return isValid;
    }

    validateNetBankingFields() {
        const selectedBank = document.querySelector('input[name="bank"]:checked');
        const otherBank = document.getElementById('otherBanks').value;

        if (!selectedBank && !otherBank) {
            this.showNotification('Please select your bank for net banking payment', 'error');
            return false;
        }

        return true;
    }

    validateWalletFields() {
        const selectedWallet = document.querySelector('input[name="wallet"]:checked');

        if (!selectedWallet) {
            this.showNotification('Please select your preferred wallet', 'error');
            return false;
        }

        return true;
    }

    // Validation helper methods
    isValidUPIId(upiId) {
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
        return upiRegex.test(upiId);
    }

    isValidCardNumber(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        return /^\d{13,19}$/.test(cleanNumber) && this.luhnCheck(cleanNumber);
    }

    isValidExpiryDate(expiry) {
        const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!regex.test(expiry)) return false;

        const [month, year] = expiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();
        
        return expiryDate > now;
    }

    isValidCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    // Luhn algorithm for card number validation
    luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    getFormData() {
        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    getOrderTotals() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = Math.round(subtotal * 0.18);
        const shipping = subtotal >= 1999 ? 0 : 99;
        const total = subtotal + tax + shipping;

        return { subtotal, tax, shipping, total };
    }

    processOrder(order) {
        const paymentMethod = order.paymentMethod;
        
        // Show loading state
        this.showLoading(true);

        // Add payment-specific data to order
        order.paymentDetails = this.getPaymentDetails(paymentMethod);

        // Handle different payment methods
        switch (paymentMethod) {
            case 'cod':
                this.processCODOrder(order);
                break;
            case 'upi':
                this.processUPIOrder(order);
                break;
            case 'card':
                this.processCardOrder(order);
                break;
            case 'netbanking':
                this.processNetBankingOrder(order);
                break;
            case 'wallet':
                this.processWalletOrder(order);
                break;
            default:
                this.showLoading(false);
                this.showNotification('Invalid payment method selected', 'error');
        }
    }

    getPaymentDetails(paymentMethod) {
        const details = { method: paymentMethod };

        switch (paymentMethod) {
            case 'upi':
                const upiMethod = document.querySelector('input[name="upiMethod"]:checked')?.value;
                details.upiMethod = upiMethod;
                if (upiMethod === 'id') {
                    details.upiId = document.getElementById('upiIdInput').value;
                }
                break;

            case 'card':
                const cardNumber = document.getElementById('cardNumber').value;
                details.cardLast4 = cardNumber.replace(/\s/g, '').slice(-4);
                details.cardType = this.getCardType(cardNumber);
                details.saveCard = document.getElementById('saveCard').checked;
                break;

            case 'netbanking':
                const selectedBank = document.querySelector('input[name="bank"]:checked');
                const otherBank = document.getElementById('otherBanks').value;
                details.bank = selectedBank ? selectedBank.value : otherBank;
                break;

            case 'wallet':
                const selectedWallet = document.querySelector('input[name="wallet"]:checked');
                details.wallet = selectedWallet ? selectedWallet.value : null;
                break;
        }

        return details;
    }

    getCardType(cardNumber) {
        const number = cardNumber.replace(/\s/g, '');
        if (number.startsWith('4')) return 'visa';
        if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
        if (number.startsWith('3')) return 'amex';
        return 'unknown';
    }

    processCODOrder(order) {
        // COD orders are processed immediately
        this.submitOrderToAPI(order)
            .then(response => {
                this.showLoading(false);
                if (response.success) {
                    localStorage.removeItem('cart');
                    this.showOrderSuccess(response.order);
                } else {
                    this.showNotification(response.message || 'Order failed. Please try again.', 'error');
                }
            })
            .catch(error => {
                this.showLoading(false);
                console.error('Order submission error:', error);
                this.showNotification('Order failed. Please try again.', 'error');
            });
    }

    processUPIOrder(order) {
        // For demo purposes, simulate UPI payment
        this.submitOrderToAPI(order)
            .then(response => {
                this.showLoading(false);
                if (response.success) {
                    this.showUPIPayment(order);
                } else {
                    this.showNotification(response.message || 'Order failed. Please try again.', 'error');
                }
            })
            .catch(error => {
                this.showLoading(false);
                console.error('Order submission error:', error);
                this.showNotification('Order failed. Please try again.', 'error');
            });
    }

    processCardOrder(order) {
        // For demo purposes, simulate card payment
        this.submitOrderToAPI(order)
            .then(response => {
                this.showLoading(false);
                if (response.success) {
                    this.showCardPayment(order);
                } else {
                    this.showNotification(response.message || 'Order failed. Please try again.', 'error');
                }
            })
            .catch(error => {
                this.showLoading(false);
                console.error('Order submission error:', error);
                this.showNotification('Order failed. Please try again.', 'error');
            });
    }

    processNetBankingOrder(order) {
        // For demo purposes, simulate net banking
        this.submitOrderToAPI(order)
            .then(response => {
                this.showLoading(false);
                if (response.success) {
                    this.showNetBankingPayment(order);
                } else {
                    this.showNotification(response.message || 'Order failed. Please try again.', 'error');
                }
            })
            .catch(error => {
                this.showLoading(false);
                console.error('Order submission error:', error);
                this.showNotification('Order failed. Please try again.', 'error');
            });
    }

    processWalletOrder(order) {
        // For demo purposes, simulate wallet payment
        this.submitOrderToAPI(order)
            .then(response => {
                this.showLoading(false);
                if (response.success) {
                    this.showWalletPayment(order);
                } else {
                    this.showNotification(response.message || 'Order failed. Please try again.', 'error');
                }
            })
            .catch(error => {
                this.showLoading(false);
                console.error('Order submission error:', error);
                this.showNotification('Order failed. Please try again.', 'error');
            });
    }

    showUPIPayment(order) {
        if (order.paymentDetails.upiMethod === 'qr') {
            this.showPaymentModal('UPI QR Code', `
                <div class="payment-modal-content">
                    <div class="qr-code-display">
                        <div class="qr-code-placeholder">
                            <i class="fas fa-qrcode"></i>
                            <p>Scan this QR code with any UPI app</p>
                        </div>
                        <div class="upi-apps">
                            <p>Pay using:</p>
                            <div class="app-icons">
                                <span>GPay</span> <span>PhonePe</span> <span>Paytm</span>
                            </div>
                        </div>
                    </div>
                    <div class="payment-info">
                        <p><strong>Amount:</strong> ₹${order.totals.total.toLocaleString()}</p>
                        <p><strong>Order ID:</strong> ${order.id}</p>
                    </div>
                </div>
            `, order);
        } else {
            this.simulatePaymentSuccess(order);
        }
    }

    showCardPayment(order) {
        this.showPaymentModal('Processing Card Payment', `
            <div class="payment-modal-content">
                <div class="payment-processing">
                    <i class="fas fa-credit-card"></i>
                    <p>Processing your card payment...</p>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
                <div class="payment-info">
                    <p><strong>Card:</strong> **** **** **** ${order.paymentDetails.cardLast4}</p>
                    <p><strong>Amount:</strong> ₹${order.totals.total.toLocaleString()}</p>
                </div>
            </div>
        `, order);
        
        // Simulate payment processing
        setTimeout(() => {
            this.simulatePaymentSuccess(order);
        }, 3000);
    }

    showNetBankingPayment(order) {
        const bankName = this.getBankName(order.paymentDetails.bank);
        this.showPaymentModal('Net Banking Payment', `
            <div class="payment-modal-content">
                <div class="bank-redirect">
                    <i class="fas fa-university"></i>
                    <p>Redirecting to ${bankName} secure payment gateway...</p>
                    <div class="redirect-info">
                        <p>You will be redirected to your bank's website to complete the payment</p>
                    </div>
                </div>
                <div class="payment-info">
                    <p><strong>Bank:</strong> ${bankName}</p>
                    <p><strong>Amount:</strong> ₹${order.totals.total.toLocaleString()}</p>
                </div>
            </div>
        `, order);
        
        // Simulate bank redirect and payment
        setTimeout(() => {
            this.simulatePaymentSuccess(order);
        }, 2000);
    }

    showWalletPayment(order) {
        const walletName = this.getWalletName(order.paymentDetails.wallet);
        this.showPaymentModal('Wallet Payment', `
            <div class="payment-modal-content">
                <div class="wallet-payment">
                    <i class="fas fa-wallet"></i>
                    <p>Processing payment via ${walletName}...</p>
                </div>
                <div class="payment-info">
                    <p><strong>Wallet:</strong> ${walletName}</p>
                    <p><strong>Amount:</strong> ₹${order.totals.total.toLocaleString()}</p>
                </div>
            </div>
        `, order);
        
        // Simulate wallet payment
        setTimeout(() => {
            this.simulatePaymentSuccess(order);
        }, 2000);
    }

    getBankName(bankCode) {
        const banks = {
            'sbi': 'State Bank of India',
            'hdfc': 'HDFC Bank',
            'icici': 'ICICI Bank',
            'axis': 'Axis Bank',
            'pnb': 'Punjab National Bank',
            'bob': 'Bank of Baroda',
            'canara': 'Canara Bank',
            'union': 'Union Bank of India',
            'kotak': 'Kotak Mahindra Bank',
            'yes': 'Yes Bank',
            'indusind': 'IndusInd Bank',
            'federal': 'Federal Bank',
            'iob': 'Indian Overseas Bank',
            'syndicate': 'Syndicate Bank'
        };
        return banks[bankCode] || bankCode;
    }

    getWalletName(walletCode) {
        const wallets = {
            'paytm': 'Paytm Wallet',
            'freecharge': 'FreeCharge',
            'mobikwik': 'MobiKwik'
        };
        return wallets[walletCode] || walletCode;
    }

    showPaymentModal(title, content, order) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-overlay">
                <div class="payment-modal-content">
                    <div class="payment-modal-header">
                        <h3>${title}</h3>
                        <button class="close-modal" onclick="this.closest('.payment-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="payment-modal-body">
                        ${content}
                    </div>
                    <div class="payment-modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.payment-modal').remove()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    simulatePaymentSuccess(order) {
        // Remove any existing payment modals
        document.querySelectorAll('.payment-modal').forEach(modal => modal.remove());
        
        // Clear cart and show success
        localStorage.removeItem('cart');
        this.showOrderSuccess(order);
    }

    async submitOrderToAPI(order) {
        try {
            // Check if user is authenticated
            const isAuthenticated = window.authManager && window.authManager.isAuthenticated();
            const endpoint = isAuthenticated ? 'http://localhost:5000/api/orders' : 'http://localhost:5000/api/orders/guest';
            
            // Prepare headers
            const headers = { 'Content-Type': 'application/json' };
            if (isAuthenticated) {
                headers.Authorization = `Bearer ${window.authManager.token}`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    items: order.items,
                    customer: order.customer,
                    paymentMethod: order.paymentMethod,
                    totals: order.totals
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    processCODOrder(order) {
        // This method is now handled by the API
        // Keeping for backward compatibility if needed
    }

    processOnlinePayment(order) {
        // This method is now handled by the API
        // Keeping for backward compatibility if needed
    }

    saveOrder(order) {
        // Orders are now saved to MongoDB via API
        // Keeping a local backup for offline capability
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    showOrderSuccess(orderResponse) {
        // Create success modal
        const successHTML = `
            <div class="order-success-overlay">
                <div class="order-success-modal">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Order Placed Successfully!</h2>
                    <p class="order-id">Order ID: <strong>${orderResponse.orderNumber || orderResponse.id}</strong></p>
                    <p class="success-message">
                        Thank you for your purchase. You will receive an email confirmation shortly.
                    </p>
                    <div class="order-details">
                        <h3>Order Summary</h3>
                        <p>Payment Method: ${this.getPaymentMethodName(orderResponse.paymentMethod)}</p>
                        <p>Total Amount: <strong>₹${orderResponse.total ? orderResponse.total.toLocaleString() : 'N/A'}</strong></p>
                        <p>Status: <strong>${orderResponse.status || 'Pending'}</strong></p>
                        <p>Estimated Delivery: 5-7 business days</p>
                    </div>
                    <div class="success-actions">
                        <button class="btn-primary" onclick="window.location.href='index.html'">
                            Continue Shopping
                        </button>
                        <button class="btn-secondary" onclick="window.location.href='shop.html'">
                            View Products
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', successHTML);
    }

    showPaymentFailure() {
        this.showNotification('Payment failed. Please try again.', 'error');
    }

    showEmptyCart() {
        const orderItemsContainer = document.getElementById('orderItems');
        if (orderItemsContainer) {
            orderItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some items to your cart to proceed with checkout.</p>
                    <a href="shop.html" class="btn-primary">Continue Shopping</a>
                </div>
            `;
        }

        // Disable place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Cart is Empty';
        }
    }

    showLoading(show) {
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            if (show) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            } else {
                placeOrderBtn.disabled = false;
                placeOrderBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
            }
        }
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD${timestamp}${random}`;
    }

    generatePaymentId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `PAY${timestamp}${random}`;
    }

    getPaymentMethodName(method) {
        const methods = {
            'cod': 'Cash on Delivery',
            'upi': 'UPI Payment',
            'card': 'Credit/Debit Card',
            'netbanking': 'Net Banking'
        };
        return methods[method] || method;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    }
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});
