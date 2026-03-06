<template>
  <div class="event-page fade-in">
    <div v-if="pending" class="loading-container">
      <div class="loader"></div>
      <p>Carregant seients...</p>
    </div>
    
    <div v-else-if="event" class="container">
      <header class="event-header">
        <NuxtLink to="/" class="back-link">
          <span class="icon">←</span> Tornar a la cartellera
        </NuxtLink>
        <h1 class="serif">{{ event.name }}</h1>
        <div class="event-meta">
          <span class="badge">{{ event.date }}</span>
          <span class="badge outline">{{ event.location }}</span>
        </div>
      </header>

      <div class="booking-layout">
        <!-- Seat Map -->
        <div class="seat-map-container premium-card elevation-2">
          <div class="screen-wrapper">
             <div class="screen">PANTALLA</div>
          </div>
          
          <div class="seat-grid-wrapper">
            <div class="seat-grid" :style="{ gridTemplateColumns: `auto repeat(${event.cols}, min-content)` }">
              <template v-for="r in event.rows" :key="`row-${r}`">
                <!-- Row Indicator -->
                <div class="row-label">{{ r }}</div>
                
                <!-- Seats for this row -->
                <div 
                  v-for="seat in getSeatsByRow(r)" 
                  :key="seat.id" 
                  class="seat"
                  :class="[getSeatStatusClass(seat), { reserving: seat.id === lastSelectedSeatId }]"
                  @click="toggleSeat(seat)"
                  :title="`Fila ${seat.row}, Seient ${seat.col} - ${seat.price}€`"
                >
                  {{ seat.col }}
                </div>
              </template>
            </div>
          </div>

          <div class="legend">
            <div class="legend-item"><span class="seat available"></span> Disponible</div>
            <div class="legend-item"><span class="seat selected"></span> Seleccionat</div>
            <div class="legend-item"><span class="seat reserved"></span> Reservat</div>
            <div class="legend-item"><span class="seat sold"></span> Venut</div>
          </div>
        </div>

        <!-- Selection Panel -->
        <div class="selection-panel-wrapper">
          <div class="selection-panel premium-card sticky-panel">
            <h3 class="serif">La teva <span class="text-gradient">reserva</span></h3>
            
            <div v-if="selectedSeats.length === 0" class="no-selection">
              <div class="empty-state-icon">🎟️</div>
              <p>Selecciona les teves butaques al mapa de l'esquerra.</p>
            </div>
            
            <div v-else class="selection-content fade-in">
              <ul class="selected-list">
                <li v-for="seat in selectedSeats" :key="seat.id">
                  <div class="seat-info">
                    <span class="seat-pos">Fila {{ seat.row }}, Butaca {{ seat.col }}</span>
                    <strong class="seat-price">{{ seat.price }}€</strong>
                  </div>
                </li>
              </ul>
              
              <div class="total-bar">
                <span>Total de la reserva</span>
                <span class="price-val">{{ totalPrice }}€</span>
              </div>
              
              <div v-if="timer > 0" class="timer-box">
                <span class="timer-pulse"></span>
                La reserva expira en: <strong>{{ formatTime(timer) }}</strong>
              </div>

              <button @click="proceedToPurchase" class="btn btn-primary w-full btn-checkout">
                Continuar al pagament
                <span class="arrow">→</span>
              </button>
            </div>

            <div v-if="errorMessage" class="error-msg fade-in">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core';

const route = useRoute();
const eventId = route.params.id;
const config = useRuntimeConfig();
const baseURL = process.server ? config.apiBase : config.public.apiBase;
const { data: event, pending: eventPending } = await useFetch(`/api/events/${eventId}`, { baseURL, key: `event-${eventId}` });
const { data: initialSeats, pending: seatsPending } = await useFetch(`/api/events/${eventId}/seats`, { baseURL, key: `seats-${eventId}` });
const pending = computed(() => eventPending.value || seatsPending.value);

const seats = ref([]);
const userId = useCookie('cinema_user_id');

// Inicialització robusta del userId
if (process.client && !userId.value) {
  userId.value = Math.random().toString(36).substring(2, 11);
  console.log('🆔 Nou userId generat en setup:', userId.value);
}

const selectedSeats = computed(() => seats.value.filter(s => s.status === 'reserved' && s.user_id === userId.value));
const totalPrice = computed(() => selectedSeats.value.reduce((acc, s) => acc + s.price, 0));

const lastSelectedSeatId = ref(null);
const timer = ref(0);
const timerInterval = ref(null);
const errorMessage = ref('');

// Sincronitzar seients inicials
watch(initialSeats, (newSeats) => {
  if (newSeats) {
    console.log('Seients inicials carregats via API:', newSeats.length);
    seats.value = [...newSeats];
  }
}, { immediate: true });

onMounted(() => {
  const { $socket } = useNuxtApp();
  console.log('Muntant component esdeveniment. Connection Status:', $socket.connected);
  
  if (!$socket.connected) {
    $socket.connect();
  }

  $socket.emit('join_event', eventId);
  console.log('Emès join_event per:', eventId);

  $socket.on('seats_update', (updatedSeats) => {
    console.log('Rebut seats_update:', updatedSeats.length);
    seats.value = updatedSeats;
  });

  $socket.on('seat_updated', (updatedSeat) => {
    console.log('Rebut seat_updated:', updatedSeat.id, updatedSeat.status);
    const index = seats.value.findIndex(s => s.id === updatedSeat.id);
    if (index !== -1) {
      seats.value[index] = updatedSeat;
    }
  });

  $socket.on('reservation_success', ({ seatId }) => {
    console.log('Reserva confirmada pel servidor:', seatId);
    lastSelectedSeatId.value = null;
    startTimer();
  });

  $socket.on('reservation_error', ({ message }) => {
    console.error('Error de reserva:', message);
    errorMessage.value = message;
    lastSelectedSeatId.value = null;
    setTimeout(() => errorMessage.value = '', 3000);
  });
});

onUnmounted(() => {
  const { $socket } = useNuxtApp();
  $socket.off('seats_update');
  $socket.off('seat_updated');
  $socket.off('reservation_success');
  $socket.off('reservation_error');
  clearInterval(timerInterval.value);
});

function getSeatStatusClass(seat) {
  if (seat.status === 'sold') return 'sold';
  if (seat.status === 'reserved') {
    return seat.user_id === userId.value ? 'selected' : 'reserved';
  }
  return 'available';
}

function toggleSeat(seat) {
  if (seat.status === 'sold') return;
  const { $socket } = useNuxtApp();
  
  if (seat.status === 'reserved' && seat.user_id === userId.value) {
    $socket.emit('release_seat', { eventId, seatId: seat.id, userId: userId.value });
  } else if (seat.status === 'available') {
    if (selectedSeats.value.length >= 5) {
      errorMessage.value = "Màxim 5 seients per reserva.";
      setTimeout(() => errorMessage.value = '', 3000);
      return;
    }
    lastSelectedSeatId.value = seat.id;
    console.log('Enviant reserve_seat...', { eventId, seatId: seat.id, userId: userId.value });
    if (!$socket.connected) {
      console.warn('Socket desconnectat. Intentant reconnectar...');
      $socket.connect();
    }
    $socket.emit('reserve_seat', { eventId, seatId: seat.id, userId: userId.value });
  }
}

function startTimer() {
  if (timerInterval.value) return;
  timer.value = 300; // 5 minuts
  timerInterval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getSeatsByRow(rowNum) {
  return seats.value.filter(s => s.row === rowNum).sort((a, b) => a.col - b.col);
}

function proceedToPurchase() {
  // Passar a la pàgina de pagament (encara per crear)
  navigateTo(`/pagament/${eventId}`);
}
</script>

<style scoped>
.event-page {
  min-height: 100vh;
  padding-top: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ink-tertiary);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease, transform 0.2s ease;
}

.back-link:hover {
  color: var(--ink-primary);
  transform: translateX(-4px);
}

.event-header {
  margin-bottom: 3rem;
  text-align: center;
}

.event-header h1 {
  font-size: 3.5rem;
  margin: 0 0 1rem;
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.event-meta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.badge {
  background: var(--surface-high);
  color: var(--ink-primary);
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--border-soft);
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.badge.outline {
  background: transparent;
  color: var(--ink-secondary);
}

.booking-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2.5rem;
  align-items: start;
}

.seat-map-container {
  padding: 4rem 2rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.seat-grid-wrapper {
  perspective: 1200px;
  padding: 2rem 1rem 5rem;
  width: 100%;
  max-width: 800px;
  /* Cinematic screen glow reflection on the floor */
  background: radial-gradient(ellipse at top, rgba(255, 253, 240, 0.05) 0%, transparent 75%);
}

.seat-grid {
  display: grid;
  justify-content: center;
  gap: 0;
  transform: rotateX(20deg);
  transform-style: preserve-3d;
  margin: 0 auto;
}

.legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-soft);
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--ink-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}
.legend-item .seat {
  margin: 0;
  transform: scale(0.85) translateZ(0);
}

/* Panel Styles */
.selection-panel-wrapper {
  position: relative;
  height: 100%;
}

.sticky-panel {
  position: sticky;
  top: 100px;
}

.selection-panel h3 {
  margin: 0 0 1.5rem;
  font-size: 1.8rem;
}

.no-selection {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--ink-tertiary);
  background: rgba(0,0,0,0.2);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-medium);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.selected-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
}

.selected-list li {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
  border-left: 3px solid var(--brand);
}

.seat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seat-pos {
  font-weight: 500;
  color: var(--ink-primary);
}

.seat-price {
  color: var(--ink-secondary);
}

.total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  margin: 1.5rem 0;
  border-top: 1px solid var(--border-medium);
  border-bottom: 1px solid var(--border-medium);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.price-val {
  font-size: 1.75rem;
  background: linear-gradient(135deg, var(--brand) 0%, #ff4d4d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.timer-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(245, 158, 11, 0.2);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.timer-pulse {
  width: 8px;
  height: 8px;
  background: var(--warning);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

.btn-checkout {
  justify-content: space-between;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.btn-checkout .arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-checkout:hover .arrow {
  transform: translateX(4px);
}

.w-full {
  width: 100%;
}

.error-msg {
  color: #fca5a5;
  background: rgba(220, 38, 38, 0.15);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(220, 38, 38, 0.3);
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
}

@media (max-width: 992px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }

  .sticky-panel {
    position: static;
  }

  .event-header h1 {
    font-size: 2.5rem;
  }
}

@media (max-width: 600px) {
  .seat-grid-wrapper {
    padding: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2rem;
  }

  .seat-grid {
    width: max-content;
  }

  .row-label {
    position: sticky;
    left: 0;
    background: var(--surface);
    backdrop-filter: blur(10px);
    z-index: 2;
    margin-right: 0.5rem;
    padding: 0 0.5rem;
    border-radius: 4px;
  }
  
  .legend {
    justify-content: flex-start;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loader {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(225, 29, 72, 0.3);
  border-radius: 50%;
  border-bottom-color: var(--brand);
  animation: rotation 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
