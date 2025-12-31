# DataBuddy - Data Management & Processing Platform

DataBuddy adalah platform terintegrasi untuk mengelola, memproses, dan memantau data besar dengan cara yang mudah, terstruktur, dan otomatis melalui pipeline modular.

## 🎯 Fitur Utama

### 1. **Import & Export Data Mudah**
- Upload file Excel/CSV besar dengan preview real-time
- Validasi otomatis dan preview data
- Ekspor data dalam berbagai format populer

### 2. **Pipeline Modular**
- Buat, simpan, dan jalankan pipeline data processing
- Step reusable yang bisa dipakai ulang atau dikustomisasi
- Engine berbasis RxJS untuk processing reactive

### 3. **Dashboard Monitoring**
- Pantau progress import/export secara real-time
- Statistik performa pipeline
- Notifikasi error atau keberhasilan via WebSocket

### 4. **Data Validation & Cleaning**
- Cek duplikat, tipe data, dan referensi silang
- Perbaiki format data secara otomatis
- Custom validation rules

### 5. **User Management & Role**
- Multi-user dengan role-based access control
- Roles: Admin, Editor, Viewer
- JWT authentication dengan refresh token

### 6. **API Integration**
- Sambungkan pipeline ke API eksternal
- Ambil data real-time atau kirim hasil processing

## 🏗️ Arsitektur & Tech Stack

### Backend (NestJS + TypeScript)
- **Framework**: NestJS 10.0.0
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL + TypeORM
- **Cache/Queue**: Redis + BullMQ
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Real-time**: Socket.io
- **File Processing**: XLSX, csv-parser, multer
- **HTTP Client**: Axios

**Key Dependencies:**
- `@nestjs/jwt`, `@nestjs/passport` - Authentication
- `@nestjs/typeorm`, `pg` - Database ORM
- `@nestjs/bull`, `bullmq` - Background jobs
- `@nestjs/websockets`, `socket.io` - Real-time communication
- `rxjs` - Reactive programming for pipelines
- `xlsx`, `csv-parser` - File processing

### Frontend (React + TypeScript)
- **Framework**: React 18.x
- **Build Tool**: Vite
- **Language**: TypeScript 5.x
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router v6
- **Real-time**: Socket.io client

**Key Dependencies:**
- `react`, `react-dom` - React framework
- `@reduxjs/toolkit`, `react-redux` - State management
- `react-router-dom` - Client-side routing
- `recharts` - Data visualization
- `lucide-react` - Icons
- `socket.io-client` - Real-time communication

## 📁 Struktur Proyek

```
DataBuddy/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/         # Authentication & pipelines
│   │   │   ├── data/         # Data import/export
│   │   │   ├── monitoring/   # System monitoring
│   │   │   ├── notifications/# Real-time notifications
│   │   │   └── users/        # User management
│   │   ├── entities/         # Database entities
│   │   ├── dto/             # Data transfer objects
│   │   ├── interfaces/      # TypeScript interfaces
│   │   ├── guards/          # Route guards
│   │   ├── decorators/      # Custom decorators
│   │   ├── config/          # Configuration
│   │   ├── queue/           # Background job processing
│   │   ├── websocket/       # Real-time communication
│   │   └── pipelines/       # Pipeline engine & steps
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── layout/      # Layout components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store & slices
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── docker/                    # Docker configuration
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── init.sql
├── docs/                     # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (optional)

### 1. Clone Repository
```bash
git clone <repository-url>
cd DataBuddy
```

### 2. Quick Setup (Direkomendasikan)
```bash
# Jalankan setup otomatis
./setup.sh
```

Setup script akan:
- ✅ Install dependencies
- ✅ Setup database (PostgreSQL + Redis)
- ✅ Run migrations
- ✅ Seed data awal (users, pipelines, sample data)
- ✅ Konfigurasi environment

### 3. Manual Setup (Alternatif)

#### Opsi A: Menggunakan Docker
```bash
# Start database services
docker-compose -f docker/docker-compose.dev.yml up -d postgres redis

# Setup backend
cd backend
cp .env.example .env
npm run db:setup

# Setup frontend
cd ../frontend
npm install
npm run dev
```

#### Opsi B: Setup Manual
```bash
# Install PostgreSQL dan Redis secara manual
# Lalu jalankan:
cd backend
cp .env.example .env
# Edit .env dengan database credentials
npm run db:setup

cd ../frontend
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

### 5. Default Login Credentials
- **Admin**: `admin@databuddy.com` / `admin123`
- **Editor**: `editor@databuddy.com` / `editor123`
- **Viewer**: `viewer@databuddy.com` / `viewer123`

### 6. Pre-loaded Data
Setup script akan membuat:
- ✅ **3 User accounts** dengan role berbeda
- ✅ **3 Pipeline templates** siap pakai
- ✅ **5 Pipeline steps** untuk templates
- ✅ **Sample data imports/exports** untuk testing
- ✅ **Welcome notifications** untuk semua users

**Pipeline Templates Include:**
1. **CSV Data Import** - Read CSV, validate, process
2. **Data Cleaning** - Clean text, fill missing values
3. **Excel Export** - Format data, export to Excel

## 🔧 Environment Configuration

### Backend (.env)
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=databuddy

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
UPLOAD_DESTINATION=./uploads

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh tokens
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Change password

### Pipelines
- `GET /api/pipelines` - List pipelines
- `POST /api/pipelines` - Create pipeline
- `GET /api/pipelines/:id` - Get pipeline details
- `PUT /api/pipelines/:id` - Update pipeline
- `DELETE /api/pipelines/:id` - Delete pipeline
- `POST /api/pipelines/:id/execute` - Execute pipeline

### Data Operations
- `POST /api/data/import` - Import data
- `POST /api/data/export` - Export data
- `GET /api/data/imports` - List imports
- `GET /api/data/exports` - List exports

### Monitoring
- `GET /api/monitoring/stats` - System statistics
- `GET /api/monitoring/pipelines` - Pipeline metrics
- `GET /api/monitoring/notifications` - User notifications

## 🔐 User Roles & Permissions

### Admin
- ✅ Full access to all features
- ✅ User management (create, edit, delete users)
- ✅ System configuration
- ✅ View all data and pipelines

### Editor
- ✅ Create and edit pipelines
- ✅ Import/export data
- ✅ View monitoring dashboard
- ❌ User management
- ❌ System configuration

### Viewer
- ✅ View pipelines and data
- ✅ Run existing pipelines
- ✅ View monitoring dashboard
- ❌ Create/edit pipelines
- ❌ Import/export data
- ❌ User management

## 🔄 Pipeline Engine

### Built-in Step Types
1. **Read Step** - Load data from CSV, XLSX, JSON files with streaming support
2. **Transform Step** - Manipulate columns (rename, convert types, apply formulas)
3. **Validate Step** - Data quality checks (duplicates, types, custom validation rules)
4. **Write Step** - Export to files, databases, or external APIs
5. **Export Step** - Specialized export with format conversion

### Pipeline Architecture
```typescript
interface PipelineStep {
  id: string;
  type: StepType;
  config: Record<string, any>;
  order: number;
}

interface PipelineContext {
  data: any[];
  metadata: Record<string, any>;
  errors: string[];
  warnings: string[];
}
```

### Custom Steps
```typescript
// Example custom step implementation
@Injectable()
export class CustomStep implements PipelineStepHandler {
  readonly type = StepType.CUSTOM_SCRIPT;
  readonly name = 'Custom Script';

  execute(context: PipelineContext, config: any): Observable<any> {
    return from(this.processData(context.data, config.script));
  }
}
```

## 📈 Monitoring & Analytics

### Real-time Metrics
- Pipeline execution progress
- Data processing throughput
- Error rates and success rates
- System performance metrics

### Dashboard Features
- Live pipeline status updates
- Historical execution data
- Resource usage monitoring
- Error tracking and alerts

## 🐳 Docker Deployment

### Development (Direkomendasikan untuk Setup Cepat)
```bash
# Start semua services dengan satu command
docker-compose -f docker/docker-compose.dev.yml up

# Atau hanya database services
docker-compose -f docker/docker-compose.dev.yml up postgres redis

# Jalankan setup database
cd backend && npm run db:setup
```

### Production
```bash
# Build dan start production services
docker-compose -f docker/docker-compose.yml up -d --build

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

### Docker Services
- **postgres**: PostgreSQL 15 database dengan persistent storage
- **redis**: Redis 7 untuk cache dan background jobs
- **backend**: NestJS API server dengan hot reload
- **frontend**: React app dengan Vite dev server
- **Database volumes**: Persistent data storage

## 🔍 Code Quality

### Linting & Formatting
```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
```

### Testing
```bash
# Backend Unit Tests
cd backend
npm run test                    # Run unit tests
npm run test:watch             # Watch mode
npm run test:cov               # With coverage
npm run test:e2e               # End-to-end tests

# Frontend Tests
cd frontend
npm run test                   # Run React tests
npm run test:ui                # Visual testing (if configured)
```

## 📚 Documentation

- [API Documentation](http://localhost:3001/api/docs) - Swagger UI
- [User Guide](./docs/user-guide.md) - How to use DataBuddy
- [Developer Guide](./docs/developer-guide.md) - Development setup
- [Pipeline Guide](./docs/pipeline-guide.md) - Creating custom pipelines

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Check database connection in `.env`
- Ensure PostgreSQL and Redis are running
- Verify JWT secrets are set

**Frontend shows API errors:**
- Check if backend is running on port 3001
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings

**Pipeline execution fails:**
- Verify file permissions for uploads folder
- Check Redis connection for queue jobs
- Review pipeline step configurations

**Database connection issues:**
- Run `docker-compose -f docker/docker-compose.dev.yml up postgres`
- Check database credentials
- Verify PostgreSQL is accepting connections

### Performance Tuning

**Database Optimization:**
- Enable connection pooling
- Add appropriate indexes
- Monitor slow queries

**Pipeline Performance:**
- Use streaming for large files
- Implement batch processing
- Optimize memory usage

## ❓ FAQ

**Q: Can I add custom pipeline steps?**
A: Yes, implement the `PipelineStepHandler` interface and register it in the pipeline factory.

**Q: How do I backup my data?**
A: Use PostgreSQL backup tools or Docker volumes. Data is stored in PostgreSQL and uploaded files.

**Q: Can I integrate with external APIs?**
A: Yes, use the API Write step or create custom steps that call external services.

**Q: What's the maximum file size supported?**
A: Configurable via multer settings, default is 50MB.

## 👥 Support

For support, email support@databuddy.com or join our Slack channel.

## 🗺️ Roadmap

### Version 2.0 (Coming Soon)
- [ ] Advanced data visualization dashboard
- [ ] Machine learning pipeline steps
- [ ] Multi-tenant architecture
- [ ] API rate limiting per user
- [ ] Advanced scheduling system
- [ ] Data quality scoring
- [ ] Integration with cloud storage (S3, GCS)

### Version 1.5 (Current)
- [x] Real-time pipeline monitoring
- [x] WebSocket notifications
- [x] Background job processing
- [x] File upload with preview
- [x] Pipeline builder UI
- [x] User role management
- [x] API documentation

## 📝 Changelog

### v1.0.0 (Current)
- Initial release with core features
- Pipeline engine with modular steps
- Real-time monitoring and notifications
- Multi-format file processing
- User authentication and authorization
- Docker containerization

## 🙏 Acknowledgments

- NestJS community for the amazing framework
- RxJS for reactive programming
- React ecosystem for frontend tools
- Open source contributors
- All users and feedback providers

---

**DataBuddy** - Making data processing simple, powerful, and accessible to everyone! 🚀

*Built with ❤️ using modern web technologies*