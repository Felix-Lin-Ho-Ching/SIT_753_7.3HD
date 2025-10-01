const path = require('path');
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

let bcrypt = null;
try { bcrypt = require('bcrypt'); } catch (e) { }

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'change-me-secret', resave: false, saveUninitialized: false }));

const promBundle = require('express-prom-bundle');
const metricsMiddleware = promBundle({ includeMethod: true, includePath: true, includeStatusCode: true });
app.use(metricsMiddleware);

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

const DB_PATH = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      query TEXT NOT NULL
    )
  `);
});

function sendHtml(res, filename) {
    res.sendFile(path.join(__dirname, filename));
}

async function passwordMatches(plain, stored) {
    if (bcrypt && typeof stored === 'string' && stored.startsWith('$2')) {
        try { return await bcrypt.compare(plain, stored); } catch { return false; }
    }
    return plain === stored;
}

app.get('/', (_req, res) => sendHtml(res, 'home.html'));
app.get('/home', (_req, res) => sendHtml(res, 'home.html'));
app.get('/products', (_req, res) => sendHtml(res, 'products.html'));
app.get('/login', (_req, res) => sendHtml(res, 'login.html'));

app.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).send('Username and password required');

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) return res.status(500).send('Database error');
        if (!row) return res.status(401).send('Invalid credentials');

        const ok = await passwordMatches(password, row.password);
        if (!ok) return res.status(401).send('Invalid credentials');

        req.session.user = { id: row.id, username: row.username };
        req.session.role = (row.username === 'admin') ? 'admin' : 'user';
        return res.redirect('/home');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

app.post('/feedback', (req, res) => {
    const { name, email, phone, query } = req.body || {};
    if (!name || !email || !phone || !query) return res.status(400).send('All fields are required');

    const sql = 'INSERT INTO feedback (name, email, phone, query) VALUES (?, ?, ?, ?)';
    db.run(sql, [name, email, phone, query], function (err) {
        if (err) return res.status(500).send('Database error');
        return res.status(201).json({ id: this.lastID, status: 'received' });
    });
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on :${PORT}`));
}
