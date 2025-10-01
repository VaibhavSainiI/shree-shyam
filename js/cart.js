// Shopping Cart Functionality for Shri Shyam Collection

const Cart = {
    // Initialize cart functionality
    init: function() {
        this.updateCartDisplay();
        this.setupEventListeners();
        this.loadCartFromStorage();
    },

    // Add item to cart
    addToCart: function(productId, productData, quantity = 1) {
        const existingItem = AppState.cart.find(item => 
            item.productId === productId && 
            item.size === productData.size && 
            item.color === productData.color
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            AppState.cart.push({
                productId: productId,
                name: productData.name,
                price: productData.price,
                originalPrice: productData.originalPrice,
                image: productData.image,
                size: productData.size,
                color: productData.color,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        AppState.updateCart();
        this.updateCartDisplay();
        Utils.showNotification('Item added to cart successfully!', 'success');
        
        // Analytics event
        this.trackCartEvent('add_to_cart', productId, quantity);
    },

    // Remove item from cart
    removeFromCart: function(productId, size, color) {
        const itemIndex = AppState.cart.findIndex(item => 
            item.productId === productId && 
            item.size === size && 
            item.color === color
        );

        if (itemIndex > -1) {
            const removedItem = AppState.cart.splice(itemIndex, 1)[0];
            AppState.updateCart();
            this.updateCartDisplay();
            Utils.showNotification('Item removed from cart', 'info');
            
            // Analytics event
            this.trackCartEvent('remove_from_cart', productId, removedItem.quantity);
        }
    },

    // Update item quantity
    updateQuantity: function(productId, size, color, newQuantity) {
        const item = AppState.cart.find(item => 
            item.productId === productId && 
            item.size === size && 
            item.color === color
        );

        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId, size, color);
            } else if (newQuantity <= 10) { // Max quantity limit
                const oldQuantity = item.quantity;
                item.quantity = newQuantity;
                AppState.updateCart();
                this.updateCartDisplay();
                
                // Analytics event
                this.trackCartEvent('update_quantity', productId, newQuantity - oldQuantity);
            } else {
                Utils.showNotification('Maximum quantity is 10', 'error');
            }
        }
    },

    // Get cart total
    getCartTotal: function() {
        return AppState.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    // Get cart subtotal (before tax and shipping)
    getCartSubtotal: function() {
        return this.getCartTotal();
    },

    // Calculate tax
    calculateTax: function(subtotal) {
        return Math.round(subtotal * 0.18); // 18% GST
    },

    // Calculate shipping cost
    calculateShipping: function(subtotal) {
        return subtotal >= 1999 ? 0 : 99;
    },

    // Get cart count
    getCartCount: function() {
        return AppState.cart.reduce((total, item) => total + item.quantity, 0);
    },

    // Clear entire cart
    clearCart: function() {
        AppState.cart = [];
        AppState.updateCart();
        this.updateCartDisplay();
        Utils.showNotification('Cart cleared', 'info');
    },

    // Update cart display in header and cart page
    updateCartDisplay: function() {
        this.updateCartCount();
        this.updateCartPage();
        this.updateCartSummary();
    },

    // Update cart count in header
    updateCartCount: function() {
        const cartCountElements = Utils.querySelectorAll('.cart-count');
        const count = this.getCartCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'block' : 'none';
        });
    },

    // Update cart page content
    updateCartPage: function() {
        const cartItemsContainer = Utils.getElementById('cartItemsContainer');
        const emptyCart = Utils.getElementById('emptyCart');
        const cartLayout = Utils.getElementById('cartLayout');
        
        if (!cartItemsContainer) return;

        if (AppState.cart.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartLayout) cartLayout.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartLayout) cartLayout.style.display = 'grid';

        cartItemsContainer.innerHTML = '';
        
        AppState.cart.forEach(item => {
            const cartItemElement = this.createCartItemElement(item);
            cartItemsContainer.appendChild(cartItemElement);
        });

        // Update item count display
        const cartItemCount = Utils.getElementById('cartItemCount');
        if (cartItemCount) {
            const count = this.getCartCount();
            cartItemCount.textContent = `${count} item${count !== 1 ? 's' : ''} in your cart`;
        }
    },

    // Create cart item HTML element
    createCartItemElement: function(item) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-product-id', item.productId);
        cartItem.setAttribute('data-size', item.size);
        cartItem.setAttribute('data-color', item.color);

        const discount = item.originalPrice ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;

        cartItem.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-variant">Size: ${item.size}, Color: ${item.color}</p>
                <p class="item-price">
                    <span class="current-price">${Utils.formatCurrency(item.price)}</span>
                    ${item.originalPrice ? `<span class="original-price">${Utils.formatCurrency(item.originalPrice)}</span>` : ''}
                    ${discount > 0 ? `<span class="discount">${discount}% OFF</span>` : ''}
                </p>
            </div>
            <div class="item-quantity">
                <button class="qty-btn decrease" data-action="decrease">-</button>
                <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10">
                <button class="qty-btn increase" data-action="increase">+</button>
            </div>
            <div class="item-total">
                <span class="total-price">${Utils.formatCurrency(item.price * item.quantity)}</span>
            </div>
            <div class="item-actions">
                <button class="remove-item" title="Remove from cart" data-action="remove">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="save-later" title="Save for later" data-action="save">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        `;

        // Add event listeners to the cart item
        this.setupCartItemEvents(cartItem, item);

        return cartItem;
    },

    // Setup event listeners for cart item
    setupCartItemEvents: function(cartItemElement, item) {
        const decreaseBtn = cartItemElement.querySelector('.qty-btn.decrease');
        const increaseBtn = cartItemElement.querySelector('.qty-btn.increase');
        const qtyInput = cartItemElement.querySelector('.qty-input');
        const removeBtn = cartItemElement.querySelector('.remove-item');
        const saveBtn = cartItemElement.querySelector('.save-later');

        // Quantity decrease
        Utils.addEventListener(decreaseBtn, 'click', () => {
            this.updateQuantity(item.productId, item.size, item.color, item.quantity - 1);
        });

        // Quantity increase
        Utils.addEventListener(increaseBtn, 'click', () => {
            this.updateQuantity(item.productId, item.size, item.color, item.quantity + 1);
        });

        // Quantity input change
        Utils.addEventListener(qtyInput, 'change', (e) => {
            const newQuantity = parseInt(e.target.value);
            this.updateQuantity(item.productId, item.size, item.color, newQuantity);
        });

        // Remove item
        Utils.addEventListener(removeBtn, 'click', () => {
            if (confirm('Are you sure you want to remove this item from your cart?')) {
                this.removeFromCart(item.productId, item.size, item.color);
            }
        });

        // Save for later (move to wishlist)
        Utils.addEventListener(saveBtn, 'click', () => {
            this.saveForLater(item);
        });
    },

    // Update cart summary
    updateCartSummary: function() {
        const subtotalElement = Utils.getElementById('subtotal');
        const taxElement = Utils.getElementById('tax');
        const shippingElement = Utils.getElementById('shippingCost');
        const totalElement = Utils.getElementById('total');
        const checkoutBtn = Utils.getElementById('checkoutBtn');

        if (!subtotalElement) return;

        const subtotal = this.getCartSubtotal();
        const tax = this.calculateTax(subtotal);
        const shipping = this.calculateShipping(subtotal);
        const total = subtotal + tax + shipping;

        subtotalElement.textContent = Utils.formatCurrency(subtotal);
        taxElement.textContent = Utils.formatCurrency(tax);
        shippingElement.textContent = shipping === 0 ? 'Free' : Utils.formatCurrency(shipping);
        totalElement.textContent = Utils.formatCurrency(total);

        // Enable/disable checkout button
        if (checkoutBtn) {
            checkoutBtn.disabled = AppState.cart.length === 0;
            checkoutBtn.style.opacity = AppState.cart.length === 0 ? '0.5' : '1';
        }
    },

    // Save item for later (move to wishlist)
    saveForLater: function(item) {
        // Add to wishlist
        const wishlistItem = {
            productId: item.productId,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice,
            image: item.image,
            addedAt: new Date().toISOString()
        };

        AppState.wishlist.push(wishlistItem);
        AppState.updateWishlist();

        // Remove from cart
        this.removeFromCart(item.productId, item.size, item.color);
        
        Utils.showNotification('Item saved for later!', 'success');
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Add to cart buttons
        const addToCartBtns = Utils.querySelectorAll('.add-to-cart, .add-to-cart-btn');
        addToCartBtns.forEach(btn => {
            Utils.addEventListener(btn, 'click', (e) => {
                e.preventDefault();
                this.handleAddToCart(e.target);
            });
        });

        // Checkout button
        const checkoutBtn = Utils.getElementById('checkoutBtn');
        Utils.addEventListener(checkoutBtn, 'click', () => {
            this.proceedToCheckout();
        });

        // Promo code application
        const applyPromoBtn = Utils.getElementById('applyPromo');
        Utils.addEventListener(applyPromoBtn, 'click', () => {
            this.applyPromoCode();
        });
    },

    // Handle add to cart button click
    handleAddToCart: function(button) {
        const productCard = button.closest('.product-card') || button.closest('.product-info');
        if (!productCard) return;

        // Get product data from the card/page
        const productData = this.extractProductData(productCard);
        
        if (productData) {
            this.addToCart(productData.id, productData, 1);
        }
    },

    // Extract product data from product card or product page
    extractProductData: function(container) {
        // This would be implemented based on the actual HTML structure
        // For now, return mock data
        return {
            id: Date.now().toString(), // Would be actual product ID
            name: container.querySelector('h3, h1')?.textContent || 'Product',
            price: 2999,
            originalPrice: 3999,
            image: container.querySelector('img')?.src || 'images/product-placeholder.jpg',
            size: this.getSelectedSize() || 'M',
            color: this.getSelectedColor() || 'Red'
        };
    },

    // Get selected size from product page
    getSelectedSize: function() {
        const selectedSize = Utils.querySelector('.size-option.selected');
        return selectedSize ? selectedSize.getAttribute('data-size') : 'M';
    },

    // Get selected color from product page
    getSelectedColor: function() {
        const selectedColor = Utils.querySelector('.color-option.selected');
        return selectedColor ? selectedColor.getAttribute('data-color') : 'Red';
    },

    // Proceed to checkout
    proceedToCheckout: function() {
        if (AppState.cart.length === 0) {
            Utils.showNotification('Your cart is empty', 'error');
            return;
        }

        // Store cart data for checkout
        sessionStorage.setItem('checkoutCart', JSON.stringify(AppState.cart));
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    },

    // Apply promo code
    applyPromoCode: function() {
        const promoInput = Utils.getElementById('promoInput');
        const promoCode = promoInput.value.trim().toUpperCase();

        if (!promoCode) {
            Utils.showNotification('Please enter a promo code', 'error');
            return;
        }

        // Check promo code validity (this would be done via API in real app)
        const validPromoCodes = {
            'WELCOME10': { discount: 10, type: 'percentage' },
            'SAVE500': { discount: 500, type: 'fixed' },
            'ETHNIC20': { discount: 20, type: 'percentage' }
        };

        if (validPromoCodes[promoCode]) {
            const promo = validPromoCodes[promoCode];
            this.applyDiscount(promo);
            promoInput.value = '';
            Utils.showNotification(`Promo code applied! You saved ${promo.type === 'percentage' ? promo.discount + '%' : '₹' + promo.discount}`, 'success');
        } else {
            Utils.showNotification('Invalid promo code', 'error');
        }
    },

    // Apply discount
    applyDiscount: function(promo) {
        const subtotal = this.getCartSubtotal();
        let discountAmount = 0;

        if (promo.type === 'percentage') {
            discountAmount = Math.round(subtotal * (promo.discount / 100));
        } else {
            discountAmount = Math.min(promo.discount, subtotal);
        }

        // Update discount display
        const discountRow = Utils.getElementById('discountRow');
        const discountElement = Utils.getElementById('discount');
        
        if (discountRow && discountElement) {
            discountRow.style.display = 'flex';
            discountElement.textContent = `-${Utils.formatCurrency(discountAmount)}`;
        }

        // Store discount in session
        sessionStorage.setItem('appliedDiscount', JSON.stringify({
            code: promo.code,
            amount: discountAmount
        }));

        this.updateCartSummary();
    },

    // Load cart from localStorage
    loadCartFromStorage: function() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                AppState.cart = JSON.parse(savedCart);
                this.updateCartDisplay();
            } catch (error) {
                console.error('Error loading cart from storage:', error);
                AppState.cart = [];
            }
        }
    },

    // Track cart events for analytics
    trackCartEvent: function(eventName, productId, quantity) {
        // This would integrate with analytics service like Google Analytics
        console.log(`Cart Event: ${eventName}`, {
            product_id: productId,
            quantity: quantity,
            timestamp: new Date().toISOString()
        });
    }
};

// Initialize cart functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Cart.init();
});

// Export cart functionality
window.ShriShyamCollection = window.ShriShyamCollection || {};
window.ShriShyamCollection.Cart = Cart;
