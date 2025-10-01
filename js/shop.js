// Enhanced Shop Page with Advanced Search and Filtering
class AdvancedShop {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilters = {
            search: '',
            category: '',
            priceMin: 0,
            priceMax: 10000,
            rating: 0,
            colors: [],
            brands: [],
            sortBy: 'relevance'
        };
        this.itemsPerPage = 12;
        this.currentPage = 1;
        this.searchSuggestions = [
            'Traditional Wear', 'Ethnic Dresses', 'Wedding Collection', 'Festive Wear',
            'Casual Wear', 'Party Wear', 'Designer Suits', 'Sarees', 'Lehengas',
            'Kurtis', 'Palazzo Sets', 'Indo-Western', 'Silk Collection', 'Cotton Wear'
        ];
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.initializePriceSlider();
        this.applyFilters();
    }

    loadProducts() {
        // Use existing sample products if available, otherwise use demo data
        if (typeof sampleProducts !== 'undefined' && sampleProducts.length > 0) {
            this.products = [...sampleProducts];
        } else {
            // Demo products data
            this.products = [
                {
                    id: 1,
                    name: "Elegant Red Saree",
                    category: "sarees",
                    price: 2999,
                    originalPrice: 4999,
                    rating: 4.5,
                    reviews: 120,
                    colors: ["red", "maroon"],
                    brand: "Royal Collection",
                    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
                    tags: ["traditional", "wedding", "silk"],
                    featured: true
                },
                {
                    id: 2,
                    name: "Designer Lehenga Set",
                    category: "lehengas",
                    price: 8999,
                    originalPrice: 12999,
                    rating: 4.8,
                    reviews: 85,
                    colors: ["blue", "gold"],
                    brand: "Premium Designs",
                    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300",
                    tags: ["designer", "wedding", "heavy"],
                    featured: true
                },
                {
                    id: 3,
                    name: "Cotton Kurti Set",
                    category: "kurtis",
                    price: 1299,
                    originalPrice: 1999,
                    rating: 4.2,
                    reviews: 200,
                    colors: ["white", "pink"],
                    brand: "Comfort Wear",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300",
                    tags: ["casual", "comfort", "cotton"],
                    featured: false
                },
                {
                    id: 4,
                    name: "Palazzo Suit Set",
                    category: "suits",
                    price: 2199,
                    originalPrice: 3299,
                    rating: 4.4,
                    reviews: 150,
                    colors: ["green", "yellow"],
                    brand: "Trendy Fashion",
                    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300",
                    tags: ["trendy", "comfortable", "indo-western"],
                    featured: false
                },
                {
                    id: 5,
                    name: "Silk Dress Material",
                    category: "dress-materials",
                    price: 1899,
                    originalPrice: 2999,
                    rating: 4.3,
                    reviews: 95,
                    colors: ["purple", "gold"],
                    brand: "Silk Heritage",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300",
                    tags: ["silk", "premium", "unstitched"],
                    featured: false
                },
                {
                    id: 6,
                    name: "Party Wear Gown",
                    category: "gowns",
                    price: 4599,
                    originalPrice: 6999,
                    rating: 4.6,
                    reviews: 75,
                    colors: ["black", "silver"],
                    brand: "Glamour Zone",
                    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300",
                    tags: ["party", "glamour", "western"],
                    featured: true
                }
            ];
        }
        this.filteredProducts = [...this.products];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.querySelector('.search-btn');
        const clearSearch = document.querySelector('.clear-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            searchInput.addEventListener('focus', this.showSearchSuggestions.bind(this));
            searchInput.addEventListener('blur', () => {
                setTimeout(() => this.hideSearchSuggestions(), 200);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', this.performSearch.bind(this));
        }

        if (clearSearch) {
            clearSearch.addEventListener('click', this.clearAllSearch.bind(this));
        }

        // Filter controls
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        const clearAllFilters = document.querySelector('.clear-all-filters');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', this.handleCategoryFilter.bind(this));
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', this.handleSortFilter.bind(this));
        }

        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', this.handleItemsPerPageChange.bind(this));
        }

        if (clearAllFilters) {
            clearAllFilters.addEventListener('click', this.clearAllFilters.bind(this));
        }

        // Rating filters
        const ratingFilters = document.querySelectorAll('input[name="rating"]');
        ratingFilters.forEach(filter => {
            filter.addEventListener('change', this.handleRatingFilter.bind(this));
        });

        // Color filters
        const colorFilters = document.querySelectorAll('.color-option input[type="checkbox"]');
        colorFilters.forEach(filter => {
            filter.addEventListener('change', this.handleColorFilter.bind(this));
        });

        // Brand search
        const brandSearch = document.getElementById('brandSearch');
        if (brandSearch) {
            brandSearch.addEventListener('input', this.handleBrandSearch.bind(this));
        }

        // Brand filters
        const brandFilters = document.querySelectorAll('input[name="brand"]');
        brandFilters.forEach(filter => {
            filter.addEventListener('change', this.handleBrandFilter.bind(this));
        });

        // Price inputs
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');

        if (minPriceInput && maxPriceInput) {
            minPriceInput.addEventListener('input', this.debounce(this.handlePriceFilter.bind(this), 500));
            maxPriceInput.addEventListener('input', this.debounce(this.handlePriceFilter.bind(this), 500));
        }
    }

    initializePriceSlider() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const sliderRange = document.querySelector('.slider-range');

        if (minPriceInput && maxPriceInput && sliderRange) {
            this.updateSliderRange();
        }
    }

    updateSliderRange() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const sliderRange = document.querySelector('.slider-range');

        if (minPriceInput && maxPriceInput && sliderRange) {
            const min = parseInt(minPriceInput.value) || 0;
            const max = parseInt(maxPriceInput.value) || 10000;
            const totalRange = 10000;

            const leftPercent = (min / totalRange) * 100;
            const widthPercent = ((max - min) / totalRange) * 100;

            sliderRange.style.left = `${leftPercent}%`;
            sliderRange.style.width = `${widthPercent}%`;
        }
    }

    handleSearch(event) {
        this.currentFilters.search = event.target.value.toLowerCase();
        this.showSearchSuggestions();
        this.applyFilters();
    }

    performSearch() {
        this.hideSearchSuggestions();
        this.applyFilters();
        this.updateSearchResults();
    }

    clearAllSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            this.currentFilters.search = '';
            this.applyFilters();
            this.hideSearchResults();
        }
    }

    showSearchSuggestions() {
        const searchValue = this.currentFilters.search;
        const suggestions = document.querySelector('.search-suggestions');
        
        if (!suggestions) return;

        if (searchValue.length > 0) {
            const filteredSuggestions = this.searchSuggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(searchValue)
            );

            if (filteredSuggestions.length > 0) {
                suggestions.innerHTML = filteredSuggestions.slice(0, 5).map(suggestion => `
                    <div class="search-suggestion" onclick="advancedShop.selectSuggestion('${suggestion}')">
                        <div class="suggestion-text">${suggestion}</div>
                        <div class="suggestion-category">in Fashion</div>
                    </div>
                `).join('');
                suggestions.style.display = 'block';
            } else {
                suggestions.style.display = 'none';
            }
        } else {
            suggestions.style.display = 'none';
        }
    }

    hideSearchSuggestions() {
        const suggestions = document.querySelector('.search-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    selectSuggestion(suggestion) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = suggestion;
            this.currentFilters.search = suggestion.toLowerCase();
            this.hideSearchSuggestions();
            this.applyFilters();
            this.updateSearchResults();
        }
    }

    updateSearchResults() {
        const searchResultsInfo = document.querySelector('.search-results-info');
        if (searchResultsInfo && this.currentFilters.search) {
            searchResultsInfo.style.display = 'flex';
            const searchTerm = document.querySelector('.search-term');
            if (searchTerm) {
                searchTerm.textContent = `"${this.currentFilters.search}"`;
            }
        }
    }

    hideSearchResults() {
        const searchResultsInfo = document.querySelector('.search-results-info');
        if (searchResultsInfo) {
            searchResultsInfo.style.display = 'none';
        }
    }

    handleCategoryFilter(event) {
        this.currentFilters.category = event.target.value;
        this.applyFilters();
    }

    handleSortFilter(event) {
        this.currentFilters.sortBy = event.target.value;
        this.applyFilters();
    }

    handleRatingFilter(event) {
        this.currentFilters.rating = parseFloat(event.target.value);
        this.applyFilters();
    }

    handleColorFilter(event) {
        const color = event.target.value;
        if (event.target.checked) {
            this.currentFilters.colors.push(color);
        } else {
            const index = this.currentFilters.colors.indexOf(color);
            if (index > -1) {
                this.currentFilters.colors.splice(index, 1);
            }
        }
        this.applyFilters();
        this.updateActiveFilters();
    }

    handleBrandFilter(event) {
        const brand = event.target.value;
        if (event.target.checked) {
            this.currentFilters.brands.push(brand);
        } else {
            const index = this.currentFilters.brands.indexOf(brand);
            if (index > -1) {
                this.currentFilters.brands.splice(index, 1);
            }
        }
        this.applyFilters();
        this.updateActiveFilters();
    }

    handleBrandSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const brandItems = document.querySelectorAll('.brand-list .filter-item');
        
        brandItems.forEach(item => {
            const brandName = item.querySelector('label').textContent.toLowerCase();
            if (brandName.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    handlePriceFilter() {
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');

        if (minPriceInput && maxPriceInput) {
            this.currentFilters.priceMin = parseInt(minPriceInput.value) || 0;
            this.currentFilters.priceMax = parseInt(maxPriceInput.value) || 10000;
            this.updateSliderRange();
            this.applyFilters();
            this.updateActiveFilters();
        }
    }

    handleItemsPerPageChange(event) {
        this.itemsPerPage = parseInt(event.target.value);
        this.currentPage = 1;
        this.renderProducts();
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search;
                const searchFields = [
                    product.name.toLowerCase(),
                    product.category.toLowerCase(),
                    (product.brand || '').toLowerCase(),
                    ...((product.tags || []).map(tag => tag.toLowerCase()))
                ].join(' ');
                
                if (!searchFields.includes(searchTerm)) {
                    return false;
                }
            }

            // Category filter
            if (this.currentFilters.category && this.currentFilters.category !== 'all') {
                if (product.category !== this.currentFilters.category) {
                    return false;
                }
            }

            // Price filter
            if (product.price < this.currentFilters.priceMin || product.price > this.currentFilters.priceMax) {
                return false;
            }

            // Rating filter
            if (this.currentFilters.rating > 0 && (product.rating || 0) < this.currentFilters.rating) {
                return false;
            }

            // Color filter
            if (this.currentFilters.colors.length > 0) {
                const hasMatchingColor = this.currentFilters.colors.some(color => 
                    (product.colors || []).includes(color)
                );
                if (!hasMatchingColor) {
                    return false;
                }
            }

            // Brand filter
            if (this.currentFilters.brands.length > 0) {
                if (!this.currentFilters.brands.includes(product.brand || '')) {
                    return false;
                }
            }

            return true;
        });

        this.sortProducts();
        this.renderProducts();
        this.updateResultsCount();
    }

    sortProducts() {
        switch (this.currentFilters.sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => b.id - a.id);
                break;
            case 'popular':
                this.filteredProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
                break;
            case 'discount':
                this.filteredProducts.sort((a, b) => {
                    const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
                    const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
                    return discountB - discountA;
                });
                break;
            default: // relevance
                this.filteredProducts.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return (b.rating || 0) - (a.rating || 0);
                });
        }
    }

    renderProducts() {
        const container = document.querySelector('.shop-grid') || document.querySelector('.products-grid') || document.getElementById('products-container');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="no-products-found" style="text-align: center; padding: 40px; grid-column: 1/-1;">
                    <div class="no-products-icon" style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button class="btn btn-primary" onclick="advancedShop.clearAllFilters()">
                        Clear All Filters
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        const stars = this.generateStars(product.rating || 0);
        
        return `
            <div class="product-card" data-id="${product.id}">
                ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
                <div class="product-image">
                    <img src="${product.image || product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}" alt="${product.name}" loading="lazy">
                    <div class="product-overlay">
                        <button class="btn-overlay" onclick="quickView(${product.id})">
                            <i class="fas fa-eye"></i> Quick View
                        </button>
                        <button class="btn-overlay" onclick="addToWishlist(${product.id})">
                            <i class="far fa-heart"></i> Wishlist
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand || 'No Brand'}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        ${stars}
                        <span class="rating-count">(${product.reviews || 0})</span>
                    </div>
                    <div class="product-colors">
                        ${(product.colors || []).map(color => `
                            <span class="color-dot" style="background-color: ${color}" title="${color}"></span>
                        `).join('')}
                    </div>
                    <div class="product-price">
                        <span class="current-price">₹${product.price.toLocaleString()}</span>
                        ${product.originalPrice > product.price ? 
                            `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''
                        }
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-buy-now" onclick="buyNow(${product.id})">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        return `<div class="stars">${stars}</div><span class="rating-value">${rating}</span>`;
    }

    updateResultsCount() {
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            const total = this.filteredProducts.length;
            const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endIndex = Math.min(startIndex + this.itemsPerPage - 1, total);
            
            resultsCount.textContent = `Showing ${startIndex}-${endIndex} of ${total} products`;
        }
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.querySelector('.active-filter-tags');
        if (!activeFiltersContainer) return;

        const activeTags = [];

        // Price filter
        if (this.currentFilters.priceMin > 0 || this.currentFilters.priceMax < 10000) {
            activeTags.push({
                type: 'price',
                text: `₹${this.currentFilters.priceMin} - ₹${this.currentFilters.priceMax}`,
                value: 'price'
            });
        }

        // Rating filter
        if (this.currentFilters.rating > 0) {
            activeTags.push({
                type: 'rating',
                text: `${this.currentFilters.rating}+ Stars`,
                value: 'rating'
            });
        }

        // Color filters
        this.currentFilters.colors.forEach(color => {
            activeTags.push({
                type: 'color',
                text: color.charAt(0).toUpperCase() + color.slice(1),
                value: color
            });
        });

        // Brand filters
        this.currentFilters.brands.forEach(brand => {
            activeTags.push({
                type: 'brand',
                text: brand,
                value: brand
            });
        });

        if (activeTags.length === 0) {
            const activeFiltersSection = document.querySelector('.active-filters');
            if (activeFiltersSection) {
                activeFiltersSection.style.display = 'none';
            }
            return;
        }

        const activeFiltersSection = document.querySelector('.active-filters');
        if (activeFiltersSection) {
            activeFiltersSection.style.display = 'block';
        }
        
        activeFiltersContainer.innerHTML = activeTags.map(tag => `
            <span class="filter-tag">
                ${tag.text}
                <span class="remove-tag" onclick="advancedShop.removeFilter('${tag.type}', '${tag.value}')">×</span>
            </span>
        `).join('');
    }

    removeFilter(type, value) {
        switch (type) {
            case 'price':
                this.currentFilters.priceMin = 0;
                this.currentFilters.priceMax = 10000;
                const minPriceInput = document.getElementById('minPrice');
                const maxPriceInput = document.getElementById('maxPrice');
                if (minPriceInput) minPriceInput.value = 0;
                if (maxPriceInput) maxPriceInput.value = 10000;
                this.updateSliderRange();
                break;
            case 'rating':
                this.currentFilters.rating = 0;
                const checkedRating = document.querySelector('input[name="rating"]:checked');
                if (checkedRating) checkedRating.checked = false;
                break;
            case 'color':
                const colorIndex = this.currentFilters.colors.indexOf(value);
                if (colorIndex > -1) {
                    this.currentFilters.colors.splice(colorIndex, 1);
                }
                const colorInput = document.querySelector(`input[value="${value}"]`);
                if (colorInput) colorInput.checked = false;
                break;
            case 'brand':
                const brandIndex = this.currentFilters.brands.indexOf(value);
                if (brandIndex > -1) {
                    this.currentFilters.brands.splice(brandIndex, 1);
                }
                const brandInput = document.querySelector(`input[value="${value}"]`);
                if (brandInput) brandInput.checked = false;
                break;
        }
        this.applyFilters();
        this.updateActiveFilters();
    }

    clearAllFilters() {
        // Reset all filters
        this.currentFilters = {
            search: '',
            category: '',
            priceMin: 0,
            priceMax: 10000,
            rating: 0,
            colors: [],
            brands: [],
            sortBy: 'relevance'
        };

        // Reset form inputs
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = '';

        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) sortFilter.value = 'relevance';

        const minPriceInput = document.getElementById('minPrice');
        if (minPriceInput) minPriceInput.value = 0;

        const maxPriceInput = document.getElementById('maxPrice');
        if (maxPriceInput) maxPriceInput.value = 10000;

        // Reset checkboxes and radio buttons
        document.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
        document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);

        this.updateSliderRange();
        this.applyFilters();
        this.updateActiveFilters();
        this.hideSearchResults();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Product Recommendations Engine
class RecommendationsEngine {
    constructor(shop) {
        this.shop = shop;
        this.recentlyViewed = this.getRecentlyViewed();
        this.userPreferences = this.getUserPreferences();
        this.init();
    }

    init() {
        this.renderRecommendationSections();
        this.setupRecommendationEventListeners();
    }

    renderRecommendationSections() {
        // Add recommendations sections to the shop page
        const shopContainer = document.querySelector('.shop-container') || document.querySelector('main');
        if (!shopContainer) return;

        const recommendationsHTML = `
            <div class="recommendations-section">
                <div class="container">
                    <!-- Recently Viewed Products -->
                    <div class="recommendation-block" id="recentlyViewed" style="display: none;">
                        <div class="recommendation-header">
                            <h3><i class="fas fa-history"></i> Recently Viewed</h3>
                            <button class="clear-history" onclick="recommendationsEngine.clearRecentlyViewed()">
                                Clear History
                            </button>
                        </div>
                        <div class="recommendation-grid" id="recentlyViewedGrid"></div>
                    </div>

                    <!-- You May Also Like -->
                    <div class="recommendation-block" id="youMayLike">
                        <div class="recommendation-header">
                            <h3><i class="fas fa-heart"></i> You May Also Like</h3>
                            <button class="refresh-recommendations" onclick="recommendationsEngine.refreshRecommendations('similar')">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                        <div class="recommendation-grid" id="youMayLikeGrid"></div>
                    </div>

                    <!-- Trending Products -->
                    <div class="recommendation-block" id="trending">
                        <div class="recommendation-header">
                            <h3><i class="fas fa-fire"></i> Trending Now</h3>
                            <span class="trending-badge">Hot</span>
                        </div>
                        <div class="recommendation-grid" id="trendingGrid"></div>
                    </div>

                    <!-- Frequently Bought Together -->
                    <div class="recommendation-block" id="frequentlyBought">
                        <div class="recommendation-header">
                            <h3><i class="fas fa-shopping-bag"></i> Frequently Bought Together</h3>
                            <span class="combo-discount">Save up to 15%</span>
                        </div>
                        <div class="combo-recommendations" id="comboRecommendations"></div>
                    </div>
                </div>
            </div>
        `;

        // Insert recommendations after the main shop content
        const shopGrid = document.querySelector('.shop-grid') || document.querySelector('.products-grid');
        if (shopGrid && shopGrid.parentNode) {
            shopGrid.parentNode.insertAdjacentHTML('afterend', recommendationsHTML);
        }

        this.updateRecommendations();
    }

    updateRecommendations() {
        this.renderRecentlyViewed();
        this.renderYouMayLike();
        this.renderTrending();
        this.renderFrequentlyBought();
    }

    renderRecentlyViewed() {
        const container = document.getElementById('recentlyViewedGrid');
        const section = document.getElementById('recentlyViewed');
        
        if (!container || !section) return;

        if (this.recentlyViewed.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        const recentProducts = this.recentlyViewed.map(id => 
            this.shop.products.find(p => p.id === id)
        ).filter(Boolean).slice(0, 4);

        container.innerHTML = recentProducts.map(product => 
            this.createRecommendationCard(product, 'recently-viewed')
        ).join('');
    }

    renderYouMayLike() {
        const container = document.getElementById('youMayLikeGrid');
        if (!container) return;

        const recommendations = this.getSimilarProducts().slice(0, 4);
        container.innerHTML = recommendations.map(product => 
            this.createRecommendationCard(product, 'similar')
        ).join('');
    }

    renderTrending() {
        const container = document.getElementById('trendingGrid');
        if (!container) return;

        const trending = this.shop.products
            .filter(p => p.featured || (p.reviews && p.reviews > 50))
            .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
            .slice(0, 4);

        container.innerHTML = trending.map(product => 
            this.createRecommendationCard(product, 'trending')
        ).join('');
    }

    renderFrequentlyBought() {
        const container = document.getElementById('comboRecommendations');
        if (!container) return;

        const combos = this.getProductCombos();
        container.innerHTML = combos.map(combo => this.createComboCard(combo)).join('');
    }

    getSimilarProducts() {
        // Get products similar to recently viewed or filtered products
        const currentCategory = this.shop.currentFilters.category;
        const userColors = this.userPreferences.colors || [];
        const userBrands = this.userPreferences.brands || [];

        let similarProducts = [...this.shop.products];

        // Filter by category if available
        if (currentCategory && currentCategory !== 'all') {
            similarProducts = similarProducts.filter(p => p.category === currentCategory);
        }

        // Score products based on user preferences
        similarProducts = similarProducts.map(product => {
            let score = Math.random(); // Base randomness

            // Boost score for preferred colors
            if (product.colors && userColors.some(color => product.colors.includes(color))) {
                score += 0.3;
            }

            // Boost score for preferred brands
            if (userBrands.includes(product.brand)) {
                score += 0.2;
            }

            // Boost score for highly rated products
            if (product.rating > 4) {
                score += 0.1;
            }

            return { ...product, score };
        });

        return similarProducts
            .sort((a, b) => b.score - a.score)
            .filter(p => !this.recentlyViewed.includes(p.id));
    }

    getProductCombos() {
        // Create product combinations that are frequently bought together
        const combos = [
            {
                mainProduct: this.shop.products[0],
                comboProducts: [this.shop.products[1], this.shop.products[2]],
                discount: 10,
                totalSavings: 500
            },
            {
                mainProduct: this.shop.products[3],
                comboProducts: [this.shop.products[4]],
                discount: 15,
                totalSavings: 300
            }
        ];

        return combos.filter(combo => combo.mainProduct && combo.comboProducts.every(p => p));
    }

    createRecommendationCard(product, type) {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        
        return `
            <div class="recommendation-card" data-type="${type}" onclick="recommendationsEngine.viewProduct(${product.id})">
                <div class="rec-image">
                    <img src="${product.image || product.imageUrl || 'https://via.placeholder.com/200x250'}" 
                         alt="${product.name}" loading="lazy">
                    ${discount > 0 ? `<div class="rec-discount">${discount}% OFF</div>` : ''}
                    ${type === 'trending' ? '<div class="trending-indicator">🔥</div>' : ''}
                </div>
                <div class="rec-info">
                    <div class="rec-brand">${product.brand || 'No Brand'}</div>
                    <h4 class="rec-name">${product.name}</h4>
                    <div class="rec-rating">
                        ${this.generateStars(product.rating || 0)}
                        <span>(${product.reviews || 0})</span>
                    </div>
                    <div class="rec-price">
                        <span class="rec-current">₹${product.price.toLocaleString()}</span>
                        ${product.originalPrice > product.price ? 
                            `<span class="rec-original">₹${product.originalPrice.toLocaleString()}</span>` : ''
                        }
                    </div>
                    <button class="rec-add-cart" onclick="event.stopPropagation(); recommendationsEngine.addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    }

    createComboCard(combo) {
        const totalPrice = combo.mainProduct.price + combo.comboProducts.reduce((sum, p) => sum + p.price, 0);
        const discountedPrice = totalPrice * (1 - combo.discount / 100);

        return `
            <div class="combo-card">
                <div class="combo-header">
                    <h4>Complete the Look</h4>
                    <div class="combo-savings">Save ₹${combo.totalSavings}</div>
                </div>
                <div class="combo-products">
                    <div class="combo-main">
                        <img src="${combo.mainProduct.image || 'https://via.placeholder.com/120x150'}" 
                             alt="${combo.mainProduct.name}">
                        <div class="combo-product-info">
                            <h5>${combo.mainProduct.name}</h5>
                            <span>₹${combo.mainProduct.price.toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="combo-plus">+</div>
                    <div class="combo-additional">
                        ${combo.comboProducts.map(product => `
                            <div class="combo-item">
                                <img src="${product.image || 'https://via.placeholder.com/80x100'}" 
                                     alt="${product.name}">
                                <div class="combo-item-info">
                                    <span>${product.name}</span>
                                    <span>₹${product.price.toLocaleString()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="combo-pricing">
                    <div class="combo-original">Total: ₹${totalPrice.toLocaleString()}</div>
                    <div class="combo-discounted">Combo Price: ₹${discountedPrice.toLocaleString()}</div>
                    <div class="combo-discount">${combo.discount}% OFF</div>
                </div>
                <button class="combo-add-all" onclick="recommendationsEngine.addComboToCart(${JSON.stringify(combo).replace(/"/g, '&quot;')})">
                    <i class="fas fa-shopping-bag"></i> Add All to Cart
                </button>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        return stars;
    }

    viewProduct(productId) {
        this.addToRecentlyViewed(productId);
        // In a real app, this would navigate to product detail page
        const product = this.shop.products.find(p => p.id === productId);
        if (product) {
            showQuickViewModal(product);
        }
    }

    addToCart(productId) {
        const product = this.shop.products.find(p => p.id === productId);
        if (product) {
            this.updateUserPreferences(product);
            showNotification(`${product.name} added to cart!`, 'success');
        }
    }

    addComboToCart(combo) {
        const allProducts = [combo.mainProduct, ...combo.comboProducts];
        allProducts.forEach(product => this.updateUserPreferences(product));
        showNotification(`Combo added to cart! Saved ₹${combo.totalSavings}`, 'success');
    }

    addToRecentlyViewed(productId) {
        if (!this.recentlyViewed.includes(productId)) {
            this.recentlyViewed.unshift(productId);
            if (this.recentlyViewed.length > 10) {
                this.recentlyViewed = this.recentlyViewed.slice(0, 10);
            }
            localStorage.setItem('recentlyViewed', JSON.stringify(this.recentlyViewed));
            this.renderRecentlyViewed();
        }
    }

    updateUserPreferences(product) {
        // Update user preferences based on interaction
        if (product.colors) {
            this.userPreferences.colors = [...new Set([
                ...(this.userPreferences.colors || []),
                ...product.colors
            ])];
        }

        if (product.brand && !this.userPreferences.brands.includes(product.brand)) {
            this.userPreferences.brands.push(product.brand);
        }

        if (product.category && !this.userPreferences.categories.includes(product.category)) {
            this.userPreferences.categories.push(product.category);
        }

        localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
    }

    getRecentlyViewed() {
        const stored = localStorage.getItem('recentlyViewed');
        return stored ? JSON.parse(stored) : [];
    }

    getUserPreferences() {
        const stored = localStorage.getItem('userPreferences');
        return stored ? JSON.parse(stored) : {
            colors: [],
            brands: [],
            categories: [],
            priceRange: { min: 0, max: 10000 }
        };
    }

    clearRecentlyViewed() {
        this.recentlyViewed = [];
        localStorage.removeItem('recentlyViewed');
        this.renderRecentlyViewed();
        showNotification('Recently viewed history cleared', 'info');
    }

    refreshRecommendations(type) {
        if (type === 'similar') {
            this.renderYouMayLike();
        }
        showNotification('Recommendations refreshed!', 'info');
    }

    setupRecommendationEventListeners() {
        // Add scroll-based lazy loading for recommendations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    if (!section.dataset.loaded) {
                        section.dataset.loaded = 'true';
                        this.updateRecommendations();
                    }
                }
            });
        });

        const recommendationSections = document.querySelectorAll('.recommendation-block');
        recommendationSections.forEach(section => observer.observe(section));
    }
}

// Initialize the enhanced shop when DOM is loaded
let advancedShop;
let recommendationsEngine;
document.addEventListener('DOMContentLoaded', () => {
    advancedShop = new AdvancedShop();
    // Initialize recommendations after shop is ready
    setTimeout(() => {
        recommendationsEngine = new RecommendationsEngine(advancedShop);
    }, 500);
});

// Additional utility functions for product interactions
function quickView(productId) {
    const product = advancedShop.products.find(p => p.id === productId);
    if (product) {
        showQuickViewModal(product);
    }
}

function addToCart(productId) {
    const product = advancedShop.products.find(p => p.id === productId);
    if (product) {
        console.log('Adding to cart:', product.name);
        showNotification(`${product.name} added to cart!`, 'success');
    }
}

function addToWishlist(productId) {
    const product = advancedShop.products.find(p => p.id === productId);
    if (product) {
        console.log('Adding to wishlist:', product.name);
        showNotification(`${product.name} added to wishlist!`, 'success');
    }
}

function buyNow(productId) {
    const product = advancedShop.products.find(p => p.id === productId);
    if (product) {
        console.log('Buy now:', product.name);
        window.location.href = `checkout.html?product=${productId}`;
    }
}

function showQuickViewModal(product) {
    const modalHTML = `
        <div class="quick-view-modal" id="quickViewModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div class="modal-overlay" onclick="closeQuickView()" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
            <div class="modal-content" style="background: white; max-width: 800px; width: 90%; max-height: 90%; overflow-y: auto; border-radius: 10px; position: relative; z-index: 1;">
                <button class="modal-close" onclick="closeQuickView()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                <div class="quick-view-content" style="display: flex; padding: 20px; gap: 20px;">
                    <div class="quick-view-image" style="flex: 1;">
                        <img src="${product.image || product.imageUrl || 'https://via.placeholder.com/400'}" alt="${product.name}" style="width: 100%; border-radius: 8px;">
                    </div>
                    <div class="quick-view-details" style="flex: 1;">
                        <h2>${product.name}</h2>
                        <p class="brand" style="color: #666; margin: 10px 0;">${product.brand || 'No Brand'}</p>
                        <div class="rating" style="margin: 10px 0;">
                            ${advancedShop.generateStars(product.rating || 0)}
                        </div>
                        <div class="price" style="margin: 20px 0;">
                            <span class="current-price" style="font-size: 24px; font-weight: bold; color: #007bff;">₹${product.price.toLocaleString()}</span>
                            ${product.originalPrice > product.price ? 
                                `<span class="original-price" style="text-decoration: line-through; color: #999; margin-left: 10px;">₹${product.originalPrice.toLocaleString()}</span>` : ''
                            }
                        </div>
                        <div class="colors" style="margin: 20px 0;">
                            <h4>Available Colors:</h4>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                ${(product.colors || []).map(color => `
                                    <span class="color-option" style="width: 30px; height: 30px; border-radius: 50%; background-color: ${color}; border: 2px solid #ddd;" title="${color}"></span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="actions" style="display: flex; gap: 10px; margin-top: 30px;">
                            <button class="btn btn-primary" onclick="addToCart(${product.id}); closeQuickView();" style="flex: 1; padding: 12px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Add to Cart
                            </button>
                            <button class="btn btn-secondary" onclick="buyNow(${product.id})" style="flex: 1; padding: 12px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
