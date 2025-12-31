# Environment Setup Guide

## Backend Configuration (.env)

Copy the `.env.example` file to `.env` and configure the following variables:

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=databuddy
DB_SCHEMA=public
DB_SSL=false
DB_MAX_CONNECTIONS=20
DB_MIN_CONNECTIONS=2

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-token-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=databuddy-api
JWT_AUDIENCE=databuddy-users

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=databuddy:
REDIS_RETRY_DELAY=3000
REDIS_MAX_RETRIES=3

# File Upload Configuration
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=csv,xlsx,xls,json,txt,xml

# Queue Configuration
QUEUE_REMOVE_ON_COMPLETE=100
QUEUE_REMOVE_ON_FAIL=50

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External API Keys (optional)
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key

# Monitoring & Logging
LOG_LEVEL=info
ENABLE_SWAGGER=true
ENABLE_CORS=true

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
```

## Frontend Configuration (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

## Docker Environment Variables

For production deployment with Docker:

```env
# Backend
NODE_ENV=production
DB_HOST=databuddy-postgres
REDIS_HOST=databuddy-redis
JWT_SECRET=production-secret-key-32-chars-minimum

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_WS_URL=https://api.yourdomain.com
```

## Database Setup

### PostgreSQL
```sql
-- Create database
CREATE DATABASE databuddy;

-- Create user (optional)
CREATE USER databuddy_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE databuddy TO databuddy_user;
```

### Redis
Redis is used for:
- Session storage
- Task queues (BullMQ)
- Caching

Default configuration should work for development.

## Security Notes

1. **JWT Secrets**: Always use strong, unique secrets in production
2. **Database Password**: Use strong passwords and consider using connection pools
3. **File Upload**: Limit file sizes and validate file types
4. **Rate Limiting**: Configure appropriate limits for your use case
5. **CORS**: Restrict origins in production to your domain only

## Development vs Production

### Development
- `NODE_ENV=development`
- Debug logging enabled
- Auto-reload enabled
- Swagger UI accessible
- CORS allows all origins

### Production
- `NODE_ENV=production`
- Minimal logging
- Optimized builds
- Security headers enabled
- CORS restricted to specific domains
