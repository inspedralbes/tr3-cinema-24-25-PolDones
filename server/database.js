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
            name TEXT,
            description TEXT,
            date TEXT,
            location TEXT,
            image TEXT,
            rows INTEGER,
            cols INTEGER
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
        await db.run("INSERT INTO events (name, description, date, location, image, rows, cols) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ['Gran Estrena: El Futur del Cinema', 'Una experiència immersiva sobre el futur de la tecnologia.', '2026-02-20 20:00', 'Sala Principal', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba', 5, 8]);

        await db.run("INSERT INTO events (name, description, date, location, image, rows, cols) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ['Clàssics: Cinema d\'Autor', 'Selecció de les millors obres del cinema clàssic.', '2026-02-21 18:30', 'Sala B', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1', 5, 8]);

        // Generar seients (5 files, 8 columnes = 40 seients per esdeveniment)
        const events = await db.all("SELECT id, rows, cols FROM events");
        for (const event of events) {
            for (let r = 1; r <= event.rows; r++) {
                for (let c = 1; c <= event.cols; c++) {
                    await db.run(
                        "INSERT INTO seats (event_id, row, col, price, status) VALUES (?, ?, ?, ?, ?)",
                        [event.id, r, c, 12, 'available']
                    );
                }
            }
        }
    }

    console.log('Base de dades inicialitzada correctament.');
    return db;
}

if (require.main === module) {
    initDb().catch(console.error);
}

module.exports = { initDb };
