# Customer Portal Configuration

## URL Structure
- Base URL: `customer.qrorderapp.com`
- Dynamic URL: `/:restaurant-slug/:table-number`

## Page States
1. **Initial Load**
   - URL parameter parsing
   - Restaurant validation
   - Table status check
   - Existing order check

2. **Menu Browse**
   - Category navigation
   - Item filtering
   - Cart management

3. **Order Review**
   - Cart summary
   - Notes input
   - Order submission

4. **Order Status**
   - Real-time status updates
   - Order details display

## Data Types

### Restaurant
```json
{
    "type": "restaurant",
    "fields": {
        "name": "text",
        "slug": "text",
        "logo_url": "image",
        "address": "text",
        "active": "boolean"
    }
}
```

### Table
```json
{
    "type": "table",
    "fields": {
        "restaurant": "restaurant",
        "table_number": "text",
        "status": "option",
        "qr_code_url": "image"
    }
}
```

### Menu Category
```json
{
    "type": "menu_category",
    "fields": {
        "restaurant": "restaurant",
        "name": "text",
        "sort_order": "number",
        "active": "boolean"
    }
}
```

### Menu Item
```json
{
    "type": "menu_item",
    "fields": {
        "restaurant": "restaurant",
        "category": "menu_category",
        "name": "text",
        "description": "text",
        "price": "number",
        "image": "image",
        "is_available": "boolean",
        "dietary_flags": "list"
    }
}
```

### Order
```json
{
    "type": "order",
    "fields": {
        "restaurant": "restaurant",
        "table": "table",
        "status": "option",
        "total_amount": "number",
        "notes": "text"
    }
}
```

### Order Item
```json
{
    "type": "order_item",
    "fields": {
        "order": "order",
        "menu_item": "menu_item",
        "quantity": "number",
        "unit_price": "number",
        "notes": "text"
    }
}
```

## API Connections

### Supabase Integration
1. **Authentication**
   - No auth required for viewing
   - Session tracking via localStorage

2. **Real-time Subscriptions**
   ```javascript
   supabase
     .from('orders')
     .on('UPDATE', payload => {
       // Update order status
     })
     .subscribe()
   ```

3. **Data Operations**
   - GET restaurant details
   - GET menu categories and items
   - POST new orders
   - GET order status updates

## UI Components

### Header
- Restaurant logo
- Table number
- Current order status (if exists)

### Menu Navigation
- Horizontal category scroll
- Dietary filter chips
- Search input

### Menu Item Card
```html
<div class="menu-item">
    <img src="[item.image]"/>
    <div class="details">
        <h3>[item.name]</h3>
        <p>[item.description]</p>
        <div class="price">[item.price]</div>
        <div class="dietary-flags">
            [for each flag in item.dietary_flags]
        </div>
    </div>
    <button :disabled="!item.is_available">
        Add to Cart
    </button>
</div>
```

### Cart Preview
- Fixed bottom sheet
- Item count
- Total amount
- Checkout button

### Order Status Card
```html
<div class="order-status">
    <div class="status-header">
        <h2>Order #[order.id]</h2>
        <div class="status-badge">[order.status]</div>
    </div>
    <div class="items-list">
        [for each item in order.items]
    </div>
    <div class="total">
        Total: [order.total_amount]
    </div>
</div>
```

## Workflows

### Restaurant Loading
1. Parse URL parameters
2. Fetch restaurant data
3. Validate table existence
4. Check for active orders
5. Load menu data

### Cart Management
1. Add/remove items
2. Update quantities
3. Calculate totals
4. Store in localStorage

### Order Submission
1. Validate cart items
2. Create order record
3. Create order items
4. Clear cart
5. Switch to status view

### Status Tracking
1. Subscribe to order updates
2. Update UI on status change
3. Handle completion/cancellation

## Responsive Design

### Breakpoints
```css
/* Mobile First */
@media (min-width: 768px) {
    /* Tablet styles */
}
@media (min-width: 1024px) {
    /* Desktop styles */
}
```

### PWA Configuration
```json
{
    "name": "QR Order App",
    "short_name": "QROrder",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#000000",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

## Performance Optimizations

1. **Image Handling**
   - Lazy loading
   - WebP format
   - Responsive sizes

2. **Data Caching**
   - Menu data in localStorage
   - PWA asset caching
   - API response caching

3. **State Management**
   - Efficient updates
   - Minimal re-renders
   - Optimistic UI updates 