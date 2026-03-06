<template>
  <div class="tickets-view fade-in">
    <div class="lookup-container">
      <header class="page-header">
        <h1 class="serif">Les meves <span class="text-gradient">entrades</span></h1>
        <p class="subtitle">Introdueix el teu correu electrònic per recuperar les teves reserves.</p>
      </header>

      <div class="lookup-card premium-card">
        <form @submit.prevent="lookupTickets" class="lookup-form">
          <div class="form-group">
            <div class="input-wrapper">
              <input 
                type="email" 
                v-model="email" 
                placeholder="El teu correu de reserva..." 
                required 
                class="form-input"
              />
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-full btn-lg" :disabled="loading">
            {{ loading ? 'Buscant...' : 'Consultar Entrades' }}
          </button>
        </form>

        <div v-if="tickets.length > 0" class="tickets-result fade-in">
          <h3 class="result-title serif">Entrades Localitzades</h3>
          <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card premium-card">
            <div class="ticket-info">
              <h4 class="serif">{{ ticket.event_name }}</h4>
              <div class="ticket-details">
                <span class="seat-badge">Fila {{ ticket.row }}, Butaca {{ ticket.col }}</span>
                <span class="date">{{ ticket.date }}</span>
              </div>
            </div>
            <div class="ticket-status">ACTIVA</div>
          </div>
        </div>
        <div v-else-if="searched && !loading" class="no-results fade-in premium-card">
          <div class="empty-icon">📂</div>
          <p>No hem trobat cap reserva associada aplicant aquest correu electrònic.</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
const email = ref('');
const loading = ref(false);
const tickets = ref([]);
const searched = ref(false);

async function lookupTickets() {
  const config = useRuntimeConfig();
  loading.value = true;
  searched.value = true;
  try {
    const data = await $fetch(`${config.public.apiBase}/api/tickets?email=${email.value}`);
    tickets.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.tickets-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.lookup-container {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.subtitle {
  color: var(--ink-secondary);
  font-size: 1.15rem;
}

.lookup-card {
  padding: 3rem;
  border-radius: var(--radius-lg);
}

.lookup-form {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  background: var(--surface-low);
  border: 1px solid var(--border-medium);
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  color: var(--ink-primary);
  font-size: 1.1rem;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
  text-align: center;
}

.form-input:focus {
  border-color: var(--brand);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 4px var(--brand-glow);
}

.form-input::placeholder {
  color: var(--ink-tertiary);
  opacity: 0.6;
}

.w-full {
  width: 100%;
}

.btn-lg {
  padding: 1rem;
  font-size: 1.15rem;
}

.tickets-result {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--border-medium);
}

.result-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--ink-secondary);
  font-size: 1.4rem;
}

.ticket-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: rgba(255,255,255,0.03);
  border-left: 4px solid var(--brand);
  border-radius: var(--radius-md);
  transition: transform 0.2s ease;
}

.ticket-card:hover {
  transform: translateX(5px);
  background: rgba(255,255,255,0.05);
}

.ticket-info h4 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
  color: var(--ink-primary);
}

.ticket-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.seat-badge {
  background: rgba(255,255,255,0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink-primary);
}

.date {
  font-size: 0.85rem;
  color: var(--ink-tertiary);
}

.ticket-status {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 1px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.no-results {
  margin-top: 2rem;
  text-align: center;
  background: rgba(255,255,255,0.02);
  padding: 3rem 1.5rem;
  color: var(--ink-tertiary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .lookup-card {
    padding: 1.5rem;
  }
  
  .page-header h1 {
    font-size: 2.2rem;
  }
  
  .ticket-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
