<template>
  <div class="container">
    <header class="page-header">
      <h1 class="serif">Panell d'Administració</h1>
      <p>Monitorització en temps real de la sala i les vendes.</p>
    </header>
    <div class="stats-grid">
      <div class="stat-card premium-card">
        <h3>Recaptació Total</h3>
        <span class="stat-value">{{ stats.totalRevenue }}€</span>
      </div>
      <div class="stat-card premium-card">
        <h3>Entrades Venudes</h3>
        <span class="stat-value">{{ stats.soldSeats }}</span>
      </div>
      <div class="stat-card premium-card">
        <h3>Ocupació Media</h3>
        <span class="stat-value">{{ stats.occupancy }}%</span>
      </div>
      <div class="stat-card premium-card">
        <h3>Usuaris Online</h3>
        <span class="stat-value">{{ connectedUsers }}</span>
      </div>
    </div>

    <div class="admin-content">
      <section class="events-management">
        <h2>Gestió d'Esdeveniments</h2>
        <button class="btn btn-danger" @click="resetAllSeats">Reiniciar Seients</button>
        <br>
        <br>
        <div class="events-list">
          <div v-for="event in events" :key="event.id" class="event-admin-card premium-card">
            <div class="ev-info">
              <h3>{{ event.name }}</h3>
              <p>{{ event.date }}</p>
            </div>
            <div class="ev-stats">
              <span class="tag sold">{{ event.soldCount }} venuts</span>
              <span class="tag reserved">{{ event.reservedCount }} reservats</span>
              <span class="tag available">{{ event.availableCount }} lliures</span>
            </div>
            <div class="ev-actions">
              <button class="btn btn-outline" @click="viewDetails(event.id)">Monitoritzar</button>
            </div>
          </div>
        </div>
        <div v-if="lastError" class="debug-error">
          Últim error: {{ lastError }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const { $socket } = useNuxtApp();
const events = ref([]);
const connectedUsers = ref(0);
const lastError = ref(null);

const stats = computed(() => {
  let totalRevenue = 0;
  let soldSeats = 0;
  let totalSeats = 0;

  events.value.forEach(e => {
    soldSeats += e.soldCount;
    totalSeats += (e.soldCount + e.reservedCount + e.availableCount);
    // Assumim preu fix per simplificació en aquest resum
    totalRevenue += (e.soldCount * 15); 
  });

  const occupancy = totalSeats > 0 ? ((soldSeats / totalSeats) * 100).toFixed(1) : 0;

  return { totalRevenue, soldSeats, occupancy };
});

onMounted(() => {
  $socket.connect();
  $socket.emit('admin_join');

  $socket.on('admin_update', (data) => {
    events.value = data.events;
    connectedUsers.value = data.connectedUsers;
    if (resetting.value) {
       resetting.value = false;
       alert('Seients i compres reiniciats correctament.');
    }
  });
});

const resetting = ref(false);

onUnmounted(() => {
  $socket.disconnect();
});

function viewDetails(id) {
  navigateTo(`/esdeveniment/${id}`);
}

async function resetAllSeats() {
  const host = window.location.hostname || 'localhost';
  const url = `http://${host}:3001/api/admin/reset`;
  console.log(`Petició de reinici a: ${url}`);
  lastError.value = null;

  if (confirm('Estàs segur que vols reiniciar tots els seients de tots els esdeveniments?')) {
    resetting.value = true;
    try {
      const response = await $fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => {
        console.warn('Petició REST fallida, intentant fallback via Socket...');
        $socket.emit('reset_seats');
        return { success: true, fallback: true };
      });

      console.log('Resposta del servidor:', response);
      if (response.success) {
        alert(response.fallback ? 'Reinici enviat via Socket (contingència).' : 'Reinici enviat via REST.');
      }
    } catch (error) {
      console.error('Error total al reiniciar:', error);
      lastError.value = error.message || 'Error desconegut';
      alert(`Error crític: ${lastError.value}`);
    } finally {
      setTimeout(() => {
        resetting.value = false;
      }, 1000);
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 4rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.stat-card h3 {
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: var(--ink-tertiary);
  margin: 0 0 0.5rem 0;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--ink-primary);
  display: block;
}

.event-admin-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
  font-weight: 600;
}

.tag.sold { background: rgba(244, 67, 54, 0.2); color: #f44336; }
.tag.reserved { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
.tag.available { background: rgba(76, 175, 80, 0.2); color: #4caf50; }

.btn-outline:hover {
  background: var(--primary);
  color: white;
}

.btn-danger {
  background: var(--brand);
  color: white;
  margin-left: 0.5rem;
}

.btn-danger:hover {
  background: #bb0000;
}

.debug-error {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  font-family: monospace;
  font-size: 0.85rem;
}
</style>
