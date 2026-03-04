const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    const count = await db.get('SELECT COUNT(*) as count FROM events');
    console.log('Events count:', count.count);
    const events = await db.all('SELECT * FROM events');
    console.log('Events sample:', JSON.stringify(events.slice(0, 1)));
}

check().catch(console.error);
