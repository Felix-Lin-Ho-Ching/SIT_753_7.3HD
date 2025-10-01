const express = require('express');
const session = require('express-session');
const path = require('path');

let sqlite3 = null;
if (process.env.NODE_ENV !== 'test') {
    try { sqlite3 = require('sqlite3').verbose(); } catch (_) { sqlite3 = null; }
}

let bcrypt = null;
try { bcrypt = require('bcrypt'); } catch (_) { bcrypt = null; }

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'change-me-secret', resave: false, saveUninitialized: false }));

try {
    const promBundle = require('express-prom-bundle');
    const metrics = promBundle({ includeMethod: true, includePath: true, includeStatusCode: true });
    app.use(metrics);
} catch (_) { }

let db = null;
if (sqlite3) {
    const DB_FILE = path.join(__dirname, 'users.db');
    db = new sqlite3.Database(DB_FILE);
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)');
    });
}

app.get('/healthz', (req, res) => res.status(200).send('ok'));

module.exports = app;

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on ${port}`));
}
