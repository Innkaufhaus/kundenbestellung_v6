# Kundenbestellung Tracking System

A comprehensive order tracking system for managing customer orders with advanced admin functionality.

## Features

### Main Order Management
- Create new customer orders with detailed information
- Auto-generated order numbers with barcode
- Real-time order status tracking
- Search and filter orders
- Email notifications
- PDF generation for orders

### Admin Features
- Secure admin access with passcode protection (27061975)
- Database backup functionality
- Comprehensive order management interface
  - Bulk status updates
  - Multi-select operations
  - Advanced sorting and filtering
  - Order history tracking
  - Bulk delete capability

### Technical Features
- SQLite database with automatic migrations
- Real-time order updates
- Responsive design with Tailwind CSS
- Barcode generation for order tracking
- Detailed logging system
- Transaction support for bulk operations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Innkaufhaus/kundenbestellung_v6.git
```

2. Install dependencies:
```bash
cd kundenbestellung_v4
npm install
```

3. Start the server:
```bash
PORT=8000 node server.js
```

The application will be available at `http://localhost:8000`

## Usage

### Main Interface
- Access the main order form at the root URL
- Create new orders by filling in customer details
- View and search existing orders in the orders list
- Use the "Admin" button for administrative functions

### Admin Orders Management
- Click "Manage Orders" button in the main interface
- Use bulk selection checkboxes to select multiple orders
- Apply status changes or delete operations to selected orders
- Sort orders by date, status, or customer name
- Search across all order fields
- View detailed order history

### Admin Functions
- Access admin panel via the "Admin" button (passcode: 27061975)
- Create database backups
- Manage system settings

## API Endpoints

### Orders
- `GET /api/orders` - List all orders with search and filter support
- `GET /api/orders/:id` - Get single order details with history
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order details
- `POST /api/orders/:id/send-email` - Send order details via email

### Bulk Operations
- `PUT /api/orders/bulk-status` - Update status for multiple orders
- `DELETE /api/orders/bulk-delete` - Delete multiple orders

### Admin
- `GET /api/admin/backup` - Create database backup

## Security

- Admin access is protected with a passcode
- All bulk operations are executed within transactions
- Order history is maintained for all changes
- Input validation on all endpoints

## Database Schema

### Orders Table
- id (PRIMARY KEY)
- order_number (UNIQUE)
- order_date
- customer_name
- phone
- email
- description
- employer_name
- manufacturer_supplier
- selector
- status
- status_timestamp
- status_employer

### Order History Table
- id (PRIMARY KEY)
- order_id (FOREIGN KEY)
- changed_field
- old_value
- new_value
- changed_by
- changed_at

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is proprietary software. All rights reserved.
