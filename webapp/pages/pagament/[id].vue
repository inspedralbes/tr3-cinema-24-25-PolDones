<template>
  <div class="payment-page fade-in">
    <div v-if="!event" class="loading-container">
      <div class="loader"></div>
      <p>Carregant informació de la reserva...</p>
    </div>
    
    <div v-else-if="event" class="container">
      <header class="page-header">
        <h1 class="serif">Finalitza la teva <span class="text-gradient">reserva</span></h1>
        <p class="subtitle">Estàs a un pas de confirmar les teves butaques per a {{ event.name }}.</p>
      </header>

      <div class="payment-layout">
        <div class="summary-section premium-card fade-in">
          <h3 class="serif section-title">Dades de contacte</h3>
          <form @submit.prevent="confirmPurchase" class="payment-form">
            <div class="form-group">
              <label for="name">Nom complet</label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="name" 
                  v-model="name" 
                  placeholder="Ex: Maria Garcia" 
                  required 
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">Correu electrònic</label>
              <div class="input-wrapper">
                <input 
                  type="email" 
                  id="email" 
                  v-model="email" 
                  placeholder="A on enviem les entrades?" 
                  required 
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="summary-box glass-panel">
              <div class="summary-row">
                <span>Esdeveniment:</span>
                <strong>{{ event?.name }}</strong>
              </div>
              <div class="summary-row">
                <span>Butaques:</span>
                <strong>{{ selectedSeatsCount }}</strong>
              </div>
              <div class="divider"></div>
              <div class="final-total">
                <span>Total a pagar:</span>
                <span class="price">{{ totalAmount }}€</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full btn-lg" :disabled="loading">
              {{ loading ? 'Processant...' : 'Confirmar Pagament' }}
            </button>
          </form>
        </div>

        <div class="payment-visual fade-in" style="animation-delay: 0.2s">
          <div class="ticket-preview premium-card">
            <div class="ticket-header">
              <span class="ticket-label">ENTRADA DIGITAL</span>
              <h4 class="ticket-movie serif">{{ event?.name }}</h4>
            </div>
            <div class="ticket-tear"></div>
            <div class="ticket-body">
              <div class="ticket-info-grid">
                <div class="info-block">
                  <span class="label">DATA</span>
                  <span class="value">{{ event?.date }}</span>
                </div>
                <div class="info-block">
                  <span class="label">SALA</span>
                  <span class="value">{{ event?.location }}</span>
                </div>
              </div>
              <div class="qr-wrapper">
                <div class="qr-placeholder">
                  <div class="qr-pattern"></div>
                  <span>QR Codi</span>
                </div>
              </div>
              <div class="ticket-footer">
                Presenta aquest codi als accessos
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="success" class="success-overlay">
        <div class="success-content premium-card">
          <h2>Compra Finalitzada!</h2>
          <p>Gràcies <strong>{{ name }}</strong>. Hem enviat les entrades a <strong>{{ email }}</strong>.</p>
          <NuxtLink to="/" class="btn btn-primary">Tornar a l'Inici</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core';

const route = useRoute();
const eventId = route.params.id;

const email = ref('');
const name = ref('');
const loading = ref(false);
const success = ref(false);

const config = useRuntimeConfig();
const baseURL = process.server ? config.apiBase : config.public.apiBase;
const userId = useCookie('cinema_user_id', { default: () => Math.random().toString(36).substring(2, 11) });
const { data: event } = await useFetch(`/api/events/${eventId}`, { baseURL });
const { data: seatsData } = await useFetch(`/api/events/${eventId}/seats`, { baseURL });

const reservedSeats = ref([]);

// Sincronitzar seients inicials i quan canvien les dades del fetch
watch([seatsData, userId], ([newSeats, newUserId]) => {
  if (newSeats && newUserId) {
    reservedSeats.value = newSeats.filter(s => s.status === 'reserved' && s.user_id === newUserId);
  }
}, { immediate: true });

onMounted(() => {
  const { $socket } = useNuxtApp();
  // Registrar listeners per a actualitzacions en temps real
  $socket.on('seats_update', (allSeats) => {
    reservedSeats.value = allSeats.filter(s => s.status === 'reserved' && s.user_id === userId.value);
    
    if (reservedSeats.value.length === 0 && !success.value && !loading.value) {
      navigateTo(`/esdeveniment/${eventId}`);
    }
  });

  $socket.on('purchase_success', () => {
    loading.value = false;
    success.value = true;
  });

  $socket.on('purchase_error', ({ message }) => {
    loading.value = false;
    alert(message);
  });

  // Unir-se a la sala per rebre actualitzacions posteriors
  $socket.emit('join_event', eventId);
});

onUnmounted(() => {
  const { $socket } = useNuxtApp();
  $socket.off('seats_update');
  $socket.off('purchase_success');
  $socket.off('purchase_error');
});

const selectedSeatsCount = computed(() => reservedSeats.value.length);
const totalAmount = computed(() => reservedSeats.value.reduce((acc, s) => acc + s.price, 0));

function confirmPurchase() {
  const { $socket } = useNuxtApp();
  loading.value = true;
  $socket.emit('confirm_purchase', {
    eventId,
    userId: userId.value,
    email: email.value,
    name: name.value
  });
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 1rem;
}

.page-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--ink-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.payment-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 4rem;
  align-items: start;
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-soft);
  padding-bottom: 1rem;
  font-size: 1.6rem;
}

@media (max-width: 992px) {
  .payment-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .summary-section {
    order: 1;
  }

  .form-section {
    order: 2;
  }
}

@media (max-width: 600px) {
  .payment-form {
    gap: 1rem;
  }

  .btn-primary {
    width: 100%;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ink-secondary);
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  background: var(--surface-low);
  border: 1px solid var(--border-medium);
  padding: 0.875rem 1rem;
  border-radius: var(--radius-md);
  color: var(--ink-primary);
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--brand);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 3px var(--brand-glow);
}

.form-input::placeholder {
  color: var(--ink-tertiary);
  opacity: 0.6;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-soft);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin: 2rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: var(--ink-secondary);
}

.summary-row strong {
  color: var(--ink-primary);
}

.divider {
  height: 1px;
  background: var(--border-medium);
  margin: 1rem 0;
}

.final-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.price {
  font-size: 2rem;
  background: linear-gradient(135deg, var(--brand) 0%, #ff4d4d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.payment-visual {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: sticky;
  top: 100px;
}

.ticket-preview {
  width: 100%;
  max-width: 320px;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-medium);
}

.ticket-header {
  background: linear-gradient(135deg, var(--surface) 0%, var(--surface-low) 100%);
  padding: 2rem 1.5rem;
  text-align: center;
  border-bottom: 2px dashed var(--border-medium);
  position: relative;
}

.ticket-label {
  font-size: 0.75rem;
  letter-spacing: 2px;
  color: var(--brand);
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: block;
}

.ticket-movie {
  font-size: 1.5rem;
  margin: 0;
  line-height: 1.2;
}

.ticket-tear {
  height: 20px;
  width: 100%;
  position: absolute;
  top: -10px;
  left: 0;
  display: flex;
}
.ticket-tear::before, .ticket-tear::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--canvas);
  border-radius: 50%;
  top: 0;
}
.ticket-tear::before { left: -10px; border-right: 1px solid var(--border-medium); }
.ticket-tear::after { right: -10px; border-left: 1px solid var(--border-medium); }


.ticket-body {
  padding: 2rem 1.5rem;
  background: rgba(255,255,255,0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ticket-info-grid {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.info-block {
  display: flex;
  flex-direction: column;
}

.info-block .label {
  font-size: 0.7rem;
  color: var(--ink-tertiary);
  margin-bottom: 0.25rem;
}

.info-block .value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink-primary);
}

.qr-wrapper {
  background: white;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.qr-placeholder {
  width: 140px;
  height: 140px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-muted);
  font-weight: bold;
  font-family: monospace;
  position: relative;
}

.qr-pattern {
  position: absolute;
  top: 10px; left: 10px; right: 10px; bottom: 10px;
  background-image: linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1),
  linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1);
  background-size: 10px 10px;
  background-position: 0 0, 5px 5px;
  opacity: 0.3;
}

.ticket-footer {
  font-size: 0.75rem;
  color: var(--ink-tertiary);
  text-align: center;
}

.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.success-content {
  text-align: center;
  max-width: 500px;
  padding: 3rem;
  animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.success-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--success);
}

.success-content p {
  color: var(--ink-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}
.w-full {
  width: 100%;
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
