<template>
  <div class="home-view fade-in">
    <div v-if="pending" class="loading-container">
      <div class="loader"></div>
      <p>Carregant cartellera...</p>
    </div>
    
    <div v-else-if="error" class="error-container premium-card">
      <h2>S'ha produït un error</h2>
      <p>No hem pogut carregar els esdeveniments. Torna-ho a provar més tard.</p>
    </div>
    
    <div v-else-if="events && events.length > 0" class="content">
      <!-- Today's Pick Hero Section -->
      <section class="hero-section" :style="{ backgroundImage: `url(${featuredEvent.image})` }">
        <div class="hero-overlay"></div>
        <div class="container hero-content">
          <div class="hero-badge">Estrena Destacada</div>
          <h1 class="serif">{{ featuredEvent.name }}</h1>
          <div class="hero-meta">
            <span>{{ featuredEvent.date }}</span>
            <span class="dot">·</span>
            <span>{{ featuredEvent.location }}</span>
          </div>
          <p class="hero-desc">{{ featuredEvent.description }}</p>
          <div class="hero-actions">
            <NuxtLink :to="`/esdeveniment/${featuredEvent.id}`" class="btn btn-primary btn-lg">
              Comprar Entrades
            </NuxtLink>
            <button class="btn btn-outline btn-icon" title="Veure Tràiler">
              ▶
            </button>
          </div>
        </div>
      </section>

      <!-- All Movies Grid -->
      <section class="container grid-section">
        <header class="section-header">
          <h2 class="serif">Tota la <span class="text-gradient">Cartellera</span></h2>
          <div class="divider"></div>
        </header>

        <div class="events-grid">
          <div v-for="movie in groupedMovies" :key="movie.name" class="premium-card event-card">
            <div class="event-image" v-if="movie.image">
              <img :src="movie.image" :alt="movie.name" loading="lazy" />
              <div class="image-overlay">
                <span class="theater-badge">{{ movie.location }}</span>
              </div>
            </div>
            <div class="event-info">
              <h3 class="serif">{{ movie.name }}</h3>
              <p class="event-desc">{{ movie.description }}</p>
              
              <div class="sessions-container">
                <div v-for="dayGroup in movie.groupedSessions" :key="dayGroup.day" class="session-day">
                  <span class="day-label">{{ dayGroup.dayLabel }}</span>
                  <div class="session-times">
                    <NuxtLink 
                      v-for="session in dayGroup.times" 
                      :key="session.id" 
                      :to="`/esdeveniment/${session.id}`" 
                      class="time-btn"
                    >
                      {{ session.time }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const config = useRuntimeConfig();
const baseURL = process.server ? config.apiBase : config.public.apiBase;
const { data: events, pending, error } = await useFetch('/api/events', { baseURL });

// Helper per formatejar dates ("YYYY-MM-DD HH:mm")
function getDayParts(dateStr) {
  const parts = dateStr.split(' ');
  return { date: parts[0], time: parts[1] };
}

function formatDateLabel(dateString) {
  const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const dateObj = new Date(dateString);
  // Ens assegurem que sigui vàlida
  if(isNaN(dateObj)) return dateString;
  return dateObj.toLocaleDateString('ca-ES', dateOptions);
}

// Agrupem per pel·lícula
const groupedMovies = computed(() => {
  if (!events.value) return [];
  const groups = {};
  
  events.value.forEach(event => {
    if (!groups[event.name]) {
      groups[event.name] = {
        name: event.name,
        description: event.description,
        image: event.image,
        location: event.location, // Assumim mateixa sala per la peli
        sessions: []
      };
    }
    
    const { date, time } = getDayParts(event.date);
    groups[event.name].sessions.push({
      id: event.id,
      fullDate: event.date,
      day: date,
      time: time
    });
  });

  return Object.values(groups).map(movie => {
    // Ordenem totes les sessions per data/hora
    movie.sessions.sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    
    // Sub-agrupem per dia
    const dayGroups = {};
    movie.sessions.forEach(session => {
      if (!dayGroups[session.day]) {
        dayGroups[session.day] = {
          day: session.day,
          dayLabel: formatDateLabel(session.day),
          times: []
        };
      }
      dayGroups[session.day].times.push(session);
    });
    
    movie.groupedSessions = Object.values(dayGroups);
    return movie;
  });
});

// Determine the featured "Today's Pick" movie
const featuredEvent = computed(() => {
  if (groupedMovies.value && groupedMovies.value.length > 0) {
    const movie = groupedMovies.value[0];
    const nextSession = movie.sessions[0];
    return { 
      ...movie, 
      id: nextSession?.id || 1, 
      date: nextSession ? `${formatDateLabel(nextSession.day)} a les ${nextSession.time}` : '' 
    };
  }
  return null;
});
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  padding-bottom: 4rem;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 80vh;
  min-height: 600px;
  background-size: cover;
  background-position: center;
  background-attachment: scroll; /* Performance over fixed */
  display: flex;
  align-items: flex-end;
  margin-top: -80px; /* Bleed under transparent navbar */
  padding-bottom: 6rem;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(0deg, var(--canvas) 0%, rgba(9,9,11,0.8) 50%, rgba(9,9,11,0.4) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  animation: heroSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes heroSlideUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

.hero-badge {
  display: inline-block;
  background: rgba(225, 29, 72, 0.2);
  border: 1px solid rgba(225, 29, 72, 0.4);
  color: #fb7185;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
}

.hero-content h1 {
  font-size: 5rem;
  margin: 0 0 1rem;
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(0,0,0,0.8);
}

.hero-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink-secondary);
  margin-bottom: 1.5rem;
}

.hero-meta .dot {
  color: var(--brand);
}

.hero-desc {
  font-size: 1.15rem;
  color: var(--ink-secondary);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-lg {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

.btn-icon {
  width: 54px;
  padding: 0;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
}

/* Event Grid Section */
.grid-section {
  padding-top: 2rem;
}

.section-header {
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.section-header h2 {
  font-size: 2.5rem;
  margin: 0;
  white-space: nowrap;
}

.divider {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border-medium) 0%, transparent 100%);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
}

.event-card {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  background: var(--surface-low);
  border: 1px solid var(--border-soft);
  overflow: hidden;
  position: relative;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  z-index: 10;
}

.event-card:hover::before {
  transform: translateX(100%);
}

.event-image {
  width: 100%;
  padding-top: 140%; /* Cinematic poster aspect ratio */
  position: relative;
  overflow: hidden;
}

.event-image img {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s ease;
}

.image-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.08);
}

.event-card:hover .image-overlay {
  opacity: 1;
}

.event-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: linear-gradient(180deg, var(--surface-low) 0%, rgba(9,9,11,0.95) 100%);
}

.theater-badge {
  background: rgba(255,255,255,0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
}

.event-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
  color: var(--ink-primary);
  line-height: 1.2;
}

.event-desc {
  font-size: 0.9rem;
  color: var(--ink-secondary);
  line-height: 1.6;
  margin: 0 0 1.5rem;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sessions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: auto;
}

.session-day {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-label {
  font-size: 0.8rem;
  color: var(--ink-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  border-bottom: 1px dashed var(--border-soft);
  padding-bottom: 0.25rem;
}

.session-times {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.time-btn {
  background: rgba(255,255,255,0.05);
  color: var(--ink-primary);
  border: 1px solid var(--border-medium);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.time-btn:hover {
  background: var(--brand);
  border-color: var(--brand);
  color: white;
  transform: translateY(-2px);
}



.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.loader {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(225, 29, 72, 0.3);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  margin-bottom: 1.5rem;
}
.loader::after {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-bottom-color: var(--brand);
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 3rem;
  }
  
  .hero-section {
    min-height: 500px;
    padding-bottom: 4rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }
}
</style>
