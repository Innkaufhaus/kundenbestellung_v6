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
      manufacturer_supplier TEXT,
      selector TEXT,
      status TEXT DEFAULT 'offen',
      status_timestamp TEXT,
      status_employer TEXT
    )`);

    // Migration: Add manufacturer_supplier column if it does not exist
    db.get("PRAGMA table_info(orders)", (err, row) => {
      if (err) {
        console.error('Error checking orders table info:', err.message);
      } else {
        db.all("PRAGMA table_info(orders)", (err, columns) => {
          if (err) {
            console.error('Error fetching orders table columns:', err.message);
          } else {
            const columnNames = columns.map(col => col.name);
            if (!columnNames.includes('manufacturer_supplier')) {
              db.run("ALTER TABLE orders ADD COLUMN manufacturer_supplier TEXT", (err) => {
                if (err) {
                  console.error('Error adding manufacturer_supplier column:', err.message);
                } else {
                  console.log('Added manufacturer_supplier column to orders table.');
                }
              });
            }
          }
        });
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS order_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      changed_field TEXT,
      old_value TEXT,
      new_value TEXT,
      changed_by TEXT,
      changed_at TEXT,
      FOREIGN KEY(order_id) REFERENCES orders(id)
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
      // Also fetch order history
      db.all('SELECT * FROM order_history WHERE order_id = ? ORDER BY changed_at DESC', [id], (err2, history) => {
        if (err2) {
          console.error(err2.message);
          return res.status(500).json({ error: 'Failed to retrieve order history' });
        }
        res.json({ ...order, history });
      });
    }
  });
});

app.get('/api/orders', (req, res) => {
  const search = req.query.search || '';
  const status = req.query.status || '';
  let sql = `
    SELECT * FROM orders
    WHERE (order_number LIKE ? OR
          customer_name LIKE ? OR
          phone LIKE ? OR
          email LIKE ? OR
          description LIKE ? OR
          employer_name LIKE ? OR
          selector LIKE ?)
  `;
  const params = Array(7).fill('%' + search + '%');

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY order_date DESC';

  db.all(sql, params, (err, rows) => {
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
    manufacturer_supplier,
    selector
  } = req.body;

  const order_number = generateOrderNumber();
  const order_date = new Date().toISOString();

  const sql = `INSERT INTO orders 
    (order_number, order_date, customer_name, phone, email, description, employer_name, manufacturer_supplier, selector, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'offen')`;

  db.run(sql, [order_number, order_date, customer_name, phone, email, description, employer_name, manufacturer_supplier, selector], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to create order' });
    } else {
      res.json({ id: this.lastID, order_number, order_date });
    }
  });
});

app.put('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const {
    customer_name,
    phone,
    email,
    description,
    employer_name,
    manufacturer_supplier,
    selector,
    status,
    status_employer
  } = req.body;

  const status_timestamp = status ? new Date().toISOString() : null;

  // First, get the existing order to compare changes
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, oldOrder) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to retrieve existing order' });
    }
    if (!oldOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const sql = `
      UPDATE orders SET
        customer_name = ?,
        phone = ?,
        email = ?,
        description = ?,
        employer_name = ?,
        manufacturer_supplier = ?,
        selector = ?,
        status = ?,
        status_timestamp = ?,
        status_employer = ?
      WHERE id = ?
    `;

    db.run(sql, [customer_name, phone, email, description, employer_name, manufacturer_supplier, selector, status, status_timestamp, status_employer, id], function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to update order' });
      }

      // Log changes to order_history
      const changes = [];
      if (oldOrder.status !== status) {
        changes.push({
          changed_field: 'status',
          old_value: oldOrder.status,
          new_value: status,
          changed_by: status_employer,
          changed_at: status_timestamp
        });
      }
      if (oldOrder.customer_name !== customer_name) {
        changes.push({
          changed_field: 'customer_name',
          old_value: oldOrder.customer_name,
          new_value: customer_name,
          changed_by: employer_name,
          changed_at: new Date().toISOString()
        });
      }
      if (oldOrder.phone !== phone) {
        changes.push({
          changed_field: 'phone',
          old_value: oldOrder.phone,
          new_value: phone,
          changed_by: employer_name,
          changed_at: new Date().toISOString()
        });
      }
      if (oldOrder.email !== email) {
        changes.push({
          changed_field: 'email',
          old_value: oldOrder.email,
          new_value: email,
          changed_by: employer_name,
          changed_at: new Date().toISOString()
        });
      }
      if (oldOrder.description !== description) {
        changes.push({
          changed_field: 'description',
          old_value: oldOrder.description,
          new_value: description,
          changed_by: employer_name,
          changed_at: new Date().toISOString()
        });
      }
      if (oldOrder.employer_name !== employer_name) {
        changes.push({
          changed_field: 'employer_name',
          old_value: oldOrder.employer_name,
          new_value: employer_name,
          changed_by: employer_name,
          changed_at: new Date().toISOString()
        });
      }
      if (oldOrder.manufacturer_supplier !== manufacturer_supplier) {
        changes.push({
          changed_field: 'manufacturer_supplier',
          old_value: oldOrder.manufacturer_supplier,
          new_value: manufacturer_supplier,
          changed_by: employer_name,
          changed_at: new Date().toISOString()
        });
      }
      if (oldOrder.selector !== selector) {
        changes.push({
          changed_field: 'selector',
          old_value: oldOrder.selector,
          new_value: selector,
          changed_by: employer_name,
          changed_at: new Date().toISOString()
        });
      }
      if (oldOrder.status_employer !== status_employer) {
        changes.push({
          changed_field: 'status_employer',
          old_value: oldOrder.status_employer,
          new_value: status_employer,
          changed_by: status_employer,
          changed_at: status_timestamp
        });
      }

      // Insert changes into order_history
      changes.forEach(change => {
        db.run(`INSERT INTO order_history (order_id, changed_field, old_value, new_value, changed_by, changed_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [id, change.changed_field, change.old_value, change.new_value, change.changed_by, change.changed_at]);
      });

      res.json({ message: 'Order updated' });
    });
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
