# ZenSpend - Minimalist Expense Tracker

## Overview

ZenSpend is a modern, minimalist expense tracking application built with a full-stack TypeScript architecture. The application features voice input for expense entry, AI-powered spending insights, and a beautiful mobile-optimized interface. It uses a React frontend with Express backend, PostgreSQL database, and includes Replit Auth for user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **AI Integration**: OpenAI API for expense parsing and insights

### Database Schema
- **Users**: Stores user profiles (required for Replit Auth)
- **Sessions**: Session storage (required for Replit Auth)
- **Expenses**: Core expense tracking with amount, description, category, date, and user association

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **User Management**: Automatic user creation/updates on login
- **Security**: HTTP-only cookies, secure flags in production

### Voice Input System
- **Speech Recognition**: Browser Web Speech API
- **AI Processing**: OpenAI GPT-4 for parsing natural language expense descriptions
- **Supported Commands**: Natural language like "I spent 50 dollars on groceries"

### AI Insights Engine
- **Provider**: OpenAI GPT-4 for expense analysis
- **Features**: Spending pattern analysis, budget alerts, trend identification
- **Data Processing**: Compares current vs previous periods for trend analysis

### Data Visualization
- **Charts**: Recharts library for pie charts and expense breakdowns
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Updates**: Automatic refresh of charts when expenses change

## Data Flow

1. **User Authentication**: Replit Auth → Session creation → User profile retrieval
2. **Expense Creation**: Voice/Manual input → AI parsing (if voice) → Validation → Database storage
3. **Data Retrieval**: Database queries → Filtering/Aggregation → Frontend display
4. **AI Analysis**: Expense data → OpenAI API → Insights generation → User display

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **@tanstack/react-query**: Server state management
- **openai**: AI-powered features

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **recharts**: Data visualization library
- **react-hook-form**: Form state management

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16
- **Development Server**: Vite dev server with HMR
- **Build Process**: Concurrent frontend (Vite) and backend (esbuild) builds

### Production Deployment
- **Platform**: Replit autoscale deployment
- **Build Command**: `npm run build` (builds both frontend and backend)
- **Start Command**: `npm run start` (serves built application)
- **Port Configuration**: Backend on port 5000, mapped to external port 80

### File Structure
- **Frontend**: `client/` directory with React application
- **Backend**: `server/` directory with Express API
- **Shared**: `shared/` directory for common types and schemas
- **Database**: Migrations in `migrations/` directory
- **Static Assets**: Built frontend served from `dist/public/`

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **OPENAI_API_KEY**: OpenAI API authentication
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OpenID Connect issuer URL

### Build Optimization
- **Frontend**: Vite optimizes bundle size and includes tree shaking
- **Backend**: esbuild bundles server code for faster startup
- **Assets**: Static assets are served efficiently with proper caching headers
- **Database**: Connection pooling for efficient database access