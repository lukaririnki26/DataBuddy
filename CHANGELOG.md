# Changelog

All notable changes to DataBuddy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-01-01

### Fixed
- **Authentication Issues**: Fixed admin login credentials and password hashing issues
- **Database Connection**: Resolved PostgreSQL connection problems for local development
- **Styling Issues**: Fixed Tailwind CSS not loading properly in frontend
- **Backend Startup**: Fixed multiple backend processes causing port conflicts
- **User Seeding**: Corrected admin user password hashing in database seeder

### Improved
- **Development Setup**: Enhanced local development environment configuration
- **Error Handling**: Better error messages and debugging for authentication flow
- **Code Quality**: Cleaned up TypeScript compilation issues and build errors

## [1.1.0] - 2025-01-01

### Added
- **Complete Data Service**: Frontend data service untuk import/export operations
- **Pipeline Execution**: Real pipeline execution dari UI dengan result feedback
- **Global Search**: Search functionality di navbar untuk mencari pipelines
- **Enhanced Monitoring**: Database connection checks dan health monitoring
- **Log Retrieval**: System logs dari pipeline executions dan data operations
- **Automatic Cleanup**: Old import/export records cleanup berdasarkan retention policy
- **Database Seeding**: Automated database seeding dengan sample data dan users
- **Setup Scripts**: Complete setup automation dengan `./setup.sh`
- **Environment Templates**: .env.example files untuk easy configuration

### Fixed
- **Import History**: Implemented real import history fetching dari API
- **File Validation**: Complete data validation dengan custom rules
- **Pipeline Steps**: All pipeline steps (Read, Transform, Validate, Write, Export) fully implemented
- **Error Handling**: Comprehensive error handling di semua components
- **Code Comments**: All code properly commented dalam bahasa Indonesia

### Improved
- **Code Organization**: Cleaned up duplicate files dan improved folder structure
- **Type Safety**: Enhanced TypeScript types dan interfaces
- **Performance**: Optimized database queries dan caching
- **User Experience**: Better loading states, error messages, dan feedback
- **Documentation**: Comprehensive README, API docs, dan setup guides

## [1.0.0] - 2024-12-31

### Added
- **Core Pipeline Engine**: Modular pipeline system dengan RxJS untuk reactive processing
- **Authentication System**: JWT-based authentication dengan role management (Admin, Editor, Viewer)
- **Data Import/Export**: Multi-format support (CSV, Excel, JSON) dengan preview dan validation
- **Real-time Monitoring**: Live dashboard dengan WebSocket notifications dan progress tracking
- **Background Processing**: BullMQ queue system untuk async job processing
- **User Interface**: Modern React UI dengan drag-and-drop pipeline builder
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Support**: Containerized deployment dengan docker-compose

### Features
- **Pipeline Steps**:
  - Read Step: File input dengan streaming support
  - Transform Step: Data manipulation dan cleaning
  - Validate Step: Data quality checks dan custom rules
  - Write Step: Multi-target output (files, databases, APIs)
  - Export Step: Specialized export dengan format conversion
- **Dashboard**: Real-time metrics, charts, dan activity feed
- **File Management**: Upload dengan progress tracking dan validation
- **User Management**: Role-based access control dan user profiles
- **Monitoring**: System health, performance metrics, error tracking

### Technical
- **Backend**: NestJS 10 + TypeScript + PostgreSQL + Redis
- **Frontend**: React 18 + TypeScript + Redux Toolkit + Tailwind CSS
- **Infrastructure**: Docker containerization, nginx reverse proxy
- **Security**: JWT authentication, bcrypt password hashing, CORS
- **Performance**: Streaming file processing, connection pooling, caching

## [0.1.0] - 2024-01-01

### Added
- Initial project setup
- Basic folder structure
- Development environment configuration
- CI/CD pipeline setup

---

## Types of changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities
