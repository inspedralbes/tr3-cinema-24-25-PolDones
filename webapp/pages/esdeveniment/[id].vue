<template>
  <div class="container">
    <div v-if="pending" class="loading">Carregant esdeveniment...</div>
    <div v-else-if="event" class="event-detail">
      <header class="event-header">
        <NuxtLink to="/" class="back-link">← Tornar al cartell</NuxtLink>
        <h1 class="serif">{{ event.name }}</h1>
        <div class="meta">
          <span>📅 {{ event.date }}</span>
          <span>📍 {{ event.location }}</span>
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
        <div class="selection-panel premium-card">
          <h3>La teva selecció</h3>
          <div v-if="selectedSeats.length === 0" class="no-selection">
            No has seleccionat cap seient encara.
          </div>
          <div v-else>
            <ul class="selected-list">
              <li v-for="seat in selectedSeats" :key="seat.id">
                Fila {{ seat.row }}, Seient {{ seat.col }} - <strong>{{ seat.price }}€</strong>
              </li>
            </ul>
            <div class="total">
              <span>Total:</span>
              <span class="price-val">{{ totalPrice }}€</span>
            </div>
            
            <div v-if="timer > 0" class="timer">
              La reserva expira en: <strong>{{ formatTime(timer) }}</strong>
            </div>

            <button @click="proceedToPurchase" class="btn btn-primary w-full">Continuar amb la compra</button>
          </div>

          <div v-if="errorMessage" class="error-msg">
            {{ errorMessage }}
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
const { $socket } = useNuxtApp();

const { data: event, pending: eventPending } = useFetch(`http://localhost:3001/api/events/${eventId}`, { key: `event-${eventId}` });
const { data: initialSeats, pending: seatsPending } = useFetch(`http://localhost:3001/api/events/${eventId}/seats`, { key: `seats-${eventId}` });
const pending = computed(() => eventPending.value || seatsPending.value);

const seats = ref([]);
const userId = useCookie('cinema_user_id');

// Generar userId només al client si no existeix per evitar hydration mismatch
onMounted(() => {
  if (!userId.value) {
    userId.value = Math.random().toString(36).substring(2, 11);
  }
});

const selectedSeats = computed(() => seats.value.filter(s => s.status === 'reserved' && s.user_id === userId.value));
const totalPrice = computed(() => selectedSeats.value.reduce((acc, s) => acc + s.price, 0));

const lastSelectedSeatId = ref(null);
const timer = ref(0);
const timerInterval = ref(null);
const errorMessage = ref('');

// Sincronitzar seients inicials
watch(initialSeats, (newSeats) => {
  if (newSeats) {
    seats.value = [...newSeats];
  }
}, { immediate: true });

onMounted(() => {
  $socket.emit('join_event', eventId);

  $socket.on('seats_update', (updatedSeats) => {
    seats.value = updatedSeats;
  });

  $socket.on('seat_updated', (updatedSeat) => {
    const index = seats.value.findIndex(s => s.id === updatedSeat.id);
    if (index !== -1) {
      seats.value[index] = updatedSeat;
    }
  });

  $socket.on('reservation_success', ({ seatId }) => {
    lastSelectedSeatId.value = null;
    startTimer();
  });

  $socket.on('reservation_error', ({ message }) => {
    errorMessage.value = message;
    lastSelectedSeatId.value = null;
    setTimeout(() => errorMessage.value = '', 3000);
  });
});

onUnmounted(() => {
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
  
  if (seat.status === 'reserved' && seat.user_id === userId.value) {
    $socket.emit('release_seat', { eventId, seatId: seat.id, userId: userId.value });
  } else if (seat.status === 'available') {
    if (selectedSeats.value.length >= 5) {
      errorMessage.value = "Màxim 5 seients per reserva.";
      setTimeout(() => errorMessage.value = '', 3000);
      return;
    }
    lastSelectedSeatId.value = seat.id;
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
.back-link {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: block;
}

.event-header h1 {
  font-size: 3rem;
  margin: 0.5rem 0;
}

.meta {
  color: var(--ink-tertiary);
  margin-bottom: 3rem;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.booking-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
}

.seat-map-container {
  padding: 4rem 2rem;
  background: var(--surface-low);
  overflow: hidden;
}

.seat-grid-wrapper {
  perspective: 1200px;
  padding: 0 2rem;
}

.seat-grid {
  display: grid;
  justify-content: center;
  gap: 0;
  transform: rotateX(20deg);
  transform-style: preserve-3d;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  font-size: 0.85rem;
  color: #aaa;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selection-panel h3 {
  margin-top: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.selected-list {
  list-style: none;
  padding: 0;
}

.selected-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.total {
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 1.5rem 0;
}

.price-val {
  color: var(--primary);
}

.timer {
  background: rgba(229, 9, 20, 0.1);
  color: var(--primary);
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1.5rem;
}

.w-full {
  width: 100%;
}

.error-msg {
  color: var(--sold);
  background: rgba(244, 67, 54, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

@media (max-width: 992px) {
  .booking-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .selection-panel {
    order: 2;
  }

  .seat-map-container {
    order: 1;
    padding: 2rem 1rem;
  }

  .event-header h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 600px) {
  .seat-grid-wrapper {
    padding: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 1rem;
  }

  .seat-grid {
    width: max-content;
    margin: 0 auto;
  }

  .row-label {
    position: sticky;
    left: 0;
    background: var(--surface-low);
    z-index: 2;
    margin-right: 0.5rem;
  }

  .legend {
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: flex-start;
  }
}

.loading {
  text-align: center;
  padding: 5rem;
  font-size: 1.2rem;
}
</style>
