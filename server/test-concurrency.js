const { io } = require('socket.io-client');

async function testConcurrency() {
    const URL = 'http://localhost:3001';
    const eventId = 1;
    const seatId = 30; // Un seient fresc
    const numUsers = 5;

    console.log(`Iniciant test de concurrència amb ${numUsers} usuaris intentant reservar el seient ${seatId}...`);

    const clients = [];
    const results = [];

    for (let i = 0; i < numUsers; i++) {
        const socket = io(URL);
        const userId = `user_${i}`;

        clients.push(new Promise((resolve) => {
            socket.on('connect', () => {
                socket.emit('join_event', eventId);

                // Intentem reservar tots alhora quan estiguem connectats
                setTimeout(() => {
                    socket.emit('reserve_seat', { eventId, seatId, userId });
                }, 1000);
            });

            socket.on('reservation_success', (data) => {
                results.push({ userId, success: true });
                socket.disconnect();
                resolve();
            });

            socket.on('reservation_error', (data) => {
                results.push({ userId, success: false, message: data.message });
                socket.disconnect();
                resolve();
            });
        }));
    }

    await Promise.all(clients);

    console.log('\nResultats del Test:');
    results.forEach(r => {
        console.log(`${r.userId}: ${r.success ? 'EXIT' : 'ERROR'} (${r.message || ''})`);
    });

    const successes = results.filter(r => r.success).length;
    if (successes === 1) {
        console.log('\nPASSED: Només un usuari ha pogut reservar el seient.');
    } else {
        console.log(`\nFAILED: S'han produït ${successes} reserves per al mateix seient.`);
    }
}

testConcurrency().catch(console.error);
