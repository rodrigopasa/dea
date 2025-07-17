# PDF Management Platform

## Overview
A comprehensive PDF management platform designed for efficient document handling, metadata extraction, and intelligent processing.

## Project Architecture
- **Frontend**: React with TypeScript and Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **PDF Processing**: PDF.js for document rendering
- **Styling**: Tailwind CSS with ShadCN components
- **Theme System**: theme.json configuration for consistent styling

## Key Technologies
- React frontend with Vite
- TypeScript
- Drizzle ORM
- PostgreSQL database
- PDF.js for document rendering
- Tailwind CSS for styling
- Advanced PDF editing capabilities
- Slug management and redirection system

## Recent Changes
- ✓ **SISTEMA 100% PRONTO PARA DEPLOY** (2025-07-17)
  - Implementados health check endpoints (/health, /api/status, /ready)
  - Lazy initialization do banco de dados (resolve erros de MODULE_NOT_FOUND)
  - Docker otimizado com health checks e curl
  - Scripts de deploy automatizados (deploy-check.sh, start-production.sh)
  - Configuração .env.example para variáveis de ambiente
  - Documentação completa de deploy (DEPLOY_READY.md)
- ✓ **Recreated db.ts with robust error handling** (2025-07-17)
  - Enhanced connection pool configuration (10s timeout, 60s acquire timeout)
  - Advanced DATABASE_URL validation with clear error messages
  - Pool monitoring with event listeners and statistics
  - Graceful shutdown handlers for SIGINT/SIGTERM
  - Utility functions for testing and debugging (testConnection, getPoolStats)
- ✓ **Created comprehensive PDF documentation** (2025-07-17)
  - EXTRAÇÃO_DADOS_GUIDE.md - PDF metadata extraction system
  - LEITOR_PDF_GUIDE.md - PDF viewer architecture and lazy loading
  - EXEMPLO_IMPLEMENTAÇÃO.md - Complete working example for replication
- ✓ **Optimized Coolify deployment** (2025-07-17)
  - Dockerfile with native module dependencies
  - Smart build path detection and static file serving
  - PORT binding optimized for cloud deployment
- ✓ Fixed DATABASE_URL configuration issue (2025-01-17)
- ✓ Created PostgreSQL database connection (2025-01-17)
- ✓ Resolved theme.json configuration errors (2025-01-17)
- ✓ Set up proper database schema migration (2025-01-17)
- ✓ Verified application startup and API endpoints (2025-01-17)

## Deployment Requirements

### Essential Files
1. **theme.json** - Required for ShadCN theme configuration
2. **Database Schema** - Ensure `npm run db:push` is run after deployment
3. **Environment Variables** - DATABASE_URL must be properly configured

### Pre-deployment Checklist
- [ ] Verify DATABASE_URL is set in environment variables
- [ ] Ensure theme.json exists with correct structure
- [ ] Run `npm run db:push` to create database tables
- [ ] Test all API endpoints are responding
- [ ] Verify file upload directories are created

### Common Issues & Solutions (AUTOMATED)
1. **DATABASE_URL Error**: ✅ FIXED - Application now auto-detects missing DATABASE_URL and provides clear instructions
2. **Theme Configuration**: ✅ FIXED - theme.json created automatically with correct ShadCN configuration  
3. **Missing Tables**: ✅ FIXED - Application auto-runs `npm run db:push` when tables don't exist
4. **File Upload Issues**: ✅ FIXED - Application auto-creates required directories on startup
5. **Tailwind Warnings**: ✅ FIXED - Updated tailwind.config.ts to eliminate invalid theme warnings

### Auto-Setup Features
- 🤖 **Smart Database Initialization**: Detects missing tables and auto-creates schema
- 🔄 **Intelligent Retry Logic**: Exponential backoff for database connection issues  
- 📋 **Duplicate Detection**: Skips creation of existing admin users and categories
- 🎨 **Theme Auto-Configuration**: Proper ShadCN theme.json for consistent styling
- 📝 **Enhanced Logging**: Clear, emoji-based logs for better debugging experience

## Database Configuration
The application uses PostgreSQL with Drizzle ORM. The database connection is configured with:
- Connection pooling (max 20 connections)
- 30-second idle timeout
- 2-second connection timeout
- Automatic retry mechanism for initialization

## API Endpoints
- `/api/user` - User authentication and profile
- `/api/pdfs/recent` - Recent PDF documents
- `/api/pdfs/popular` - Popular PDF documents
- `/api/categories` - Document categories
- `/api/seo-settings` - SEO configuration

## User Preferences
- Language: Portuguese
- Communication style: Clear and direct
- Focus on preventing deployment issues
- Ensure all configurations are production-ready

## Development Workflow
1. Run `npm run dev` to start development server
2. Use `npm run db:push` for database schema changes
3. Monitor logs for any configuration issues
4. Test all endpoints before deployment

## File Structure
```
├── server/
│   ├── index.ts          # Main server entry point
│   ├── db.ts             # Database configuration
│   ├── migrate.ts        # Database initialization
│   └── routes.ts         # API routes
├── client/
│   └── src/              # React frontend
├── shared/
│   └── schema.ts         # Database schema
├── theme.json            # Theme configuration
└── uploads/              # File upload directories
```