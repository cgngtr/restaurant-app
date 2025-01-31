# QR-Based Restaurant Ordering System

A no-code SaaS application for restaurants to manage orders through QR codes.

## 🌟 Features

- QR code-based ordering system
- Dual interface: Customer & Admin portals
- Real-time order tracking
- Multi-tenant architecture
- Table management system
- Mobile-first PWA design

## 🏗️ Architecture

### Frontend
- Customer Portal: Bubble.io (PWA)
- Admin Portal: Bubble.io
- Hosting: Vercel (Customer) + AWS Amplify (Admin)

### Backend
- Database: Supabase
- Authentication: Magic Links (Admin)
- File Storage: Supabase Storage

### Domains
- Customer: `customer.qrorderapp.com/[restaurant-id]/[table-number]`
- Admin: `admin.qrorderapp.com`

## 🚀 Getting Started

### Prerequisites
1. Bubble.io account
2. Supabase account
3. Vercel account
4. AWS account (for Amplify)
5. Cloudflare account (for DNS management)

### Development Setup
1. Clone this repository
2. Set up environment variables (see `.env.example`)
3. Initialize Supabase project
4. Configure Bubble.io workspace
5. Set up deployment pipelines

## 📁 Project Structure

```
├── docs/                 # Documentation
├── supabase/            # Supabase configurations and migrations
├── bubble-exports/      # Bubble.io exported configurations
│   ├── customer/        # Customer portal exports
│   └── admin/          # Admin portal exports
└── infrastructure/     # Infrastructure as Code (if needed)
```

## 🔐 Security

- Row Level Security (RLS) implemented in Supabase
- Rate limiting on QR code scans
- Secure authentication for admin portal
- Data isolation between restaurants

## 📝 License

This project is proprietary and confidential. 