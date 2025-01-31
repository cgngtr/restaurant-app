# Admin Portal Configuration

## URL Structure
- Base URL: `admin.qrorderapp.com`
- Routes:
  - `/login`
  - `/dashboard`
  - `/tables`
  - `/orders`
  - `/menu`
  - `/settings`

## Authentication
- Magic link email authentication
- Session management
- Role-based access control

## Page States

### 1. Login
- Email input
- Magic link request
- Session validation

### 2. Dashboard
- Key metrics display
- Active tables overview
- Recent orders list
- Quick actions menu

### 3. Tables Management
- Grid/List view toggle
- Real-time status updates
- Order association
- QR code generation

### 4. Orders
- List/Calendar view
- Status management
- Payment tracking
- Order details modal

### 5. Menu Management
- Category organization
- Item CRUD operations
- Bulk import/export
- Image management

### 6. Settings
- Restaurant profile
- User management
- Notification settings
- Integration configs

## Data Types

### Restaurant Staff
```json
{
    "type": "staff",
    "fields": {
        "restaurant": "restaurant",
        "email": "text",
        "role": "option",
        "active": "boolean",
        "last_login": "datetime"
    }
}
```

### Restaurant Settings
```json
{
    "type": "restaurant_settings",
    "fields": {
        "restaurant": "restaurant",
        "notification_email": "text",
        "notification_preferences": "json",
        "operating_hours": "json",
        "tax_rate": "number",
        "currency": "text"
    }
}
```

### Menu Import
```json
{
    "type": "menu_import",
    "fields": {
        "restaurant": "restaurant",
        "file_url": "file",
        "status": "option",
        "processed_count": "number",
        "error_log": "text",
        "created_at": "datetime"
    }
}
```

## API Connections

### Supabase Integration
1. **Authentication**
   ```javascript
   supabase.auth.signIn({
     email: userEmail,
     options: {
       emailRedirectTo: 'admin.qrorderapp.com/dashboard'
     }
   })
   ```

2. **Real-time Subscriptions**
   ```javascript
   supabase
     .from('tables')
     .on('UPDATE', payload => {
       // Update table status
     })
     .subscribe()
   
   supabase
     .from('orders')
     .on('INSERT', payload => {
       // New order notification
     })
     .subscribe()
   ```

3. **Data Operations**
   - CRUD operations for all entities
   - Batch operations for menu items
   - File uploads for images

## UI Components

### Dashboard Metrics
```html
<div class="metrics-grid">
    <div class="metric-card">
        <h3>Active Tables</h3>
        <div class="value">[count]</div>
    </div>
    <div class="metric-card">
        <h3>Pending Orders</h3>
        <div class="value">[count]</div>
    </div>
    <div class="metric-card">
        <h3>Today's Revenue</h3>
        <div class="value">[sum]</div>
    </div>
</div>
```

### Table Management Grid
```html
<div class="tables-grid">
    [for each table]
    <div class="table-card" :class="table.status">
        <h2>Table [table.number]</h2>
        <div class="status">[table.status]</div>
        <div class="actions">
            <button @click="viewOrders">Orders</button>
            <button @click="resetTable">Reset</button>
            <button @click="downloadQR">QR</button>
        </div>
    </div>
</div>
```

### Order Management
```html
<div class="order-list">
    <div class="filters">
        <select v-model="statusFilter">
            <option>All</option>
            <option>Pending</option>
            <option>Preparing</option>
            <option>Ready</option>
        </select>
        <input type="date" v-model="dateFilter"/>
    </div>
    <div class="orders">
        [for each filtered_order]
    </div>
</div>
```

## Workflows

### Restaurant Setup
1. Create restaurant profile
2. Configure settings
3. Generate table QR codes
4. Import initial menu

### Table Management
1. Monitor table statuses
2. View table orders
3. Reset table state
4. Generate/regenerate QR codes

### Order Processing
1. Receive new order notification
2. Update order status
3. Track payment status
4. Complete/cancel order

### Menu Management
1. Create/edit categories
2. Add/edit menu items
3. Upload images
4. Update availability
5. Bulk import/export

## Responsive Design

### Breakpoints
```css
/* Desktop First */
@media (max-width: 1200px) {
    /* Large tablet styles */
}
@media (max-width: 992px) {
    /* Small tablet styles */
}
@media (max-width: 768px) {
    /* Mobile styles */
}
```

## Performance Optimizations

1. **Data Loading**
   - Pagination
   - Infinite scroll
   - Data prefetching

2. **Real-time Updates**
   - Debounced updates
   - Batch processing
   - Optimistic UI

3. **Image Optimization**
   - Compression
   - CDN delivery
   - Lazy loading

## Security Measures

1. **Authentication**
   - Session management
   - Inactivity timeout
   - Device tracking

2. **Authorization**
   - Role-based access
   - Action logging
   - IP whitelisting

3. **Data Protection**
   - Input validation
   - XSS prevention
   - CSRF protection

## Notifications

### Email Templates
```json
{
    "new_order": {
        "subject": "New Order #[order.id]",
        "template": "new-order-template",
        "variables": ["order_id", "table_number", "items"]
    },
    "status_update": {
        "subject": "Order Status Update",
        "template": "status-update-template",
        "variables": ["order_id", "status", "timestamp"]
    }
}
```

### Push Notifications
```javascript
{
    "title": "New Order",
    "body": "Table [number] has placed an order",
    "icon": "/icon-192.png",
    "badge": "/badge.png",
    "tag": "order-notification",
    "data": {
        "orderId": "[order.id]",
        "tableId": "[table.id]"
    }
}
``` 