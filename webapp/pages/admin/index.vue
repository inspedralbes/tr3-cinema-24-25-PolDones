<template>
  <div class="admin-dashboard fade-in">
    <div class="container">
      <header class="page-header premium-card header-glass">
        <div class="header-content">
          <h1 class="serif"><span class="text-gradient">Panell d'Administració</span></h1>
          <p class="subtitle">Monitorització en temps real de la sala i les vendes.</p>
        </div>
        <div class="header-actions">
          <div class="online-pulse">
            <span class="pulse-dot"></span>
            Connexió Activa
          </div>
        </div>
      </header>

      <div class="stats-grid">
        <div class="stat-card premium-card fade-in" style="animation-delay: 0.1s">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>Recaptació Total</h3>
            <span class="stat-value price-text">{{ stats.totalRevenue }}€</span>
          </div>
        </div>
        <div class="stat-card premium-card fade-in" style="animation-delay: 0.2s">
          <div class="stat-icon">🎟️</div>
          <div class="stat-info">
            <h3>Entrades Venudes</h3>
            <span class="stat-value">{{ stats.soldSeats }}</span>
          </div>
        </div>
        <div class="stat-card premium-card fade-in" style="animation-delay: 0.3s">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <h3>Ocupació Mitjana</h3>
            <span class="stat-value">{{ stats.occupancy }}%</span>
          </div>
        </div>
        <div class="stat-card premium-card fade-in" style="animation-delay: 0.4s">
          <div class="stat-icon online-icon">👥</div>
          <div class="stat-info">
            <h3>Usuaris Online</h3>
            <span class="stat-value text-gradient">{{ connectedUsers }}</span>
          </div>
        </div>
      </div>

      <div class="admin-content fade-in" style="animation-delay: 0.5s">
        <section class="events-management premium-card">
          <div class="section-header">
            <h2 class="serif">Gestió <span class="text-gradient">d'Esdeveniments</span></h2>
            <button class="btn btn-danger" @click="resetAllSeats">
              <span class="btn-icon">⚠️</span> Reiniciar Sistema
            </button>
          </div>
          
          <div class="events-list">
            <div v-for="event in events" :key="event.id" class="event-admin-card">
              <div class="ev-info">
                <h3 class="serif">{{ event.name }}</h3>
                <p class="ev-date"><span class="icon">📅</span> {{ event.date }}</p>
              </div>
              <div class="ev-stats">
                <div class="stat-pill sold">
                  <span class="count">{{ event.soldCount }}</span>
                  <span class="label">Venuts</span>
                </div>
                <div class="stat-pill reserved">
                  <span class="count">{{ event.reservedCount }}</span>
                  <span class="label">Reservats</span>
                </div>
                <div class="stat-pill available">
                  <span class="count">{{ event.availableCount }}</span>
                  <span class="label">Lliures</span>
                </div>
              </div>
              <div class="ev-actions">
                <button class="btn btn-primary btn-sm" @click="viewDetails(event.id)">
                  Monitoritzar <span class="arrow">→</span>
                </button>
              </div>
            </div>
          </div>
          <div v-if="lastError" class="debug-error fade-in">
            <span class="error-icon">🚨</span>
            <div class="error-details">
              <strong>Sisplau, revisa-ho:</strong>
              Últim error: {{ lastError }}
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  const { $socket } = useNuxtApp();
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
  const { $socket } = useNuxtApp();
  $socket.disconnect();
});

function viewDetails(id) {
  navigateTo(`/esdeveniment/${id}`);
}

async function resetAllSeats() {
  const config = useRuntimeConfig();
  const { $socket } = useNuxtApp();
  const url = `${config.public.apiBase}/api/admin/reset`;
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
.admin-dashboard {
  min-height: 100vh;
  padding: 2rem 0 4rem;
}

.header-glass {
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 3rem;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: var(--ink-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.online-pulse {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  animation: pulse-success 2s infinite;
}

@keyframes pulse-success {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
  border-color: rgba(255,255,255,0.15);
}

.stat-icon {
  font-size: 2.5rem;
  background: rgba(255,255,255,0.05);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.online-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-card h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--ink-tertiary);
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--ink-primary);
  line-height: 1;
}

.price-text {
  background: linear-gradient(135deg, var(--brand) 0%, #ff4d4d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.events-management {
  padding: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--border-soft);
  padding-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 2rem;
  margin: 0;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-admin-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
}

.event-admin-card:hover {
  background: rgba(255,255,255,0.04);
}

.ev-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
  color: var(--ink-primary);
}

.ev-date {
  color: var(--ink-tertiary);
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ev-stats {
  display: flex;
  gap: 1rem;
}

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 1px solid transparent;
}

.stat-pill .count {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-pill .label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-pill.sold {
  background: rgba(220, 38, 38, 0.1);
  color: #fca5a5;
  border-color: rgba(220, 38, 38, 0.2);
}

.stat-pill.reserved {
  background: rgba(245, 158, 11, 0.1);
  color: #fcd34d;
  border-color: rgba(245, 158, 11, 0.2);
}

.stat-pill.available {
  background: rgba(16, 185, 129, 0.1);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.2);
}

.btn-sm {
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
}
.btn-sm .arrow {
  display: inline-block;
  transition: transform 0.2s;
}
.btn-sm:hover .arrow {
  transform: translateX(4px);
}

.btn-danger {
  background: rgba(220, 38, 38, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover {
  background: #dc2626;
  color: white;
}

.debug-error {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(220, 38, 38, 0.1);
  color: #fca5a5;
  border: 1px dashed rgba(220, 38, 38, 0.4);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-top: 2rem;
}

.error-icon {
  font-size: 1.5rem;
}

.error-details strong {
  display: block;
  margin-bottom: 0.25rem;
  color: white;
}

@media (max-width: 992px) {
  .header-glass {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .event-admin-card {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
}
</style>
