<template>
  <div class="container">
    <div class="lookup-container premium-card">
      <header class="page-header">
        <h1 class="serif">Les meves entrades</h1>
        <p>Introdueix el teu correu electrònic per recuperar les teves entrades.</p>
      </header>

      <form @submit.prevent="lookupTickets" class="lookup-form">
        <div class="form-group">
          <input 
            type="email" 
            v-model="email" 
            placeholder="el-teu@correu.com" 
            required 
            class="form-input"
          />
        </div>
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Buscant...' : 'Consultar Entrades' }}
        </button>
      </form>

      <div v-if="tickets.length > 0" class="tickets-result">
        <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card premium-card">
          <div class="ticket-info">
            <h3>{{ ticket.event_name }}</h3>
            <p>Fila {{ ticket.row }}, Seient {{ ticket.col }}</p>
            <p class="date">{{ ticket.date }}</p>
          </div>
          <div class="ticket-status">ACTIVA</div>
        </div>
      </div>
      <div v-else-if="searched && !loading" class="no-results">
        No hem trobat entrades per aquest correu electrònic.
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
  loading.value = true;
  searched.value = true;
  try {
    const data = await $fetch(`http://localhost:3001/api/tickets?email=${email.value}`);
    tickets.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.lookup-container {
  max-width: 600px;
  margin: 4rem auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.lookup-card {
  max-width: 500px;
  margin: 0 auto 3rem;
  padding: 3rem;
}

.lookup-form {
  margin-bottom: 3rem;
}

.tickets-result {
  display: grid;
  gap: 1rem;
}

.ticket-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid var(--primary);
}

.ticket-info h3 {
  margin: 0;
  color: var(--primary);
}

.ticket-info .date {
  font-size: 0.8rem;
  color: #888;
}

.ticket-status {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.no-results {
  text-align: center;
  color: #888;
}
</style>
