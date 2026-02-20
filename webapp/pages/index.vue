<template>
  <div class="container">
    <header class="page-header">
      <h1>Pròxims Esdeveniments</h1>
      <p>Reserva les teves entrades per als esdeveniments més exclusius.</p>
    </header>

    <div v-if="pending" class="loading">Carregant esdeveniments...</div>
    <div v-else-if="error" class="error">S'ha produït un error al carregar els esdeveniments.</div>
    <div v-else class="events-grid">
      <div v-for="event in events" :key="event.id" class="premium-card event-card">
        <div class="event-info">
          <h3>{{ event.name }}</h3>
          <p class="event-date"><span class="icon">📅</span> {{ event.date }}</p>
          <p class="event-location"><span class="icon">📍</span> {{ event.location }}</p>
          <p class="event-desc">{{ event.description }}</p>
        </div>
        <NuxtLink :to="`/esdeveniment/${event.id}`" class="btn btn-primary">Veure Entrades</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: events, pending, error } = useFetch('http://localhost:3001/api/events');
</script>

<style scoped>
.page-header {
  margin-bottom: 3rem;
  text-align: center;
}

.page-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #fff, #888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.event-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.event-info h3 {
  margin-top: 0;
  font-size: 1.5rem;
  color: var(--primary);
}

.event-date, .event-location {
  font-size: 0.9rem;
  color: #aaa;
  margin: 0.5rem 0;
}

.event-desc {
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 1rem 0;
  color: #ddd;
}

.icon {
  margin-right: 0.5rem;
}
</style>
