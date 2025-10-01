// Customer Reviews System
class ReviewsSystem {
    constructor() {
        this.reviews = this.loadReviews();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupReviewEventListeners();
    }

    loadReviews() {
        // Load reviews from localStorage or use demo data
        const stored = localStorage.getItem('productReviews');
        if (stored) {
            return JSON.parse(stored);
        }

        // Demo reviews data
        return {
            1: [
                {
                    id: 'r1',
                    userId: 'user1',
                    userName: 'Priya Sharma',
                    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b567?w=50',
                    rating: 5,
                    title: 'Absolutely Beautiful!',
                    content: 'The quality is amazing and the color is exactly as shown. Perfect for special occasions. The fabric feels premium and the stitching is excellent.',
                    date: '2024-09-25',
                    verified: true,
                    helpful: 15,
                    images: [
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
                        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300'
                    ],
                    size: 'M',
                    color: 'Red',
                    liked: false
                },
                {
                    id: 'r2',
                    userId: 'user2',
                    userName: 'Anjali Patel',
                    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50',
                    rating: 4,
                    title: 'Good Quality',
                    content: 'Nice product overall. The delivery was quick and packaging was good. Only issue is the color is slightly different from what I expected.',
                    date: '2024-09-20',
                    verified: true,
                    helpful: 8,
                    images: [],
                    size: 'L',
                    color: 'Red',
                    liked: false
                }
            ],
            2: [
                {
                    id: 'r3',
                    userId: 'user3',
                    userName: 'Ritu Gupta',
                    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50',
                    rating: 5,
                    title: 'Perfect for Wedding!',
                    content: 'Wore this for my sister\'s wedding and received so many compliments. The embroidery work is intricate and beautiful. Highly recommended!',
                    date: '2024-09-18',
                    verified: true,
                    helpful: 22,
                    images: [
                        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300'
                    ],
                    size: 'S',
                    color: 'Blue',
                    liked: false
                }
            ]
        };
    }

    getCurrentUser() {
        // Get current user from localStorage or return guest user
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : {
            id: 'guest',
            name: 'Guest User',
            avatar: 'https://via.placeholder.com/50x50?text=G'
        };
    }

    renderReviewsSection(productId, container) {
        if (!container) return;

        const productReviews = this.reviews[productId] || [];
        const averageRating = this.calculateAverageRating(productReviews);
        const ratingDistribution = this.calculateRatingDistribution(productReviews);

        const reviewsHTML = `
            <div class="reviews-section" id="reviewsSection">
                <div class="reviews-header">
                    <h3><i class="fas fa-star"></i> Customer Reviews (${productReviews.length})</h3>
                    <button class="write-review-btn" onclick="reviewsSystem.showWriteReviewModal(${productId})">
                        <i class="fas fa-edit"></i> Write a Review
                    </button>
                </div>

                <div class="reviews-summary">
                    <div class="overall-rating">
                        <div class="rating-score">${averageRating.toFixed(1)}</div>
                        <div class="rating-stars">
                            ${this.generateStars(averageRating)}
                        </div>
                        <div class="rating-count">Based on ${productReviews.length} reviews</div>
                    </div>

                    <div class="rating-breakdown">
                        ${Object.entries(ratingDistribution).reverse().map(([rating, data]) => `
                            <div class="rating-bar">
                                <span class="rating-label">${rating} ★</span>
                                <div class="rating-progress">
                                    <div class="rating-fill" style="width: ${data.percentage}%"></div>
                                </div>
                                <span class="rating-count">${data.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="reviews-filters">
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">All Reviews</button>
                        <button class="filter-btn" data-filter="5">5 Stars</button>
                        <button class="filter-btn" data-filter="4">4 Stars</button>
                        <button class="filter-btn" data-filter="with-photos">With Photos</button>
                        <button class="filter-btn" data-filter="verified">Verified Purchase</button>
                    </div>
                    <div class="sort-options">
                        <select id="reviewSort" onchange="reviewsSystem.sortReviews(${productId})">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                            <option value="helpful">Most Helpful</option>
                        </select>
                    </div>
                </div>

                <div class="reviews-list" id="reviewsList">
                    ${productReviews.map(review => this.createReviewCard(review, productId)).join('')}
                </div>

                ${productReviews.length === 0 ? `
                    <div class="no-reviews">
                        <div class="no-reviews-icon">📝</div>
                        <h4>No reviews yet</h4>
                        <p>Be the first to review this product!</p>
                        <button class="btn btn-primary" onclick="reviewsSystem.showWriteReviewModal(${productId})">
                            Write First Review
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = reviewsHTML;
        this.setupReviewFilters(productId);
    }

    createReviewCard(review, productId) {
        return `
            <div class="review-card" data-rating="${review.rating}" data-verified="${review.verified}" data-photos="${review.images.length > 0}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar">
                        <div class="reviewer-details">
                            <div class="reviewer-name">
                                ${review.userName}
                                ${review.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
                            </div>
                            <div class="review-meta">
                                <div class="review-rating">${this.generateStars(review.rating)}</div>
                                <div class="review-date">${this.formatDate(review.date)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="review-actions">
                        <button class="review-action-btn" onclick="reviewsSystem.toggleHelpful('${review.id}', ${productId})">
                            <i class="fas fa-thumbs-up ${review.liked ? 'liked' : ''}"></i>
                            <span>${review.helpful}</span>
                        </button>
                    </div>
                </div>

                <div class="review-content">
                    <h4 class="review-title">${review.title}</h4>
                    <p class="review-text">${review.content}</p>
                    
                    ${review.size || review.color ? `
                        <div class="review-attributes">
                            ${review.size ? `<span class="attribute-tag">Size: ${review.size}</span>` : ''}
                            ${review.color ? `<span class="attribute-tag">Color: ${review.color}</span>` : ''}
                        </div>
                    ` : ''}

                    ${review.images.length > 0 ? `
                        <div class="review-images">
                            ${review.images.map((image, index) => `
                                <img src="${image}" alt="Review image ${index + 1}" 
                                     onclick="reviewsSystem.showImageModal('${image}', ${JSON.stringify(review.images).replace(/"/g, '&quot;')})"
                                     class="review-image">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showWriteReviewModal(productId) {
        const modalHTML = `
            <div class="review-modal" id="reviewModal">
                <div class="modal-overlay" onclick="reviewsSystem.closeReviewModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Write a Review</h3>
                        <button class="modal-close" onclick="reviewsSystem.closeReviewModal()">×</button>
                    </div>
                    <form class="review-form" onsubmit="reviewsSystem.submitReview(event, ${productId})">
                        <div class="form-group">
                            <label>Overall Rating</label>
                            <div class="star-rating" id="starRating">
                                ${[5,4,3,2,1].map(rating => `
                                    <input type="radio" name="rating" value="${rating}" id="star${rating}" required>
                                    <label for="star${rating}" class="star"><i class="fas fa-star"></i></label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="reviewTitle">Review Title</label>
                            <input type="text" id="reviewTitle" placeholder="Summarize your experience" required>
                        </div>

                        <div class="form-group">
                            <label for="reviewContent">Your Review</label>
                            <textarea id="reviewContent" rows="5" 
                                    placeholder="Tell others about your experience with this product..." required></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="reviewSize">Size Purchased</label>
                                <select id="reviewSize">
                                    <option value="">Select Size</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reviewColor">Color Purchased</label>
                                <input type="text" id="reviewColor" placeholder="e.g., Red, Blue">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="reviewImages">Add Photos (Optional)</label>
                            <input type="file" id="reviewImages" multiple accept="image/*" 
                                   onchange="reviewsSystem.previewImages(event)">
                            <div class="image-preview" id="imagePreview"></div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="reviewsSystem.closeReviewModal()">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    }

    submitReview(event, productId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const rating = parseInt(formData.get('rating'));
        const title = document.getElementById('reviewTitle').value;
        const content = document.getElementById('reviewContent').value;
        const size = document.getElementById('reviewSize').value;
        const color = document.getElementById('reviewColor').value;

        const newReview = {
            id: 'r' + Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.avatar,
            rating: rating,
            title: title,
            content: content,
            date: new Date().toISOString().split('T')[0],
            verified: true, // Assume verified if user is logged in
            helpful: 0,
            images: [], // In a real app, handle image upload
            size: size,
            color: color,
            liked: false
        };

        // Add review to product
        if (!this.reviews[productId]) {
            this.reviews[productId] = [];
        }
        this.reviews[productId].unshift(newReview);

        // Save to localStorage
        localStorage.setItem('productReviews', JSON.stringify(this.reviews));

        // Close modal and refresh reviews
        this.closeReviewModal();
        
        // Re-render reviews section
        const reviewsContainer = document.getElementById('reviewsSection').parentNode;
        this.renderReviewsSection(productId, reviewsContainer);

        showNotification('Review submitted successfully!', 'success');
    }

    closeReviewModal() {
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    previewImages(event) {
        const files = event.target.files;
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'preview-image';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupReviewFilters(productId) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterReviews(productId, e.target.dataset.filter);
            });
        });
    }

    filterReviews(productId, filter) {
        const reviewCards = document.querySelectorAll('.review-card');
        
        reviewCards.forEach(card => {
            let show = true;
            
            switch(filter) {
                case 'all':
                    show = true;
                    break;
                case '5':
                case '4':
                case '3':
                case '2':
                case '1':
                    show = card.dataset.rating === filter;
                    break;
                case 'with-photos':
                    show = card.dataset.photos === 'true';
                    break;
                case 'verified':
                    show = card.dataset.verified === 'true';
                    break;
            }
            
            card.style.display = show ? 'block' : 'none';
        });
    }

    sortReviews(productId) {
        const sortValue = document.getElementById('reviewSort').value;
        const reviewsList = document.getElementById('reviewsList');
        const reviews = [...(this.reviews[productId] || [])];

        switch(sortValue) {
            case 'newest':
                reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                reviews.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'highest':
                reviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                reviews.sort((a, b) => a.rating - b.rating);
                break;
            case 'helpful':
                reviews.sort((a, b) => b.helpful - a.helpful);
                break;
        }

        reviewsList.innerHTML = reviews.map(review => this.createReviewCard(review, productId)).join('');
    }

    toggleHelpful(reviewId, productId) {
        const review = this.reviews[productId].find(r => r.id === reviewId);
        if (review) {
            if (review.liked) {
                review.helpful = Math.max(0, review.helpful - 1);
                review.liked = false;
            } else {
                review.helpful += 1;
                review.liked = true;
            }
            
            localStorage.setItem('productReviews', JSON.stringify(this.reviews));
            
            // Update the display
            const helpfulBtn = document.querySelector(`[onclick*="${reviewId}"]`);
            if (helpfulBtn) {
                helpfulBtn.innerHTML = `<i class="fas fa-thumbs-up ${review.liked ? 'liked' : ''}"></i><span>${review.helpful}</span>`;
            }
        }
    }

    showImageModal(imageSrc, allImages) {
        const images = JSON.parse(allImages.replace(/&quot;/g, '"'));
        const currentIndex = images.indexOf(imageSrc);
        
        const modalHTML = `
            <div class="image-modal" id="imageModal">
                <div class="modal-overlay" onclick="reviewsSystem.closeImageModal()"></div>
                <div class="image-modal-content">
                    <button class="modal-close" onclick="reviewsSystem.closeImageModal()">×</button>
                    ${images.length > 1 ? '<button class="nav-btn prev-btn" onclick="reviewsSystem.navigateImage(-1)">‹</button>' : ''}
                    <img src="${imageSrc}" alt="Review image" id="modalImage">
                    ${images.length > 1 ? '<button class="nav-btn next-btn" onclick="reviewsSystem.navigateImage(1)">›</button>' : ''}
                    <div class="image-counter">${currentIndex + 1} / ${images.length}</div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Store images for navigation
        this.modalImages = images;
        this.currentImageIndex = currentIndex;
    }

    navigateImage(direction) {
        this.currentImageIndex += direction;
        
        if (this.currentImageIndex < 0) {
            this.currentImageIndex = this.modalImages.length - 1;
        } else if (this.currentImageIndex >= this.modalImages.length) {
            this.currentImageIndex = 0;
        }
        
        const modalImage = document.getElementById('modalImage');
        const counter = document.querySelector('.image-counter');
        
        if (modalImage) {
            modalImage.src = this.modalImages[this.currentImageIndex];
        }
        if (counter) {
            counter.textContent = `${this.currentImageIndex + 1} / ${this.modalImages.length}`;
        }
    }

    closeImageModal() {
        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }

    calculateAverageRating(reviews) {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
    }

    calculateRatingDistribution(reviews) {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        reviews.forEach(review => {
            distribution[review.rating]++;
        });

        // Calculate percentages
        const total = reviews.length;
        Object.keys(distribution).forEach(rating => {
            const count = distribution[rating];
            distribution[rating] = {
                count: count,
                percentage: total > 0 ? (count / total) * 100 : 0
            };
        });

        return distribution;
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    setupReviewEventListeners() {
        // Additional event listeners for reviews functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('.review-modal .modal-overlay')) {
                this.closeReviewModal();
            }
            if (e.target.matches('.image-modal .modal-overlay')) {
                this.closeImageModal();
            }
        });

        // Keyboard navigation for image modal
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('imageModal')) {
                if (e.key === 'ArrowLeft') {
                    this.navigateImage(-1);
                } else if (e.key === 'ArrowRight') {
                    this.navigateImage(1);
                } else if (e.key === 'Escape') {
                    this.closeImageModal();
                }
            }
        });
    }
}

// Initialize reviews system
let reviewsSystem;
document.addEventListener('DOMContentLoaded', () => {
    reviewsSystem = new ReviewsSystem();
});
