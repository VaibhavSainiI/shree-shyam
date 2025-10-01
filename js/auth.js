// Authentication Manager for Shri Shyam Collection
class AuthManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
        this.updateHeaderUI();
    }

    setupEventListeners() {
        // Auth toggle buttons
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleAuthForm(e.target.dataset.form);
            });
        });

        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }

        // Register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e.target);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Dashboard tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Account dropdown toggle
        const accountBtn = document.getElementById('accountBtn');
        if (accountBtn) {
            accountBtn.addEventListener('click', () => {
                this.toggleAccountDropdown();
            });
        }

        // Password strength check
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }

        // Confirm password validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', (e) => {
                this.validatePasswordConfirmation();
            });
        }

        // Google OAuth buttons
        const googleBtns = document.querySelectorAll('.google-btn');
        googleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleGoogleAuth();
            });
        });

        // Facebook OAuth buttons (placeholder)
        const facebookBtns = document.querySelectorAll('.facebook-btn');
        facebookBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleFacebookAuth();
            });
        });
    }

    checkAuthState() {
        if (this.token && this.user) {
            this.showDashboard();
        } else {
            this.showAuthForms();
        }
    }

    updateHeaderUI() {
        const accountBtn = document.getElementById('accountBtn');
        const accountText = document.getElementById('accountText');
        const accountMenu = document.getElementById('accountMenu');

        if (!accountBtn) return;

        if (this.user) {
            // User is logged in
            accountText.textContent = this.user.firstName || 'Account';
            accountMenu.innerHTML = `
                <a href="account.html" class="menu-item">
                    <i class="fas fa-user"></i>
                    My Profile
                </a>
                <a href="account.html#orders" class="menu-item">
                    <i class="fas fa-box"></i>
                    Orders
                </a>
                <a href="account.html#wishlist" class="menu-item">
                    <i class="fas fa-heart"></i>
                    Wishlist
                </a>
                <div class="menu-divider"></div>
                <button class="menu-item logout-item" onclick="authManager.handleLogout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            `;
        } else {
            // User is not logged in
            accountText.textContent = 'Account';
            accountMenu.innerHTML = `
                <a href="account.html" class="menu-item">
                    <i class="fas fa-sign-in-alt"></i>
                    Login
                </a>
                <a href="account.html" class="menu-item">
                    <i class="fas fa-user-plus"></i>
                    Register
                </a>
            `;
        }
    }

    toggleAccountDropdown() {
        const accountDropdown = document.getElementById('accountDropdown');
        if (accountDropdown) {
            accountDropdown.classList.toggle('active');
        }
    }

    toggleAuthForm(formType) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const toggleBtns = document.querySelectorAll('.toggle-btn');

        // Update active button
        toggleBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.form === formType) {
                btn.classList.add('active');
            }
        });

        // Show/hide forms
        if (formType === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        this.setLoading(true, 'loginFormElement');

        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.token = result.data.token;
                this.user = result.data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                this.showToast('Login successful! Welcome back.', 'success');
                this.showDashboard();
                this.updateHeaderUI();
            } else {
                this.showToast(result.message || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Network error. Please check your connection.', 'error');
        } finally {
            this.setLoading(false, 'loginFormElement');
        }
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };

        // Validate passwords match
        if (data.password !== formData.get('confirmPassword')) {
            this.showToast('Passwords do not match.', 'error');
            return;
        }

        this.setLoading(true, 'registerFormElement');

        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.token = result.data.token;
                this.user = result.data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                this.showToast('Registration successful! Welcome to Shri Shyam Collection.', 'success');
                this.showDashboard();
                this.updateHeaderUI();
            } else {
                this.showToast(result.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showToast('Network error. Please check your connection.', 'error');
        } finally {
            this.setLoading(false, 'registerFormElement');
        }
    }

    handleLogout() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        this.showToast('Logged out successfully.', 'success');
        this.showAuthForms();
        this.updateHeaderUI();
        
        // Redirect to home if on account page
        if (window.location.pathname.includes('account.html')) {
            window.location.href = 'index.html';
        }
    }

    showAuthForms() {
        const authToggle = document.getElementById('authToggle');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const userDashboard = document.getElementById('userDashboard');
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');

        if (authToggle) authToggle.style.display = 'flex';
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (userDashboard) userDashboard.style.display = 'none';
        if (pageTitle) pageTitle.textContent = '';
        if (pageSubtitle) pageSubtitle.textContent = '';
    }

    showDashboard() {
        const authToggle = document.getElementById('authToggle');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const userDashboard = document.getElementById('userDashboard');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');

        if (authToggle) authToggle.style.display = 'none';
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (userDashboard) userDashboard.style.display = 'block';
        if (pageTitle) pageTitle.textContent = '';
        if (pageSubtitle) pageSubtitle.textContent = '';

        if (this.user) {
            if (userName) userName.textContent = `Welcome, ${this.user.firstName}!`;
            if (userEmail) userEmail.textContent = this.user.email;
            this.loadUserData();
        }
    }

    async loadUserData() {
        this.loadOrders();
        this.loadProfile();
        this.loadAddresses();
        this.loadWishlist();
    }

    async loadOrders() {
        const ordersList = document.getElementById('ordersList');
        if (!ordersList || !this.token) return;

        try {
            const response = await fetch(`${this.baseURL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const result = await response.json();

            if (result.success && result.data.length > 0) {
                ordersList.innerHTML = result.data.map(order => this.createOrderHTML(order)).join('');
            } else {
                ordersList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h3>No orders yet</h3>
                        <p>Start shopping to see your orders here</p>
                        <a href="shop.html" class="shop-btn">Start Shopping</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersList.innerHTML = '<p class="error-message">Failed to load orders. Please try again.</p>';
        }
    }

    createOrderHTML(order) {
        return `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order #${order.orderNumber}</h4>
                        <p class="order-date">${new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-product">
                            <img src="${item.image}" alt="${item.name}" loading="lazy">
                            <div class="product-details">
                                <h5>${item.name}</h5>
                                <p>Qty: ${item.quantity} × ₹${item.price}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <div class="order-total">
                        <strong>Total: ₹${order.pricing.total}</strong>
                    </div>
                    <div class="order-actions">
                        <button class="view-order-btn" onclick="authManager.viewOrder('${order._id}')">
                            View Details
                        </button>
                        ${order.status === 'delivered' ? `
                            <button class="reorder-btn" onclick="authManager.reorder('${order._id}')">
                                Reorder
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    loadProfile() {
        if (!this.user) return;

        const profileFirstName = document.getElementById('profileFirstName');
        const profileLastName = document.getElementById('profileLastName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');

        if (profileFirstName) profileFirstName.value = this.user.firstName || '';
        if (profileLastName) profileLastName.value = this.user.lastName || '';
        if (profileEmail) profileEmail.value = this.user.email || '';
        if (profilePhone) profilePhone.value = this.user.phone || '';
    }

    loadAddresses() {
        const addressesList = document.getElementById('addressesList');
        if (!addressesList) return;

        // Placeholder for addresses
        addressesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marker-alt"></i>
                <h3>No saved addresses</h3>
                <p>Add an address for faster checkout</p>
                <button class="add-address-btn">Add Address</button>
            </div>
        `;
    }

    loadWishlist() {
        const wishlistGrid = document.getElementById('wishlistGrid');
        if (!wishlistGrid) return;

        // Placeholder for wishlist
        wishlistGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>Your wishlist is empty</h3>
                <p>Save items you love for later</p>
                <a href="shop.html" class="shop-btn">Browse Products</a>
            </div>
        `;
    }

    switchTab(tabName) {
        // Update tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        const activeTab = document.getElementById(`${tabName}Tab`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    checkPasswordStrength(password) {
        const strengthIndicator = document.getElementById('passwordStrength');
        if (!strengthIndicator) return;

        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('Uppercase letter');

        if (/\d/.test(password)) strength++;
        else feedback.push('Number');

        if (/[^a-zA-Z\d]/.test(password)) strength++;
        else feedback.push('Special character');

        const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColors = ['#ff4444', '#ff8800', '#ffaa00', '#88aa00', '#44aa44'];

        strengthIndicator.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill" style="width: ${(strength / 5) * 100}%; background: ${strengthColors[strength - 1] || '#ddd'}"></div>
            </div>
            <div class="strength-text" style="color: ${strengthColors[strength - 1] || '#666'}">
                ${strengthLevels[strength - 1] || 'Enter password'}
            </div>
            ${feedback.length > 0 ? `<div class="strength-feedback">Needs: ${feedback.join(', ')}</div>` : ''}
        `;
    }

    validatePasswordConfirmation() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');

        if (confirmPassword && password !== confirmPassword) {
            confirmInput.setCustomValidity('Passwords do not match');
            confirmInput.style.borderColor = '#ff4444';
        } else {
            confirmInput.setCustomValidity('');
            confirmInput.style.borderColor = '';
        }
    }

    setLoading(loading, formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        if (loading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Social Authentication Methods
    async handleGoogleAuth() {
        try {
            this.showToast('Google authentication temporarily unavailable in development mode.', 'info');
            
            // For development/demo purposes, simulate Google login
            this.simulateGoogleLogin();
            
        } catch (error) {
            console.error('Google authentication error:', error);
            this.showToast('Google authentication failed. Please try again.', 'error');
        }
    }

    async simulateGoogleLogin() {
        try {
            this.showToast('Simulating Google login for demo...', 'info');
            
            // Simulate Google user data
            const googleUserData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@gmail.com',
                avatar: {
                    url: 'https://via.placeholder.com/150/4285f4/ffffff?text=JD'
                }
            };

            // Send simulated data to backend
            const result = await fetch(`${this.baseURL}/auth/google-demo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(googleUserData)
            });

            const data = await result.json();

            if (data.success) {
                this.token = data.data.token;
                this.user = data.data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                this.showToast('Demo Google login successful! Welcome.', 'success');
                this.showDashboard();
                this.updateHeaderUI();
            } else {
                this.showToast(data.message || 'Google authentication failed.', 'error');
            }
        } catch (error) {
            console.error('Google demo login error:', error);
            this.showToast('Google authentication failed. Please try again.', 'error');
        }
    }

    async handleFacebookAuth() {
        try {
            this.showToast('Facebook authentication temporarily unavailable in development mode.', 'info');
            
            // For development/demo purposes, simulate Facebook login
            this.simulateFacebookLogin();
            
        } catch (error) {
            console.error('Facebook authentication error:', error);
            this.showToast('Facebook authentication failed. Please try again.', 'error');
        }
    }

    async simulateFacebookLogin() {
        try {
            this.showToast('Simulating Facebook login for demo...', 'info');
            
            // Simulate Facebook user data
            const facebookUserData = {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@facebook.com',
                avatar: {
                    url: 'https://via.placeholder.com/150/1877f2/ffffff?text=JS'
                }
            };

            // Send simulated data to backend
            const result = await fetch(`${this.baseURL}/auth/facebook-demo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(facebookUserData)
            });

            const data = await result.json();

            if (data.success) {
                this.token = data.data.token;
                this.user = data.data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                this.showToast('Demo Facebook login successful! Welcome.', 'success');
                this.showDashboard();
                this.updateHeaderUI();
            } else {
                this.showToast(data.message || 'Facebook authentication failed.', 'error');
            }
        } catch (error) {
            console.error('Facebook demo login error:', error);
            this.showToast('Facebook authentication failed. Please try again.', 'error');
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Global utility functions
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const accountDropdown = document.getElementById('accountDropdown');
    if (accountDropdown && !accountDropdown.contains(e.target)) {
        accountDropdown.classList.remove('active');
    }
});

// Handle URL hash for direct tab navigation
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && authManager.isAuthenticated()) {
        authManager.switchTab(hash);
    }
});
