const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function fetchMoviesFromApi() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await fetch('https://devsapihub.com/api-movies', { signal: controller.signal });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('API request timed out');
        } else {
            console.error('Error fetching movies from API:', error);
        }
        return [];
    } finally {
        clearTimeout(timeoutId);
    }
}

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

    // Insert data if empty
    const eventCount = await db.get('SELECT COUNT(*) as count FROM events');
    if (eventCount.count === 0) {
        console.log('Fetching movies from API...');
        let apiMovies = await fetchMoviesFromApi();

        await db.run('BEGIN TRANSACTION');
        try {
            // Default fallback movies if API fails
            if (!apiMovies || apiMovies.length === 0) {
                apiMovies = [
                    { title: 'Gran Estrena: El Futur', description: 'Una experiència immersiva sobre el futur de la tecnologia.', image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba' },
                    { title: 'Aventures Galàctiques', description: 'Un viatge a través de les estrelles i galàxies.', image_url: 'https://images.unsplash.com/photo-1506443432602-ac2fcd6f5ec0' },
                    { title: 'Misteri a la Mitjanit', description: 'Un thriller captivador on res és el que sembla.', image_url: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0' },
                    { title: 'Comèdia d\'Estiu', description: 'Riures assegurats amb aquesta esbojarrada comèdia.', image_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26' }
                ];
            }

            // Ensure we have exactly 4 distinct movies
            const moviesToSchedule = apiMovies.slice(0, 4);
            const theaters = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4'];
            const sessionHours = [16, 19, 22]; // 3 sessions per day

            // Generate schedule for today and the next 2 days (3 days total)
            for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
                for (let i = 0; i < moviesToSchedule.length; i++) {
                    const movie = moviesToSchedule[i];
                    const theater = theaters[i % theaters.length];

                    for (const hour of sessionHours) {
                        const movieDate = new Date();
                        movieDate.setDate(movieDate.getDate() + dayOffset);
                        movieDate.setHours(hour, 0, 0, 0);
                        const dateStr = movieDate.toISOString().replace('T', ' ').substring(0, 16);

                        await db.run(
                            "INSERT INTO events (name, description, date, location, image, rows, cols) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            [movie.title, movie.description, dateStr, theater, movie.image_url, 5, 8]
                        );
                    }
                }
            }

            // Generate seats
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
            await db.run('COMMIT');
        } catch (error) {
            await db.run('ROLLBACK');
            console.error('Error during database initialization:', error);
        }
    }

    console.log('Base de dades inicialitzada correctament.');
    return db;
}

if (require.main === module) {
    initDb().catch(console.error);
}

module.exports = { initDb };
