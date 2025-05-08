const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('./orders.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE,
      order_date TEXT,
      customer_name TEXT,
      phone TEXT,
      email TEXT,
      description TEXT,
      employer_name TEXT,
      selector TEXT,
      status TEXT DEFAULT 'offen',
      status_timestamp TEXT,
      status_employer TEXT
    )`);
  }
});

// Utility function to generate order number
function generateOrderNumber() {
  const now = new Date();
  return 'ORD' + now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0') +
    Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

// API to get a single order by ID
app.get('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to retrieve order' });
    } else if (!order) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      res.json(order);
    }
  });
});

// API to get all orders with optional search query
app.get('/api/orders', (req, res) => {
  const search = req.query.search || '';
  const sql = `
    SELECT * FROM orders
    WHERE order_number LIKE ? OR
          customer_name LIKE ? OR
          phone LIKE ? OR
          email LIKE ? OR
          description LIKE ? OR
          employer_name LIKE ? OR
          selector LIKE ? OR
          status LIKE ?
    ORDER BY order_date DESC
  `;
  const likeSearch = '%' + search + '%';
  db.all(sql, [likeSearch, likeSearch, likeSearch, likeSearch, likeSearch, likeSearch, likeSearch, likeSearch], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to retrieve orders' });
    } else {
      res.json(rows);
    }
  });
});

// API to create a new order
app.post('/api/orders', (req, res) => {
  const {
    customer_name,
    phone,
    email,
    description,
    employer_name,
    selector
  } = req.body;

  const order_number = generateOrderNumber();
  const order_date = new Date().toISOString();

  const sql = `INSERT INTO orders 
    (order_number, order_date, customer_name, phone, email, description, employer_name, selector, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'offen')`;

  db.run(sql, [order_number, order_date, customer_name, phone, email, description, employer_name, selector], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to create order' });
    } else {
      res.json({ id: this.lastID, order_number, order_date });
    }
  });
});

// API to update order status and details
app.put('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const {
    customer_name,
    phone,
    email,
    description,
    employer_name,
    selector,
    status,
    status_employer
  } = req.body;

  const status_timestamp = status ? new Date().toISOString() : null;

  const sql = `
    UPDATE orders SET
      customer_name = ?,
      phone = ?,
      email = ?,
      description = ?,
      employer_name = ?,
      selector = ?,
      status = ?,
      status_timestamp = ?,
      status_employer = ?
    WHERE id = ?
  `;

  db.run(sql, [customer_name, phone, email, description, employer_name, selector, status, status_timestamp, status_employer, id], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to update order' });
    } else {
      res.json({ message: 'Order updated' });
    }
  });
});

// API to send order via email
app.post('/api/orders/:id/send-email', (req, res) => {
  const id = req.params.id;
  const { toEmail } = req.body;

  if (!toEmail) {
    return res.status(400).json({ error: 'Recipient email address is required' });
  }

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Setup nodemailer transporter (using a test account or environment variables)
    let transporter = nodemailer.createTransport({
      // For testing, use ethereal.email or configure SMTP here
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your_email@example.com',
        pass: 'your_email_password'
      }
    });

    const mailOptions = {
      from: '"Order Tracking" <no-reply@example.com>',
      to: toEmail,
      subject: `Order Details - ${order.order_number}`,
      text: `
Order Number: ${order.order_number}
Date: ${order.order_date}
Customer Name: ${order.customer_name}
Phone: ${order.phone}
Email: ${order.email}
Description: ${order.description}
Employer Name: ${order.employer_name}
Selector: ${order.selector}
Status: ${order.status}
Status Timestamp: ${order.status_timestamp || 'N/A'}
Status Employer: ${order.status_employer || 'N/A'}
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send email' });
      }
      res.json({ message: 'Email sent', info });
    });
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
