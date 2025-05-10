# Kundenbestellung_v6

This project is a customer order tracking and management system designed for efficient handling of customer orders. It features a modern, responsive frontend built with Tailwind CSS and a backend powered by Node.js and SQLite.

## Current State of the Project

- **Order Overview Page**: Displays a paginated list of customer orders with details such as order number, date, customer name, status, and assigned employee.
- **Order Details Modal**: Clicking "Details anzeigen" opens a modal with detailed order information, including editable fields and order history.
- **Order Management**: Users can view, edit, and save changes to orders. Changes are tracked with a history log.
- **Backend API**: Provides endpoints for fetching orders, fetching individual order details, updating orders, and sending order emails.
- **Database**: Uses SQLite for storing orders and order history.
- **Mock Data**: Currently, the frontend uses mock data for demonstration purposes.
- **Styling**: Utilizes Tailwind CSS for a clean, modern UI with responsive design.

## How to Run

1. Install dependencies:
   ```
   npm install
   ```
2. Start the server:
   ```
   npm start
   ```
3. Open the application in your browser at `http://localhost:3000/auftragsübersicht.html`.

## Future Improvements

- Replace mock data with real API integration.
- Add authentication and user roles.
- Enhance email sending functionality.
- Improve error handling and validation.

## License

This project is licensed under the MIT License.
