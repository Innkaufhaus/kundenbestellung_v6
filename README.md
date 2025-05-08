# Order Tracking Application

This is a Node.js application for employee customer order tracking with a web interface. It uses Express.js backend, SQLite database, and a Tailwind CSS frontend. The app supports order creation, editing, status management, search, barcode generation, and sending order details via email.

## Features

- Create and track customer orders
- System-generated order number with barcode
- Search orders by any field, especially order number
- Update order status with timestamp and employer confirmation
- Send order details via email
- Responsive and modern UI with Tailwind CSS
- Ready for deployment on Render and GitHub management

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

## Deployment on Render

1. Create a new Web Service on [Render](https://render.com/).

2. Connect your GitHub repository containing this project.

3. Set the build command to:

```
npm install
```

4. Set the start command to:

```
npm start
```

5. Ensure the port is set to `3000` or use the environment variable `PORT`.

6. Add environment variables for your email SMTP configuration (if using email sending):

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

Update the `server.js` nodemailer transporter configuration to use these environment variables.

7. Deploy the service.

## GitHub Management

- Push your code to a GitHub repository.
- Use branches and pull requests for feature development.
- Use GitHub Actions or other CI/CD tools to automate tests and deployment to Render.

## Notes

- Update the SMTP configuration in `server.js` with your email provider details.
- The email sending feature requires a valid SMTP server.
- The edit order functionality in the frontend currently shows a placeholder alert and can be extended.

## License

MIT License
