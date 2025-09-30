// Hero Slider Functionality for Shree Shyam Collection

const HeroSlider = {
    currentSlide: 0,
    slides: [],
    indicators: [],
    autoplayInterval: null,
    autoplayDelay: 5000,
    isAutoplayActive: true,

    // Initialize the slider
    init: function() {
        this.slides = Utils.querySelectorAll('.hero-slide');
        this.indicators = Utils.querySelectorAll('.indicator');
        
        if (this.slides.length === 0) return;

        this.setupEventListeners();
        this.startAutoplay();
        this.preloadImages();
    },

    // Setup event listeners for controls
    setupEventListeners: function() {
        // Previous button
        const prevBtn = Utils.querySelector('.hero-prev');
        Utils.addEventListener(prevBtn, 'click', () => {
            this.previousSlide();
        });

        // Next button
        const nextBtn = Utils.querySelector('.hero-next');
        Utils.addEventListener(nextBtn, 'click', () => {
            this.nextSlide();
        });

        // Indicator clicks
        this.indicators.forEach((indicator, index) => {
            Utils.addEventListener(indicator, 'click', () => {
                this.goToSlide(index);
            });
        });

        // Touch/swipe support
        this.setupTouchEvents();

        // Keyboard navigation
        Utils.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Pause autoplay on hover
        const heroSection = Utils.querySelector('.hero');
        Utils.addEventListener(heroSection, 'mouseenter', () => {
            this.pauseAutoplay();
        });

        Utils.addEventListener(heroSection, 'mouseleave', () => {
            this.resumeAutoplay();
        });

        // Pause autoplay when page is not visible
        Utils.addEventListener(document, 'visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.resumeAutoplay();
            }
        });
    },

    // Setup touch/swipe events for mobile
    setupTouchEvents: function() {
        const heroSection = Utils.querySelector('.hero');
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        Utils.addEventListener(heroSection, 'touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        Utils.addEventListener(heroSection, 'touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        });
    },

    // Handle swipe gestures
    handleSwipe: function(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - go to previous slide
                this.previousSlide();
            } else {
                // Swipe left - go to next slide
                this.nextSlide();
            }
        }
    },

    // Go to next slide
    nextSlide: function() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlider();
        this.resetAutoplay();
    },

    // Go to previous slide
    previousSlide: function() {
        this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.updateSlider();
        this.resetAutoplay();
    },

    // Go to specific slide
    goToSlide: function(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            this.updateSlider();
            this.resetAutoplay();
        }
    },

    // Update slider display
    updateSlider: function() {
        // Update slides
        this.slides.forEach((slide, index) => {
            if (index === this.currentSlide) {
                Utils.addClass(slide, 'active');
            } else {
                Utils.removeClass(slide, 'active');
            }
        });

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            if (index === this.currentSlide) {
                Utils.addClass(indicator, 'active');
            } else {
                Utils.removeClass(indicator, 'active');
            }
        });

        // Trigger analytics event
        this.trackSlideChange();
    },

    // Start autoplay
    startAutoplay: function() {
        if (this.isAutoplayActive && this.slides.length > 1) {
            this.autoplayInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoplayDelay);
        }
    },

    // Pause autoplay
    pauseAutoplay: function() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    },

    // Resume autoplay
    resumeAutoplay: function() {
        if (this.isAutoplayActive && !this.autoplayInterval) {
            this.startAutoplay();
        }
    },

    // Reset autoplay (restart the timer)
    resetAutoplay: function() {
        this.pauseAutoplay();
        this.startAutoplay();
    },

    // Preload images for better performance
    preloadImages: function() {
        this.slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img && img.dataset.src) {
                // If using lazy loading, preload first few images
                if (index < 3) {
                    img.src = img.dataset.src;
                }
            }
        });
    },

    // Track slide changes for analytics
    trackSlideChange: function() {
        console.log(`Hero slide changed to: ${this.currentSlide + 1}`);
        // This would integrate with analytics service
    }
};

// Image carousel/gallery functionality (for product pages)
const ImageGallery = {
    currentImage: 0,
    images: [],

    init: function() {
        this.setupMainImageGallery();
        this.setupThumbnailGallery();
        this.setupZoomFunctionality();
    },

    setupMainImageGallery: function() {
        const mainImage = Utils.getElementById('mainProductImage');
        const thumbnails = Utils.querySelectorAll('.thumbnail-images img');

        if (!mainImage || thumbnails.length === 0) return;

        // Store image sources
        this.images = Array.from(thumbnails).map(thumb => thumb.src);

        // Add click handlers to thumbnails
        thumbnails.forEach((thumbnail, index) => {
            Utils.addEventListener(thumbnail, 'click', () => {
                this.changeMainImage(index);
            });

            // Add hover effect for desktop
            Utils.addEventListener(thumbnail, 'mouseenter', () => {
                if (window.innerWidth > 768) {
                    this.changeMainImage(index);
                }
            });
        });

        // Add keyboard navigation
        Utils.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.previousImage();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.nextImage();
            }
        });
    },

    setupThumbnailGallery: function() {
        const thumbnailContainer = Utils.getElementById('thumbnailImages');
        if (!thumbnailContainer) return;

        // Add scroll buttons if needed
        this.addThumbnailScrollControls(thumbnailContainer);
    },

    addThumbnailScrollControls: function(container) {
        if (container.scrollWidth > container.clientWidth) {
            // Add scroll buttons
            const scrollUpBtn = document.createElement('button');
            scrollUpBtn.className = 'thumbnail-scroll-btn scroll-up';
            scrollUpBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';

            const scrollDownBtn = document.createElement('button');
            scrollDownBtn.className = 'thumbnail-scroll-btn scroll-down';
            scrollDownBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';

            Utils.addEventListener(scrollUpBtn, 'click', () => {
                container.scrollBy({ top: -100, behavior: 'smooth' });
            });

            Utils.addEventListener(scrollDownBtn, 'click', () => {
                container.scrollBy({ top: 100, behavior: 'smooth' });
            });

            container.parentNode.insertBefore(scrollUpBtn, container);
            container.parentNode.appendChild(scrollDownBtn);
        }
    },

    changeMainImage: function(index) {
        if (index >= 0 && index < this.images.length) {
            const mainImage = Utils.getElementById('mainProductImage');
            if (mainImage) {
                // Add fade effect
                mainImage.style.opacity = '0';
                
                setTimeout(() => {
                    mainImage.src = this.images[index];
                    mainImage.style.opacity = '1';
                }, 150);

                this.currentImage = index;
                this.updateThumbnailSelection();
            }
        }
    },

    updateThumbnailSelection: function() {
        const thumbnails = Utils.querySelectorAll('.thumbnail-images img');
        thumbnails.forEach((thumbnail, index) => {
            if (index === this.currentImage) {
                Utils.addClass(thumbnail, 'active');
            } else {
                Utils.removeClass(thumbnail, 'active');
            }
        });
    },

    nextImage: function() {
        const nextIndex = (this.currentImage + 1) % this.images.length;
        this.changeMainImage(nextIndex);
    },

    previousImage: function() {
        const prevIndex = this.currentImage === 0 ? this.images.length - 1 : this.currentImage - 1;
        this.changeMainImage(prevIndex);
    },

    setupZoomFunctionality: function() {
        const mainImage = Utils.getElementById('mainProductImage');
        const zoomContainer = Utils.getElementById('imageZoom');

        if (!mainImage || !zoomContainer) return;

        Utils.addEventListener(mainImage, 'mouseenter', () => {
            this.showZoom(mainImage, zoomContainer);
        });

        Utils.addEventListener(mainImage, 'mouseleave', () => {
            this.hideZoom(zoomContainer);
        });

        Utils.addEventListener(mainImage, 'mousemove', (e) => {
            this.updateZoom(e, mainImage, zoomContainer);
        });
    },

    showZoom: function(image, zoomContainer) {
        if (window.innerWidth > 768) { // Only on desktop
            zoomContainer.style.display = 'block';
            zoomContainer.style.backgroundImage = `url(${image.src})`;
        }
    },

    hideZoom: function(zoomContainer) {
        zoomContainer.style.display = 'none';
    },

    updateZoom: function(e, image, zoomContainer) {
        if (window.innerWidth <= 768) return; // Skip on mobile

        const rect = image.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        zoomContainer.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    }
};

// Generic carousel component
const Carousel = {
    create: function(containerId, options = {}) {
        const container = Utils.getElementById(containerId);
        if (!container) return null;

        const carousel = {
            container: container,
            items: container.querySelectorAll('.carousel-item'),
            currentIndex: 0,
            autoplay: options.autoplay || false,
            autoplayDelay: options.autoplayDelay || 3000,
            showDots: options.showDots || false,
            showArrows: options.showArrows || true,
            interval: null,

            init: function() {
                this.setupControls();
                if (this.autoplay) {
                    this.startAutoplay();
                }
                this.updateDisplay();
            },

            setupControls: function() {
                if (this.showArrows) {
                    this.addArrowControls();
                }
                if (this.showDots) {
                    this.addDotControls();
                }
            },

            addArrowControls: function() {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'carousel-prev';
                prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';

                const nextBtn = document.createElement('button');
                nextBtn.className = 'carousel-next';
                nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';

                Utils.addEventListener(prevBtn, 'click', () => this.previous());
                Utils.addEventListener(nextBtn, 'click', () => this.next());

                this.container.appendChild(prevBtn);
                this.container.appendChild(nextBtn);
            },

            addDotControls: function() {
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'carousel-dots';

                for (let i = 0; i < this.items.length; i++) {
                    const dot = document.createElement('button');
                    dot.className = 'carousel-dot';
                    Utils.addEventListener(dot, 'click', () => this.goTo(i));
                    dotsContainer.appendChild(dot);
                }

                this.container.appendChild(dotsContainer);
            },

            next: function() {
                this.currentIndex = (this.currentIndex + 1) % this.items.length;
                this.updateDisplay();
            },

            previous: function() {
                this.currentIndex = this.currentIndex === 0 ? this.items.length - 1 : this.currentIndex - 1;
                this.updateDisplay();
            },

            goTo: function(index) {
                this.currentIndex = index;
                this.updateDisplay();
            },

            updateDisplay: function() {
                this.items.forEach((item, index) => {
                    item.style.display = index === this.currentIndex ? 'block' : 'none';
                });

                // Update dots if they exist
                const dots = this.container.querySelectorAll('.carousel-dot');
                dots.forEach((dot, index) => {
                    if (index === this.currentIndex) {
                        Utils.addClass(dot, 'active');
                    } else {
                        Utils.removeClass(dot, 'active');
                    }
                });
            },

            startAutoplay: function() {
                this.interval = setInterval(() => {
                    this.next();
                }, this.autoplayDelay);
            },

            stopAutoplay: function() {
                if (this.interval) {
                    clearInterval(this.interval);
                    this.interval = null;
                }
            }
        };

        carousel.init();
        return carousel;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    HeroSlider.init();
    ImageGallery.init();
});

// Export slider functionality
window.ShreeShyamCollection = window.ShreeShyamCollection || {};
window.ShreeShyamCollection.HeroSlider = HeroSlider;
window.ShreeShyamCollection.ImageGallery = ImageGallery;
window.ShreeShyamCollection.Carousel = Carousel;