const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function initDb() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT,
            rows INTEGER NOT NULL,
            cols INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS seats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            row INTEGER NOT NULL,
            col INTEGER NOT NULL,
            status TEXT DEFAULT 'available',
            reserved_until TEXT,
            user_id TEXT,
            price REAL NOT NULL,
            FOREIGN KEY (event_id) REFERENCES events(id)
        );

        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            total_amount REAL NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS purchase_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            purchase_id INTEGER NOT NULL,
            seat_id INTEGER NOT NULL,
            FOREIGN KEY (purchase_id) REFERENCES purchases(id),
            FOREIGN KEY (seat_id) REFERENCES seats(id)
        );
    `);

    // Insert dummy data if empty
    const eventCount = await db.get('SELECT COUNT(*) as count FROM events');
    if (eventCount.count === 0) {
        const eventResult = await db.run(
            'INSERT INTO events (name, date, location, description, rows, cols) VALUES (?, ?, ?, ?, ?, ?)',
            ['Gran Estrena: El Futur del Cinema', '2026-05-20 20:00', 'Auditori Principal', 'Una experiència cinematogràfica inoblidable amb tecnologia de darrera generació.', 10, 15]
        );
        const eventId = eventResult.lastID;

        const seats = [];
        for (let r = 1; r <= 10; r++) {
            for (let c = 1; c <= 15; c++) {
                seats.push(`(${eventId}, ${r}, ${c}, 'available', 15.0)`);
            }
        }
        await db.exec(`INSERT INTO seats (event_id, row, col, status, price) VALUES ${seats.join(',')}`);
    }

    console.log('Base de dades inicialitzada correctament.');
    return db;
}

if (require.main === module) {
    initDb().catch(console.error);
}

module.exports = { initDb };
