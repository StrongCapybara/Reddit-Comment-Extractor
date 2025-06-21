# Reddit Comment Extractor

## Overview
This is a full-stack web application that allows users to extract and download comments from Reddit posts. The application provides a user-friendly interface for setting up Reddit API credentials and extracting comments in both JSON and readable text formats.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom dark theme
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints for Reddit integration and comment extraction
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Drizzle)
- **External API**: Reddit API integration for comment extraction

### Key Components

#### Database Schema
- **Users Table**: Stores user credentials (id, username, password)
- **Extraction Jobs Table**: Tracks comment extraction jobs with status, metadata, and results
- **Schema Validation**: Zod schemas for type-safe data validation

#### Reddit Integration
- **Authentication**: OAuth2 client credentials flow
- **Comment Extraction**: Recursive comment fetching with reply handling
- **Data Processing**: JSON and text format conversion for downloads

#### UI Components
- **Progress Steps**: Multi-step wizard interface
- **Reddit Setup Instructions**: Guided setup for Reddit app creation
- **Credentials Form**: Secure input for Reddit API credentials
- **Comment Extractor**: Main extraction interface with progress indicators

## Data Flow

1. **User Onboarding**: Users follow guided instructions to create Reddit app
2. **Credential Validation**: API credentials are validated against Reddit's OAuth endpoint
3. **Comment Extraction**: 
   - Parse Reddit post URL
   - Authenticate with Reddit API
   - Fetch post and comments recursively
   - Process and store results in database
4. **Data Export**: Provide downloadable JSON and text formats

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL with Neon serverless driver
- **UI Framework**: React ecosystem (React Query, Hook Form, Radix UI)
- **Reddit API**: Official Reddit REST API for comment data
- **Authentication**: Reddit OAuth2 for API access

### Development Tools
- **Build System**: Vite with TypeScript support
- **Database Migrations**: Drizzle Kit for schema management
- **Code Quality**: TypeScript strict mode, ESLint configuration
- **Replit Integration**: Custom Vite plugins for Replit environment

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production

### Environment Configuration
- **Development**: `npm run dev` - concurrent frontend/backend development
- **Production**: `npm run build && npm run start` - optimized production build
- **Database**: Environment-based PostgreSQL connection via `DATABASE_URL`

### Hosting Requirements
- **Node.js 20+**: ES modules and modern JavaScript features
- **PostgreSQL 16**: Database with Drizzle ORM compatibility
- **Environment Variables**: `DATABASE_URL` for database connection

## Changelog
- June 21, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.