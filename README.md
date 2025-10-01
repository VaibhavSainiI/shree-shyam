# 🌟 Shri Shyam Collection - Advanced E-commerce Platform

A modern, feature-rich e-commerce platform for ethnic Indian wear, built with cutting-edge technologies and enhanced with AI-powered features.

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Advanced Features

### 🔍 Advanced Product Search & Filtering
- **Smart Search**: Real-time search with auto-complete suggestions
- **Multi-Filter System**: Price range, ratings, categories, fabric types
- **Advanced Filters**: Size, color, occasion, designer, and more
- **Search Analytics**: Track popular searches and optimize results

### 🤖 AI-Powered Recommendations
- **Personalized Suggestions**: ML-driven product recommendations
- **Recently Viewed**: Track and display user browsing history
- **Trending Products**: Display popular and trending items
- **Combo Deals**: Smart bundling suggestions
- **Cross-sell & Upsell**: Intelligent product suggestions

### ⭐ Comprehensive Reviews System
- **Star Ratings**: 5-star rating system with detailed breakdowns
- **Photo Reviews**: Upload and display customer photos
- **Review Filtering**: Sort by rating, date, helpful votes
- **Helpful Votes**: Community-driven review quality system
- **Review Analytics**: Detailed review statistics and insights

### 🛍️ Core E-commerce Features
- **Product Catalog**: Comprehensive product management
- **Shopping Cart**: Advanced cart with saved items
- **Secure Checkout**: Multi-payment gateway integration
- **Order Management**: Complete order tracking system
- **User Authentication**: JWT-based secure authentication
- **Admin Dashboard**: Complete admin panel for management

### Frontend
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Modern UI**: Clean, elegant design optimized for ethnic wear presentation
- **Interactive Features**: Image sliders, product galleries, shopping cart
- **User Experience**: Smooth animations, intuitive navigation
- **PWA Ready**: Service worker implementation for offline capabilities

### Backend
- **RESTful API**: Comprehensive REST API with proper HTTP methods
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM for data modeling
- **Security**: CORS, helmet, rate limiting, input validation
- **File Upload**: Image upload with Cloudinary integration
- **Payment Integration**: Stripe and Razorpay for Indian market

### E-commerce Features
- **Product Management**: Categories, variants, inventory tracking
- **Shopping Cart**: Persistent cart with size/color selection
- **Order Management**: Complete order lifecycle with tracking
- **User Accounts**: Registration, profile management, wishlist
- **Admin Panel**: Product management, order processing
- **Reviews & Ratings**: Customer feedback system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Shri shyam collection"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run seed  # Populate sample data
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   # Serve using any static server
   npx serve . -s -l 3000
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Copy environment file
cp .env.example .env.production
# Edit .env.production with production values

# Start with production profile
docker-compose --profile production up -d
```

```
Shri-shyam-collection/
├── frontend/           # Client-side application
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   ├── images/        # Static images
│   └── *.html         # HTML pages
├── backend/           # Server-side application
│   ├── routes/        # API endpoints
│   ├── models/        # Database models
│   ├── middleware/    # Custom middleware
│   └── server.js      # Main server file
└── README.md
```

## Features

- Responsive design for all devices
- Product catalog with filtering and search
- Shopping cart and checkout process
- User authentication and profiles
- Admin panel for inventory management
- Payment gateway integration
- Order tracking system

## Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design with CSS Grid/Flexbox
- Modern UI/UX principles

### Backend
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- RESTful API design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Set up environment variables
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open frontend in browser or serve with live server

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.
