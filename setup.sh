#!/bin/bash

# DataBuddy Setup Script
# Menyiapkan aplikasi DataBuddy agar langsung siap pakai

set -e

echo "🚀 DataBuddy Setup Script"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is available
check_docker() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        print_success "Docker dan Docker Compose ditemukan"
        return 0
    else
        print_warning "Docker tidak ditemukan. Setup akan menggunakan instalasi manual"
        return 1
    fi
}

# Setup using Docker
setup_docker() {
    print_status "Menjalankan setup dengan Docker..."

    # Start database services
    print_status "Memulai PostgreSQL dan Redis..."
    docker-compose -f docker/docker-compose.dev.yml up -d postgres redis

    # Wait for services to be ready
    print_status "Menunggu database siap..."
    sleep 10

    # Setup backend
    cd backend
    if [ ! -f .env ]; then
        print_status "Membuat file .env dari template..."
        cp .env.example .env
    fi

    # Update .env for Docker
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/DATABASE_HOST=.*/DATABASE_HOST=postgres/' .env
        sed -i '' 's/REDIS_HOST=.*/REDIS_HOST=redis/' .env
    else
        sed -i 's/DATABASE_HOST=.*/DATABASE_HOST=postgres/' .env
        sed -i 's/REDIS_HOST=.*/REDIS_HOST=redis/' .env
    fi

    print_status "Menjalankan database setup..."
    npm run db:setup

    cd ..
    print_success "Setup Docker selesai!"
}

# Setup manually
setup_manual() {
    print_status "Menjalankan setup manual..."

    # Check if PostgreSQL is running
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        print_error "PostgreSQL tidak berjalan. Silakan start PostgreSQL terlebih dahulu."
        print_status "Ubuntu/Debian: sudo systemctl start postgresql"
        print_status "macOS: brew services start postgresql"
        exit 1
    fi

    # Check if Redis is running
    if ! redis-cli ping &> /dev/null; then
        print_error "Redis tidak berjalan. Silakan start Redis terlebih dahulu."
        print_status "Ubuntu/Debian: sudo systemctl start redis-server"
        print_status "macOS: brew services start redis"
        exit 1
    fi

    print_success "PostgreSQL dan Redis berjalan"

    # Setup backend
    cd backend
    if [ ! -f .env ]; then
        print_status "Membuat file .env dari template..."
        cp .env.example .env
        print_warning "Silakan edit file backend/.env dengan database credentials yang benar"
        read -p "Tekan Enter setelah mengedit .env file..."
    fi

    print_status "Menjalankan database setup..."
    npm run db:setup

    cd ..
    print_success "Setup manual selesai!"
}

# Main setup function
main() {
    # Check prerequisites
    if ! command -v node &> /dev/null; then
        print_error "Node.js tidak terinstall. Silakan install Node.js 18+ terlebih dahulu."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm tidak terinstall. Silakan install npm terlebih dahulu."
        exit 1
    fi

    print_success "Node.js dan npm ditemukan"

    # Ask user for setup method
    echo "Pilih metode setup:"
    echo "1) Docker (Direkomendasikan - otomatis)"
    echo "2) Manual (PostgreSQL dan Redis harus sudah terinstall)"
    read -p "Pilih (1/2): " choice

    case $choice in
        1)
            if check_docker; then
                setup_docker
            else
                print_error "Docker tidak tersedia. Gunakan setup manual."
                exit 1
            fi
            ;;
        2)
            setup_manual
            ;;
        *)
            print_error "Pilihan tidak valid"
            exit 1
            ;;
    esac

    # Final instructions
    echo ""
    print_success "🎉 DataBuddy berhasil di-setup!"
    echo ""
    echo "Langkah selanjutnya:"
    echo "1. Start backend: cd backend && npm run start:dev"
    echo "2. Start frontend: cd frontend && npm run dev"
    echo "3. Buka browser: http://localhost:5173"
    echo ""
    echo "Akun default:"
    echo "  Admin: admin@databuddy.com / admin123"
    echo "  Editor: editor@databuddy.com / editor123"
    echo "  Viewer: viewer@databuddy.com / viewer123"
    echo ""
    print_success "Selamat menggunakan DataBuddy! 🚀"
}

# Run main function
main "$@"
