// Main JavaScript for Shree Shyam Collection Website
// Global variables and utilities

// Utility functions
const Utils = {
    // Get element by ID
    getElementById: (id) => document.getElementById(id),
    
    // Get elements by class name
    getElementsByClass: (className) => document.getElementsByClassName(className),
    
    // Get elements by query selector
    querySelector: (selector) => document.querySelector(selector),
    
    // Get elements by query selector all
    querySelectorAll: (selector) => document.querySelectorAll(selector),
    
    // Add event listener
    addEventListener: (element, event, callback) => {
        if (element) {
            element.addEventListener(event, callback);
        }
    },
    
    // Remove event listener
    removeEventListener: (element, event, callback) => {
        if (element) {
            element.removeEventListener(event, callback);
        }
    },
    
    // Add class to element
    addClass: (element, className) => {
        if (element) {
            element.classList.add(className);
        }
    },
    
    // Remove class from element
    removeClass: (element, className) => {
        if (element) {
            element.classList.remove(className);
        }
    },
    
    // Toggle class on element
    toggleClass: (element, className) => {
        if (element) {
            element.classList.toggle(className);
        }
    },
    
    // Check if element has class
    hasClass: (element, className) => {
        return element ? element.classList.contains(className) : false;
    },
    
    // Format currency
    formatCurrency: (amount) => {
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Show notification
    showNotification: (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: '#fff',
            backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8',
            zIndex: '10000',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
};

// Global state management
const AppState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],
    user: JSON.parse(localStorage.getItem('user')) || null,
    
    // Update cart in localStorage
    updateCart: function() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    },
    
    // Update wishlist in localStorage
    updateWishlist: function() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    },
    
    // Update cart count in header
    updateCartCount: function() {
        const cartCountElement = Utils.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = this.cart.reduce((total, item) => total + item.quantity, 0);
        }
    }
};

// Header functionality
const Header = {
    init: function() {
        this.setupMobileMenu();
        this.setupSearchToggle();
        this.setupDropdowns();
        this.setupScrollEffect();
    },
    
    setupMobileMenu: function() {
        const mobileMenuToggle = Utils.getElementById('mobileMenuToggle');
        const mainNav = Utils.getElementById('mainNav');
        
        Utils.addEventListener(mobileMenuToggle, 'click', () => {
            Utils.toggleClass(mainNav, 'active');
        });
        
        // Close mobile menu when clicking outside
        Utils.addEventListener(document, 'click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !mainNav.contains(e.target)) {
                Utils.removeClass(mainNav, 'active');
            }
        });
    },
    
    setupSearchToggle: function() {
        const searchToggle = Utils.getElementById('searchToggle');
        const searchBar = Utils.getElementById('searchBar');
        const searchInput = Utils.getElementById('searchInput');
        
        Utils.addEventListener(searchToggle, 'click', () => {
            Utils.toggleClass(searchBar, 'active');
            if (Utils.hasClass(searchBar, 'active')) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
        
        // Close search when clicking outside
        Utils.addEventListener(document, 'click', (e) => {
            if (!searchToggle.contains(e.target) && !searchBar.contains(e.target)) {
                Utils.removeClass(searchBar, 'active');
            }
        });
    },
    
    setupDropdowns: function() {
        const dropdowns = Utils.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            // Mobile dropdown toggle
            Utils.addEventListener(link, 'click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    Utils.toggleClass(dropdown, 'active');
                }
            });
        });
    },
    
    setupScrollEffect: function() {
        const header = Utils.querySelector('.header');
        let lastScrollTop = 0;
        
        Utils.addEventListener(window, 'scroll', Utils.throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                Utils.addClass(header, 'header-hidden');
            } else {
                // Scrolling up
                Utils.removeClass(header, 'header-hidden');
            }
            
            lastScrollTop = scrollTop;
        }, 100));
    }
};

// Search functionality
const Search = {
    init: function() {
        this.setupSearchForm();
    },
    
    setupSearchForm: function() {
        const searchForm = Utils.querySelector('.search-form');
        const searchInput = Utils.getElementById('searchInput');
        
        Utils.addEventListener(searchForm, 'submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                this.performSearch(query);
            }
        });
        
        // Auto-suggest functionality
        let searchTimeout;
        Utils.addEventListener(searchInput, 'input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    this.showSuggestions(query);
                }, 300);
            } else {
                this.hideSuggestions();
            }
        });
    },
    
    performSearch: function(query) {
        // Redirect to shop page with search parameter
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    },
    
    showSuggestions: function(query) {
        // Implementation for search suggestions
        // This would typically make an API call to get suggestions
        console.log(`Showing suggestions for: ${query}`);
    },
    
    hideSuggestions: function() {
        // Hide search suggestions
        console.log('Hiding suggestions');
    }
};

// Newsletter functionality
const Newsletter = {
    init: function() {
        this.setupNewsletterForm();
    },
    
    setupNewsletterForm: function() {
        const newsletterForm = Utils.getElementById('newsletterForm');
        
        Utils.addEventListener(newsletterForm, 'submit', (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (this.validateEmail(email)) {
                this.subscribeToNewsletter(email);
            } else {
                Utils.showNotification('Please enter a valid email address', 'error');
            }
        });
    },
    
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    subscribeToNewsletter: function(email) {
        // Simulate API call
        Utils.showNotification('Subscribing to newsletter...', 'info');
        
        setTimeout(() => {
            // Simulate successful subscription
            Utils.showNotification('Successfully subscribed to newsletter!', 'success');
            
            // Clear the form
            const emailInput = Utils.querySelector('.newsletter-form input[type="email"]');
            if (emailInput) {
                emailInput.value = '';
            }
        }, 1000);
    }
};

// Smooth scrolling
const SmoothScroll = {
    init: function() {
        const links = Utils.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            Utils.addEventListener(link, 'click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = Utils.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// Lazy loading for images
const LazyLoad = {
    init: function() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    },
    
    setupIntersectionObserver: function() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = Utils.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    },
    
    loadAllImages: function() {
        const lazyImages = Utils.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
};

// Animation on scroll
const ScrollAnimations = {
    init: function() {
        if ('IntersectionObserver' in window) {
            this.setupAnimationObserver();
        }
    },
    
    setupAnimationObserver: function() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Utils.addClass(entry.target, 'animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        const animatedElements = Utils.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    }
};

// Hero Slideshow
const HeroSlideshow = {
    currentSlide: 0,
    slides: [],
    indicators: [],
    autoPlayInterval: null,
    autoPlayDelay: 5000,
    
    init: function() {
        this.slides = Utils.querySelectorAll('.hero-slide');
        this.indicators = Utils.querySelectorAll('.indicator');
        this.prevButton = Utils.querySelector('.hero-prev');
        this.nextButton = Utils.querySelector('.hero-next');
        
        if (this.slides.length === 0) return;
        
        this.bindEvents();
        this.startAutoPlay();
    },
    
    bindEvents: function() {
        // Navigation buttons
        Utils.addEventListener(this.prevButton, 'click', () => this.prevSlide());
        Utils.addEventListener(this.nextButton, 'click', () => this.nextSlide());
        
        // Indicators
        this.indicators.forEach((indicator, index) => {
            Utils.addEventListener(indicator, 'click', () => this.goToSlide(index));
        });
        
        // Pause on hover
        const heroSection = Utils.querySelector('.hero');
        Utils.addEventListener(heroSection, 'mouseenter', () => this.stopAutoPlay());
        Utils.addEventListener(heroSection, 'mouseleave', () => this.startAutoPlay());
        
        // Keyboard navigation
        Utils.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
    },
    
    goToSlide: function(index) {
        // Remove active class from current slide and indicator
        Utils.removeClass(this.slides[this.currentSlide], 'active');
        Utils.removeClass(this.indicators[this.currentSlide], 'active');
        
        // Update current slide
        this.currentSlide = index;
        
        // Add active class to new slide and indicator
        Utils.addClass(this.slides[this.currentSlide], 'active');
        Utils.addClass(this.indicators[this.currentSlide], 'active');
    },
    
    nextSlide: function() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    },
    
    prevSlide: function() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    },
    
    startAutoPlay: function() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    },
    
    stopAutoPlay: function() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
};

// Product management
const ProductManager = {
    // Load and display sample products
    loadSampleProducts: function() {
        if (typeof sampleProducts !== 'undefined') {
            this.displayFeaturedProducts(sampleProducts.slice(0, 4));
            this.displayNewArrivals(sampleProducts.slice(2, 6));
        }
    },
    
    // Display featured products
    displayFeaturedProducts: function(products) {
        const container = Utils.querySelector('.featured-products .products-grid') || Utils.getElementById('featuredProducts');
        if (container) {
            container.innerHTML = products.map(product => this.createProductCard(product)).join('');
            console.log('Featured products loaded:', products.length);
        } else {
            console.log('Featured products container not found');
        }
    },
    
    // Display new arrivals
    displayNewArrivals: function(products) {
        const container = Utils.querySelector('.new-arrivals .products-grid');
        if (container) {
            container.innerHTML = products.map(product => this.createProductCard(product)).join('');
        }
    },
    
    // Create product card HTML
    createProductCard: function(product) {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-overlay">
                        <button class="btn-icon add-to-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button class="btn-icon add-to-wishlist" onclick="addToWishlist(${product.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn-icon quick-view" onclick="quickView(${product.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    ${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        ${this.generateStarRating(product.rating)}
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="price">₹${product.price.toLocaleString()}</span>
                        ${product.originalPrice > product.price ? 
                            `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Generate star rating HTML
    generateStarRating: function(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
};

// Global functions for onclick events
function addToCart(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (product) {
        AppState.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        AppState.updateCart();
        Utils.showNotification(`${product.name} added to cart!`, 'success');
    }
}

function addToWishlist(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (product && !AppState.wishlist.find(w => w.id === productId)) {
        AppState.wishlist.push(product);
        AppState.updateWishlist();
        Utils.showNotification(`${product.name} added to wishlist!`, 'success');
    }
}

function quickView(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (product) {
        Utils.showNotification('Quick view feature coming soon!', 'info');
    }
}

// Convenience function for loading products
function loadSampleProducts() {
    ProductManager.loadSampleProducts();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    Header.init();
    Search.init();
    Newsletter.init();
    SmoothScroll.init();
    LazyLoad.init();
    ScrollAnimations.init();
    HeroSlideshow.init();
    
    // Load sample products
    loadSampleProducts();
    
    // Update cart count on page load
    AppState.updateCartCount();
    
    // Add loading states
    window.addEventListener('beforeunload', () => {
        document.body.style.opacity = '0.7';
    });
    
    // Remove loading states
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
        Utils.addClass(document.body, 'loaded');
    });
    
    console.log('Shree Shyam Collection website initialized successfully!');
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Optionally send error to analytics or error reporting service
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // Optionally send error to analytics or error reporting service
});

// Export for use in other scripts
window.ShreeShyamCollection = {
    Utils,
    AppState,
    Header,
    Search,
    Newsletter,
    SmoothScroll,
    LazyLoad,
    ScrollAnimations,
    HeroSlideshow
};