# Changelog

All notable changes to DataBuddy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.13] - 2026-01-03

### Changed
- **Sidebar Toggle Icon**: Changed from chevron icons to hamburger menu icon for better clarity.
- **Toggle UX**: Added tooltip showing "Expand/Collapse Sidebar" on hover.

## [1.3.12] - 2026-01-03

### Improved
- **Profile Menu UI**: Enhanced profile dropdown with avatar in header, better spacing, larger icons (20px), and improved hover effects.
- **Sidebar Toggle**: Removed sticky positioning from collapse button at bottom - now scrolls with sidebar content naturally.

## [1.3.11] - 2026-01-03

### Changed
- **Navbar UI**: Removed logo/branding from Navbar. Removed border for cleaner look.
- **Sidebar Branding**: Added DataBuddy logo and name to top of Sidebar with support for collapsed state.
- **Profile Button**: Simplified profile button to show only avatar icon, removed name/role text for cleaner UI.

## [1.3.10] - 2026-01-03

### Changed
- **Navbar Scroll Behavior**: Removed sticky positioning from Navbar. Now scrolls away completely with content instead of staying at top.

## [1.3.9] - 2026-01-03

### Changed
- **Layout Structure**: Refactored layout so only Sidebar is fixed. Navbar now scrolls with content.
- **Navbar Position**: Changed from fixed AppBar across top to sticky Box inside scrollable content area.
- **Scroll Behavior**: Main content area (Navbar + pages) now scrolls together while Sidebar stays fixed on left.

## [1.3.8] - 2026-01-03

### Fixed
- **Dashboard Scroll**: Fixed navbar scrolling with content by removing DashboardPage's conflicting scroll context wrapper.
- **Layout Consistency**: Navbar now properly stays fixed at the top while content scrolls beneath it.

## [1.3.7] - 2026-01-02

### Fixed
- **Content Visibility**: Implemented robust `DrawerHeader` spacer to dynamically match AppBar height, completely resolving main content cut-off issues across all device sizes.

## [1.3.6] - 2026-01-02

### Fixed
- **Mobile Experience**: Fixed critical mobile layout issues including missing branding text and cramped header spacing.
- **Mobile Navigation**: Adjusted z-index for mobile drawer to ensure it overlays correctly on top of all content.

## [1.3.5] - 2026-01-02

### Fixed
- **Layout Visibility**: Resolved issue where main content was hidden behind the fixed Navbar by implementing proper toolbar spacing.
- **Sidebar Interaction**: Fixed unresponsive sidebar collapse button by adjusting z-index overlapping.
- **UI Aesthetics**: Improved the visual styling of user and notification dropdowns with enhanced glassmorphism and better contrast.
- **Mobile Friendliness**: Optimized responsiveness for mobile layouts.

## [1.3.4] - 2026-01-02

### Changed
- **Navigation Layout**: Updated layout to "Clipped App Bar" style. Navbar is now sticky at the top and full width. Sidebar slides underneath the Navbar.
- **Branding**: Moved application branding from Sidebar to Navbar for better visibility and layout consistency.

## [1.3.3] - 2026-01-02

### Added
- **Responsive Navigation**: Implemented a fully responsive sidebar with collapsible desktop mode and mobile drawer support.
- **Mobile Friendly**: Enhanced layout for small screens ensuring all navigation and features are accessible on mobile devices.

## [1.3.2] - 2026-01-02

### Fixed
- **Infinite Error Loop**: Fixed a critical bug in the Pipeline Builder where a missing API function (`getPipeline`) caused an infinite error loop and "toast storm".
- **Performance**: Optimized `ToastContext` with memoization to prevent unnecessary re-renders across the application.

## [1.3.1] - 2026-01-02

### Fixed
- **Pipeline Configuration**: Restored missing configuration schemas and input fields in the Pipeline Builder. Users can now properly configure Read, Transform, Validate, and Write steps.

## [1.3.0] - 2026-01-02

### Added
- **Backend Pipelines**: Enhanced pipeline runner service with improved step factory and controller support.
- **Real-time Notifications**: Integrated `SocketContext` in frontend and `websocket.gateway` in backend for live updates.
- **Profile & Settings**: Added dedicated, theme-compliant pages for user profile and application settings.

### Changed
- **Frontend Architecture**: Refactored `App.tsx` and `main.tsx` to support new context providers (Socket, Toast).
- **API Integration**: Updated `api.ts` and `authSlice.ts` to handle improved authentication and error flows.
- **Monitoring & Data**: synchronized backend services (`monitoring`, `data`) with the new frontend dashboard capabilities.

## [1.2.1] - 2026-01-02

### Fixed
- **Dashboard White Screen**: Fixed a critical crash caused by race conditions when loading system metrics.
- **Theme Unification**: Completed the migration of all remaining pages (DataImport, DataExport, Settings, Profile) to the centralized Material UI theme, ensuring zero reliance on legacy Tailwind classes.

## [1.2.0] - 2026-01-02

### Added
- **Premium Monitoring Dashboard**: Real-time system health alerts and performance topology using `recharts`.
- **Data Export Center**: "Signal Uplink" operations for multi-format (CSV, XLSX, JSON) data extraction.
- **Global Toast System**: Sophisticated, non-blocking notification system with glassmorphic aesthetic.

### Improved
- **Premium UX Overhaul**: Comprehensive dark mode transformation with glassmorphism, vibrant gradients, and futuristic animations.
- **Dashboard Command Center**: Interactive metrics mapped directly to functional modules.
- **Unified Navigation**: Pruned sidebar and synchronized all system routes for a seamless experience.
- **Performance**: Optimized rendering with memoization and defensive coding patterns.

### Fixed
- **Infinite Render Loop**: Resolved a critical performance bug in `DataExportPage` caused by non-memoized filter objects.
- **Runtime Reference Errors**: Fixed missing icon imports that were causing page crashes.
- **Layout Stability**: Corrected main content margins and background ambience for a consistent full-bleed experience.

## [1.1.2] - 2026-01-02

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
