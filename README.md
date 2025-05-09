# Order Tracking Application

This is a Node.js application for employee customer order tracking with a web interface. It uses Express.js backend, SQLite database, and a Tailwind CSS frontend. The app supports order creation, editing, status management, search, barcode generation, and sending order details via email.

## Features

- Create and track customer orders
- System-generated order number with barcode
- Search orders by any field, especially order number
- Update order status with timestamp and employer confirmation
- Send order details via email
- Responsive and modern UI with Tailwind CSS
- German language interface
- Manufacturer/Supplier tracking
- PDF generation with barcode for orders

## Recent Updates

### Version 3 Changes
- Complete UI translation to German
- Added new "Hersteller/Lieferant" (Manufacturer/Supplier) field
- Updated PDF generation with German field labels
- Database migration support for new fields
- Improved error handling for form submissions

## Setup and Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open your browser and go to:

```
http://localhost:3000/
```

## Field Descriptions

The application includes the following fields:
- Bestellnummer (Order Number) - Automatically generated
- Datum (Date) - Order creation date
- Kunde (Customer) - Name of the person ordering
- Telefon (Phone) - Customer's phone number
- Email - Customer's email address
- Beschreibung (Description) - Order details
- Mitarbeiter (Employee) - Employee handling the order
- Hersteller/Lieferant (Manufacturer/Supplier) - Source of the ordered items
- Status - Current order status (Zur Ansicht, Eilt!, Intern/Allgemein)

## Notes

- Update the SMTP configuration in `server.js` with your email provider details.
- The email sending feature requires a valid SMTP server.
- The database will automatically migrate to add new fields on first run.
- All UI elements and PDF generation use German language labels.

## License

MIT License
