# QR-Based Restaurant Ordering System

A modern SaaS application for restaurants to manage orders through QR codes.

## 🌟 Features

- QR code-based ordering system
- Dual interface: Customer & Admin portals
- Real-time order tracking
- Multi-tenant architecture
- Table management system
- Mobile-first PWA design

## 🏗️ Architecture

### Frontend
- Customer Portal: Next.js (React) + TypeScript
- Admin Portal: Next.js (React) + TypeScript
- State Management: React Query + Zustand
- Styling: Tailwind CSS + Shadcn UI
- Hosting: Vercel (Customer) + AWS Amplify (Admin)

### Backend
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- File Storage: Supabase Storage
- Real-time: Supabase Realtime

### Domains
- Customer: `customer.qrorderapp.com/[restaurant-id]/[table-number]`
- Admin: `admin.qrorderapp.com`

## 🚀 Getting Started

### Prerequisites
1. Node.js 18+ and npm/yarn
2. Supabase account
3. Vercel account
4. AWS account (for Amplify)
5. Cloudflare account (for DNS management)

### Development Setup
1. Clone this repository
2. Set up environment variables (see `.env.example`)
3. Install dependencies:
   ```bash
   # Customer Portal
   cd customer-portal
   npm install

   # Admin Portal
   cd admin-portal
   npm install
   ```
4. Run development servers:
   ```bash
   # Customer Portal
   npm run dev

   # Admin Portal
   npm run dev
   ```

## 📁 Project Structure

```
├── customer-portal/          # Customer-facing Next.js application
│   ├── src/
│   │   ├── app/             # Next.js 13+ App Router
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and helpers
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
│
├── admin-portal/            # Admin Next.js application
│   ├── src/
│   │   ├── app/            # Next.js 13+ App Router
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and helpers
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json
│
├── supabase/              # Database configurations
│   ├── migrations/        # Database migrations
│   └── functions/        # Database functions
│
├── docs/                 # Documentation
└── infrastructure/      # Infrastructure configurations
```

## 🔐 Security

- Row Level Security (RLS) implemented in Supabase
- Rate limiting on QR code scans
- Secure authentication for admin portal
- Data isolation between restaurants

## 📝 License

This project is proprietary and confidential. 