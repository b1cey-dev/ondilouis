# Onidolus - Content Production & Store Platform

A modern web platform for content production and digital store management, built with Next.js, TypeScript, and Prisma.

## Features

- **Authentication System**
  - Sign Up
  - Login
  - Forgot Password
  - Unique Username System

- **Theme System**
  - Dark Mode
  - Light Mode
  - System Theme Sync

- **Role Management**
  - Media Role (with store discounts)
  - Partner Role
  - Team Roles (Content Production Unit)
  - Staff Role
  - Admin Role
  - Super Admin Role
  - Custom Role Creation

- **Store Features**
  - Product Upload & Management
  - Shopping Cart
  - Secure Payment Processing
  - Digital Product Delivery
  - User Purchase History

- **Profile System**
  - Username Management
  - Profile Customization
  - Bio & Personal Info
  - Purchase History

- **Portfolio System**
  - Team Member Portfolios
  - Work Showcase
  - Order Management
  - Client Communication

- **Chat System**
  - Client-Team Communication
  - File Attachment Support
  - Admin Monitoring

- **Rating System**
  - Client-only Reviews
  - Order-based Rating

- **Administrative Features**
  - Role Management
  - Store Management
  - Order Tracking
  - Announcement System
  - Affiliate Program

## Tech Stack

- Next.js 14
- TypeScript
- Prisma (PostgreSQL)
- Tailwind CSS
- NextAuth.js
- Stripe
- UploadThing
- React Query
- Zustand

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/onidolus.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

4. Set up the database
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
