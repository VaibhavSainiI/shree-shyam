#!/bin/bash

# Shree Shyam Collection - Production Deployment Script
# This script sets up the production environment

set -e

echo "🚀 Starting Shree Shyam Collection deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found. Creating from template..."
    cp .env.example .env.production
    print_warning "Please edit .env.production with your production values before continuing."
    print_warning "Press Enter when ready to continue..."
    read
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p backend/uploads
mkdir -p data/mongodb
mkdir -p data/redis

# Set proper permissions
print_status "Setting permissions..."
chmod 755 nginx/ssl
chmod 755 backend/uploads
chmod 755 data

# Pull latest images
print_status "Pulling Docker images..."
docker-compose pull

# Build custom images
print_status "Building application images..."
docker-compose build --no-cache

# Start the services
print_status "Starting services..."
docker-compose --profile production up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_status "MongoDB is healthy"
else
    print_error "MongoDB health check failed"
fi

# Check Backend
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_status "Backend API is healthy"
else
    print_error "Backend API health check failed"
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Frontend is healthy"
else
    print_error "Frontend health check failed"
fi

# Seed database if needed
print_status "Seeding database with sample data..."
docker-compose exec backend npm run seed

# Display service URLs
echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
echo "Service URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  MongoDB: mongodb://localhost:27017"
echo "  Redis: redis://localhost:6379"
echo ""
echo "Default Admin Credentials:"
echo "  Email: admin@shreeshyamcollection.com"
echo "  Password: admin123"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f [service-name]"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
print_status "Happy selling! 🛍️"