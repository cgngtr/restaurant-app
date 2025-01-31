# Bubble.io Application Structure

## Customer Portal (customer.qrorderapp.com)

### Pages

1. **Landing Page** (`/[restaurant-id]/[table-number]`)
   - Restaurant header with logo
   - Table number display
   - Menu categories navigation
   - Active order status (if exists)

2. **Menu Page** (Same URL, different state)
   - Category filters
   - Dietary filters (Vegan, Vegetarian, etc.)
   - Menu items with:
     - Images
     - Descriptions
     - Prices
     - Availability status
     - Add to cart button

3. **Cart Page** (Same URL, different state)
   - Order items list
   - Item quantity adjusters
   - Notes field
   - Total amount
   - Submit order button

4. **Order Status Page** (Same URL, different state)
   - Order number
   - Status indicator
   - Items list
   - Estimated time
   - Total amount

### Workflows

1. **Restaurant Loading**
   - Parse URL parameters
   - Load restaurant data
   - Load table status
   - Check for existing orders

2. **Menu Navigation**
   - Load categories
   - Load menu items
   - Apply filters
   - Update availability

3. **Order Processing**
   - Add/remove items
   - Calculate totals
   - Submit order
   - Real-time status updates

## Admin Portal (admin.qrorderapp.com)

### Pages

1. **Login Page** (`/login`)
   - Email input for magic link
   - Login button

2. **Dashboard** (`/dashboard`)
   - Key metrics
   - Active tables overview
   - Recent orders
   - Quick actions

3. **Tables Management** (`/tables`)
   - Grid view of all tables
   - Status indicators
   - Active order details
   - Table reset functionality

4. **Orders** (`/orders`)
   - Orders list with filters
   - Status management
   - Order details view
   - Payment tracking

5. **Menu Management** (`/menu`)
   - Categories CRUD
   - Menu items CRUD
   - Bulk import/export
   - Availability toggles

6. **Settings** (`/settings`)
   - Restaurant profile
   - QR code generation
   - User management
   - Notification settings

### Workflows

1. **Authentication**
   - Magic link email
   - Session management
   - Access control

2. **Table Management**
   - Status updates
   - Order association
   - Table reset
   - QR code generation

3. **Order Processing**
   - Status updates
   - Kitchen notifications
   - Payment tracking
   - Order history

4. **Menu Management**
   - Category ordering
   - Item CRUD
   - CSV import/export
   - Image upload

## Shared Components

### API Connections
- Supabase real-time subscriptions
- File storage integration
- QR code generation service

### Responsive Design
- Mobile-first approach
- PWA capabilities
- Offline support

### Security
- Authentication state
- Data access controls
- Rate limiting implementation

## Development Workflow

1. **Setup**
   - Create Bubble.io app
   - Configure Supabase plugin
   - Set up environment variables

2. **Development**
   - Create reusable elements
   - Build page structures
   - Implement workflows
   - Test responsive design

3. **Testing**
   - Cross-browser testing
   - Mobile device testing
   - Load testing
   - Security testing

4. **Deployment**
   - Domain configuration
   - SSL setup
   - CDN integration
   - Performance optimization

## Environment Variables

Create a `.env.example` file to document the required environment variables.