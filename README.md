# Portfolio Management Dashboard

A full-stack application for managing investment portfolios with real-time performance tracking.

## Features

- User authentication (register, login, logout) with JWT
- Portfolio dashboard with summary metrics
- Investment management (stocks, bonds, mutual funds)
- Transaction history with filtering
- Performance metrics by asset type

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Vitest (API tests), Playwright (E2E)
- **Containerization**: Docker, Docker Compose

## Quick Start

### Using Docker (Recommended)

```bash
docker-compose up --build OR
docker compose up --build
```

Open http://localhost:3000 in your browser.

**Demo Account:**
- Email: `demo@example.com`
- Password: `password123`

### Local Development

**Prerequisites:**
- Node.js 20+
- PostgreSQL

**Backend:**
```bash
cd server
npm install
cp .env.example .env  # Update DATABASE_URL
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Investments
- `GET /api/investments` - List all investments
- `GET /api/investments/:id` - Get investment
- `POST /api/investments` - Create investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

### Transactions
- `GET /api/transactions` - List transactions (supports `?type=BUY|SELL`)
- `POST /api/transactions` - Create transaction

### Portfolio
- `GET /api/portfolio/summary` - Get portfolio summary

## Testing

**API Tests:**
```bash
cd server
npm test
```

**E2E Tests:**
```bash
cd e2e
npm install
npx playwright install
npm test
```

## Project Structure

```
portfolio-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema and migrations
│   └── Dockerfile
├── e2e/                    # Playwright E2E tests
└── docker-compose.yml
```
