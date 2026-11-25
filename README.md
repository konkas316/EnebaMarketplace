# Eneba Marketplace

A digital game marketplace prototype developed as part of the Eneba Software Engineer Internship assignment.

The application demonstrates a digital marketplace where users can browse games, compare seller offers, manage a shopping cart, complete simulated purchases, and access their digital game keys.

## Live Demo

[Open Eneba Marketplace](https://eneba-marketplace-six.vercel.app)

## Technologies

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- PHP
- REST API

**Database**
- Microsoft SQL Server

## Features

- Game catalog with search and filtering
- Platform and region selection
- Product details and multiple seller offers
- Homepage with featured products and deals
- Shopping cart
- User registration and authentication
- Simulated checkout and payment
- Digital game key delivery
- Order history for registered users

## Project Structure

```text
EnebaMarketplace/
├── backend/
│   └── public/
│       └── api/
├── frontend/
├── EnebaMarketplace.sql
├── AI-Usage-Log.md
└── README.md
```

## Database Setup

1. Install Microsoft SQL Server.
2. Create a database named `EnebaMarketplace`.
3. Execute `EnebaMarketplace.sql` using SQL Server Management Studio.
4. Configure the database connection in the backend configuration file.

## Local Development

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Start the PHP development server:

```bash
php -S localhost:8000 -t public
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will be available at:

`http://localhost:5173`

## Notes

- Payments are simulated. No real financial transactions are processed.
- The project is intended as a demonstration of a digital game marketplace.
- Database credentials and environment-specific configuration should be supplied locally and are not included in the public repository.

