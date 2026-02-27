<template>
  <div class="container">
    <header class="page-header">
      <h1 class="serif">Pròxims Esdeveniments</h1>
      <p>Explora la nostra selecció d'estrenes exclusives en un entorn inigualable.</p>
    </header>

    <div v-if="pending" class="loading">Carregant esdeveniments...</div>
    <div v-else-if="error" class="error">S'ha produït un error al carregar els esdeveniments.</div>
    <div v-else class="events-grid">
      <div v-for="event in events" :key="event.id" class="premium-card event-card">
        <div class="event-image" v-if="event.image">
          <img :src="event.image" :alt="event.name" />
        </div>
        <div class="event-info">
          <h3>{{ event.name }}</h3>
          <p class="event-date">Data: {{ event.date }}</p>
          <p class="event-location">Localització: {{ event.location }}</p>
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
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: var(--ink-primary);
}

.page-header p {
  color: var(--ink-secondary);
  font-size: 1.1rem;
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
  overflow: hidden;
  padding: 0 !important;
}

.event-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.1);
}

.event-info {
  padding: 1.5rem;
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

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2.5rem;
  }

  .events-grid {
    display: flex;
    overflow-x: auto;
    padding-bottom: 2rem;
    gap: 1.5rem;
    margin: 0 -1rem; /* Negative margin to bleed to edges */
    padding-left: 1rem;
    padding-right: 1rem;
    scroll-snap-type: x mandatory;
    scrollbar-width: none; /* Hide scrollbar for cleaner look */
  }

  .events-grid::-webkit-scrollbar {
    display: none;
  }

  .event-card {
    min-width: 300px;
    flex: 0 0 300px;
    scroll-snap-align: start;
  }
}

.icon {
  margin-right: 0.5rem;
}
</style>
