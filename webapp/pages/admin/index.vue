<template>
  <div class="container">
    <header class="admin-header">
      <h1>Panell d'Administració</h1>
      <div class="stats-overview">
        <div class="stat-card premium-card">
          <span class="label">Recaptació Total</span>
          <span class="value">{{ stats.totalRevenue }}€</span>
        </div>
        <div class="stat-card premium-card">
          <span class="label">Entrades Venudes</span>
          <span class="value">{{ stats.soldSeats }}</span>
        </div>
        <div class="stat-card premium-card">
          <span class="label">Ocupació Media</span>
          <span class="value">{{ stats.occupancy }}%</span>
        </div>
        <div class="stat-card premium-card">
          <span class="label">Usuaris Online</span>
          <span class="value">{{ connectedUsers }}</span>
        </div>
      </div>
    </header>

    <div class="admin-content">
      <section class="events-management">
        <h2>Gestió d'Esdeveniments</h2>
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
      </section>
    </div>
  </div>
</template>

<script setup>
const { $socket } = useNuxtApp();
const events = ref([]);
const connectedUsers = ref(0);

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
  });
});

onUnmounted(() => {
  $socket.disconnect();
});

function viewDetails(id) {
  navigateTo(`/esdeveniment/${id}`);
}
</script>

<style scoped>
.admin-header {
  margin-bottom: 4rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.stat-card .label {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-card .value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
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

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}
</style>
