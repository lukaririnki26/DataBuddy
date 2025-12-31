# Database Setup Guide

Panduan lengkap untuk setup database DataBuddy agar aplikasi langsung siap pakai.

## 📋 Prerequisites

Pastikan Anda memiliki software berikut terinstall:

- **PostgreSQL 13+** - Database server
- **Redis 6+** - Cache dan queue server
- **Node.js 18+** - Runtime environment
- **Docker & Docker Compose** (opsional, untuk setup cepat)

## 🚀 Quick Setup (Docker)

### 1. Start Database Services

```bash
# Dari root directory project
docker-compose -f docker/docker-compose.dev.yml up -d postgres redis
```

### 2. Setup Environment

```bash
# Backend
cd backend
cp .env.example .env

# Edit .env jika perlu (default settings sudah sesuai untuk Docker)
```

### 3. Run Database Setup

```bash
# Setup lengkap (migration + seeder)
npm run db:setup
```

## 🔧 Manual Setup (Tanpa Docker)

### 1. Install PostgreSQL & Redis

**Ubuntu/Debian:**
```bash
# PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Redis
sudo apt install redis-server

# Start services
sudo systemctl start postgresql
sudo systemctl start redis-server
```

**macOS (brew):**
```bash
# PostgreSQL
brew install postgresql
brew services start postgresql

# Redis
brew install redis
brew services start redis
```

### 2. Create Database

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Create database dan user
CREATE DATABASE databuddy;
CREATE USER databuddy_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE databuddy TO databuddy_user;

# Exit
\q
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env

# Edit .env file dengan database credentials yang benar
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=databuddy_user
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=databuddy

REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Run Setup

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup
```

## 📊 Yang Akan Dibuat

Setelah setup selesai, database akan berisi:

### 👥 Users (3 akun default)
- **Admin**: `admin@databuddy.com` / `admin123`
  - Full access ke semua fitur
  - Dapat manage users, pipelines, data
- **Editor**: `editor@databuddy.com` / `editor123`
  - Dapat create/edit pipelines dan import data
  - Tidak dapat manage users
- **Viewer**: `viewer@databuddy.com` / `viewer123`
  - Read-only access untuk monitoring
  - Tidak dapat modify data atau pipelines

### 🔧 Pipeline Templates (3 template siap pakai)
1. **CSV Data Import Template**
   - **Purpose**: Import data dari file CSV dengan validasi
   - **Steps**:
     - Read CSV File (dengan konfigurasi delimiter, encoding)
     - Validate Data (required fields, email format)
   - **Tags**: csv, import, template, data-processing

2. **Data Cleaning Pipeline**
   - **Purpose**: Membersihkan dan menstandardisasi data
   - **Steps**:
     - Clean Text Data (trim, remove spaces)
     - Fill Missing Values (default values)
   - **Tags**: cleaning, transform, data-quality, standardization

3. **Excel Export Pipeline**
   - **Purpose**: Export data ke format Excel
   - **Steps**:
     - Format Data (date formatting, column mapping)
     - Export to Excel (with headers, styling)
   - **Tags**: excel, export, xlsx, data-export

### 🔧 Pipeline Templates (3 template siap pakai)
1. **CSV Data Import Template**
   - Read CSV files
   - Basic validation
   - Automatic processing

2. **Data Cleaning Pipeline**
   - Text cleaning
   - Missing value handling
   - Data standardization

3. **Excel Export Pipeline**
   - Data formatting
   - Excel export
   - Download ready

### 📋 Sample Data
- **Data Imports**:
  - "Sample Customer Data" (CSV, 1000 rows, completed)
  - "Product Inventory" (Excel, 500 rows, completed)
- **Data Exports**:
  - "Customer Report" (Excel, 1000 rows, completed)
- **Notifications**:
  - Welcome messages untuk semua users
  - Template availability notifications
  - Sample activity notifications

### 🗂️ Database Schema Overview

Migration akan membuat **6 tabel utama** dengan **15+ enum types**:

#### Core Tables:
1. **users** - User accounts dengan role-based permissions
2. **pipelines** - Data processing pipeline definitions
3. **pipeline_steps** - Individual steps dalam pipeline
4. **data_imports** - Import operation tracking
5. **data_exports** - Export operation tracking
6. **notifications** - System notifications untuk users

#### Key Relationships:
- `pipelines.creatorId → users.id`
- `pipeline_steps.pipelineId → pipelines.id`
- `data_imports.createdById → users.id`
- `data_exports.createdById → users.id`
- `notifications.userId → users.id`

#### Indexes Created:
- User roles dan status untuk filtering cepat
- Pipeline types dan status untuk categorization
- Import/export status dan timestamps untuk monitoring
- Notification types dan priorities untuk alerting

#### ENUM Types:
- User roles: admin, editor, viewer
- Pipeline types: import, export, transform, hybrid
- Status enums: active, inactive, pending, processing, completed, failed
- Priority levels: low, medium, high, urgent
- File formats: csv, xlsx, xls, json, xml, txt

## 🎯 Testing Setup

### 1. Start Backend
```bash
npm run start:dev
```

### 2. Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:5173
- API Docs: http://localhost:3001/api/docs

### 4. Login dengan akun default
- Email: `admin@databuddy.com`
- Password: `admin123`

## 🔄 Manual Commands

Jika perlu menjalankan step-by-step:

```bash
# 1. Build aplikasi
npm run build

# 2. Run migrations
npm run migration:run

# 3. Run seeders
npm run seed:run
```

## 🐛 Troubleshooting

### Connection Issues
```bash
# Check PostgreSQL
sudo -u postgres psql -c "SELECT version();"

# Check Redis
redis-cli ping

# Test connection
psql -h localhost -U databuddy_user -d databuddy
```

### Permission Issues
```bash
# Grant permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE databuddy TO databuddy_user;
GRANT ALL ON SCHEMA public TO databuddy_user;
```

### Reset Database
```bash
# Drop dan recreate
npm run migration:revert  # Jika ada migrations sebelumnya
dropdb databuddy
createdb databuddy
npm run db:setup
```

## 📁 File Structure

```
backend/
├── src/
│   ├── migrations/        # Database migrations
│   └── seeders/          # Database seeders
├── scripts/
│   ├── setup-database.ts # Setup script utama
│   └── run-seeder.ts     # Seeder runner
└── .env                  # Environment config
```

## 🔐 Security Notes

- **Ganti password default** setelah setup pertama kali
- **Update JWT secrets** di production
- **Gunakan HTTPS** di production
- **Backup database** secara regular

## 📞 Support

Jika mengalami masalah:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Test database connection
4. Check firewall settings

Untuk bantuan lebih lanjut, buat issue di repository atau hubungi tim development.
