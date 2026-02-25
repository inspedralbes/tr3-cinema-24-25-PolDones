const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initDb } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let db;
let connectedUsersCount = 0;

async function getAdminData() {
    const events = await db.all('SELECT * FROM events');
    const enrichedEvents = await Promise.all(events.map(async (e) => {
        const sold = await db.get('SELECT COUNT(*) as count FROM seats WHERE event_id = ? AND status = "sold"', [e.id]);
        const reserved = await db.get('SELECT COUNT(*) as count FROM seats WHERE event_id = ? AND status = "reserved"', [e.id]);
        const total = await db.get('SELECT COUNT(*) as count FROM seats WHERE event_id = ?', [e.id]);
        return {
            ...e,
            soldCount: sold.count,
            reservedCount: reserved.count,
            availableCount: total.count - sold.count - reserved.count
        };
    }));
    return {
        events: enrichedEvents,
        connectedUsers: connectedUsersCount
    };
}

async function broadcastAdminUpdate() {
    const data = await getAdminData();
    io.emit('admin_update', data);
}

// Socket.IO Logic
io.on('connection', (socket) => {
    connectedUsersCount++;
    console.log('Nou usuari connectat:', socket.id);
    broadcastAdminUpdate();

    socket.on('admin_join', async () => {
        const data = await getAdminData();
        socket.emit('admin_update', data);
    });

    // Enviar l'estat actual dels seients quan un client es connecta a un esdeveniment
    socket.on('join_event', async (eventId) => {
        console.log(`Socket ${socket.id} s'uneix a l'esdeveniment ${eventId}`);
        socket.join(`event_${eventId}`);
        const seats = await db.all('SELECT * FROM seats WHERE event_id = ?', [eventId]);
        socket.emit('seats_update', seats);
    });

    // Reserva de seient
    socket.on('reserve_seat', async ({ eventId, seatId, userId }) => {
        console.log(`Reserva sol·licitada: Event ${eventId}, Seient ${seatId}, Usuari ${userId}`);
        const reservedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // Utilitzar un UPDATE atòmic amb una clàusula WHERE status = 'available'
        const result = await db.run(
            'UPDATE seats SET status = "reserved", reserved_until = ?, user_id = ? WHERE id = ? AND event_id = ? AND status = "available"',
            [reservedUntil, userId, seatId, eventId]
        );

        if (result.changes > 0) {
            const updatedSeat = await db.get('SELECT * FROM seats WHERE id = ?', [seatId]);
            io.to(`event_${eventId}`).emit('seat_updated', updatedSeat);
            broadcastAdminUpdate();

            // Auto-alliberament després de 5 minuts
            setTimeout(async () => {
                const currentSeat = await db.get('SELECT * FROM seats WHERE id = ?', [seatId]);
                if (currentSeat.status === 'reserved' && currentSeat.user_id === userId) {
                    await db.run('UPDATE seats SET status = "available", reserved_until = NULL, user_id = NULL WHERE id = ?', [seatId]);
                    const releasedSeat = await db.get('SELECT * FROM seats WHERE id = ?', [seatId]);
                    io.to(`event_${eventId}`).emit('seat_updated', releasedSeat);
                    broadcastAdminUpdate();
                }
            }, 5 * 60 * 1000);

            socket.emit('reservation_success', { seatId });
        } else {
            socket.emit('reservation_error', { message: 'El seient ja no està disponible.' });
        }
    });

    // Alliberar seient (si l'usuari deselecciona)
    socket.on('release_seat', async ({ eventId, seatId, userId }) => {
        const seat = await db.get('SELECT * FROM seats WHERE id = ? AND user_id = ? AND status = "reserved"', [seatId, userId]);
        if (seat) {
            await db.run('UPDATE seats SET status = "available", reserved_until = NULL, user_id = NULL WHERE id = ?', [seatId]);
            const updatedSeat = await db.get('SELECT * FROM seats WHERE id = ?', [seatId]);
            io.to(`event_${eventId}`).emit('seat_updated', updatedSeat);
            broadcastAdminUpdate();
        }
    });

    // Confirmar compra
    socket.on('confirm_purchase', async ({ eventId, userId, email, name }) => {
        try {
            const reservedSeats = await db.all(
                'SELECT * FROM seats WHERE event_id = ? AND user_id = ? AND status = "reserved"',
                [eventId, userId]
            );

            if (reservedSeats.length > 0) {
                const totalAmount = reservedSeats.reduce((acc, s) => acc + s.price, 0);

                // Crear la compra
                const purchaseResult = await db.run(
                    'INSERT INTO purchases (user_email, total_amount) VALUES (?, ?)',
                    [email, totalAmount]
                );
                const purchaseId = purchaseResult.lastID;

                // Actualitzar seients a "sold" i crear items de compra
                for (const seat of reservedSeats) {
                    await db.run(
                        'UPDATE seats SET status = "sold", reserved_until = NULL, user_id = ? WHERE id = ?',
                        [email, seat.id]
                    );
                    await db.run(
                        'INSERT INTO purchase_items (purchase_id, seat_id) VALUES (?, ?)',
                        [purchaseId, seat.id]
                    );
                }

                // Notificar a tothom el canvi d'estat
                const allSeats = await db.all('SELECT * FROM seats WHERE event_id = ?', [eventId]);
                io.to(`event_${eventId}`).emit('seats_update', allSeats);
                broadcastAdminUpdate();

                socket.emit('purchase_success');
                console.log(`✅ Compra confirmada per ${email}: ${reservedSeats.length} seients.`);
            } else {
                socket.emit('purchase_error', { message: 'No tens seients reservats.' });
            }
        } catch (error) {
            console.error('❌ Error en confirm_purchase:', error);
            socket.emit('purchase_error', { message: 'Error intern del servidor.' });
        }
    });

    // Reiniciar seients (Admin)
    socket.on('reset_seats', async () => {
        await db.run('UPDATE seats SET status = "available", user_id = NULL, reserved_until = NULL');
        await db.run('DELETE FROM purchase_items');
        await db.run('DELETE FROM purchases');

        // Notificar a tothom
        const allEvents = await db.all('SELECT id FROM events');
        for (const event of allEvents) {
            const seats = await db.all('SELECT * FROM seats WHERE event_id = ?', [event.id]);
            io.to(`event_${event.id}`).emit('seats_update', seats);
        }

        await broadcastAdminUpdate();
        console.log('Seients i compres reiniciades per un administrador.');
    });

    socket.on('disconnect', () => {
        connectedUsersCount--;
        console.log('Usuari desconnectat:', socket.id);
        broadcastAdminUpdate();
    });
});

// API Routes
app.get('/api/events', async (req, res) => {
    const events = await db.all('SELECT * FROM events');
    res.json(events);
});

app.get('/api/events/:id', async (req, res) => {
    const event = await db.get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Esdeveniment no trobat' });
    res.json(event);
});

app.get('/api/events/:id/seats', async (req, res) => {
    const seats = await db.all('SELECT * FROM seats WHERE event_id = ?', [req.params.id]);
    res.json(seats);
});

app.get('/api/tickets', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email requerit' });

    const sql = `
        SELECT s.*, e.name as event_name, e.date 
        FROM seats s 
        JOIN events e ON s.event_id = e.id 
        WHERE s.status = "sold" AND s.user_id = ?
    `;
    const tickets = await db.all(sql, [email]);
    res.json(tickets);
});

app.post('/api/admin/reset', async (req, res) => {
    try {
        await db.run('UPDATE seats SET status = "available", user_id = NULL, reserved_until = NULL');
        await db.run('DELETE FROM purchase_items');
        await db.run('DELETE FROM purchases');

        // Notificar a tothom via socket
        const allEvents = await db.all('SELECT id FROM events');
        for (const event of allEvents) {
            const seats = await db.all('SELECT * FROM seats WHERE event_id = ?', [event.id]);
            io.to(`event_${event.id}`).emit('seats_update', seats);
        }

        await broadcastAdminUpdate();
        console.log('✅ Base de dades reiniciada via API REST.');
        res.json({ success: true, message: 'Seients i compres reiniciades correctament.' });
    } catch (error) {
        console.error('❌ Error en reset via API:', error);
        res.status(500).json({ error: 'Error intern al reiniciar la base de dades.' });
    }
});

// Start Server
const PORT = process.env.PORT || 3001;
initDb().then(database => {
    db = database;
    server.listen(PORT, () => {
        console.log(`Servidor escoltant al port ${PORT}`);
    });
});
