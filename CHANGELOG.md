# Changelog

All notable changes to DataBuddy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
