<template>
  <div class="container">
    <div class="payment-container premium-card">
      <header class="payment-header">
        <h1>Finalitzar Compra</h1>
        <p>Estàs a un pas d'aconseguir les teves entrades.</p>
      </header>

      <div class="payment-grid">
        <div class="user-info">
          <h3>Dades personals</h3>
          <form @submit.prevent="confirmPurchase" class="payment-form">
            <div class="form-group">
              <label for="email">Correu electrònic</label>
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                placeholder="exemple@correu.com" 
                required 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="name">Nom complet</label>
              <input 
                type="text" 
                id="name" 
                v-model="name" 
                placeholder="El teu nom" 
                required 
                class="form-input"
              />
            </div>
            
            <div class="summary-box">
              <p>Esdeveniment: <strong>{{ event?.name }}</strong></p>
              <p>Seients: <strong>{{ selectedSeatsCount }}</strong></p>
              <div class="final-total">
                <span>Total a pagar:</span>
                <span class="price">{{ totalAmount }}€</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full" :disabled="loading">
              {{ loading ? 'Processant...' : 'Confirmar Pagament' }}
            </button>
          </form>
        </div>

        <div class="payment-visual">
          <div class="ticket-preview">
            <div class="ticket-header">TICKET DIGITAL</div>
            <div class="ticket-body">
              <div class="qr-placeholder">QR</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="success" class="success-overlay">
        <div class="success-content premium-card">
          <h2>✅ Compra Finalitzada!</h2>
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
const { $socket } = useNuxtApp();

const email = ref('');
const name = ref('');
const loading = ref(false);
const success = ref(false);

const userId = useLocalStorage('cinema_user_id', '');
const { data: event } = useFetch(`http://localhost:3001/api/events/${eventId}`);
const { data: seatsData } = useFetch(`http://localhost:3001/api/events/${eventId}/seats`); // Necessitem un endpoint per seients o usar el socket

// Per simplificar, demanarem els seients que l'usuari té reservats al servidor via socket
const reservedSeats = ref([]);

onMounted(() => {
  $socket.connect();
  $socket.emit('join_event', eventId);
  
  $socket.on('seats_update', (allSeats) => {
    reservedSeats.value = allSeats.filter(s => s.status === 'reserved' && s.user_id === userId.value);
    if (reservedSeats.value.length === 0 && !success.value) {
      // Si no hi ha seients reservats, tornar enrere
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
});

const selectedSeatsCount = computed(() => reservedSeats.value.length);
const totalAmount = computed(() => reservedSeats.value.reduce((acc, s) => acc + s.price, 0));

function confirmPurchase() {
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
.payment-container {
  margin-top: 2rem;
}

.payment-header {
  text-align: center;
  margin-bottom: 3rem;
}

.payment-header h1 {
  color: var(--primary);
  font-size: 2.5rem;
}

.payment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  color: white;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--primary);
}

.summary-box {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 2rem 0;
}

.final-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dotted rgba(255, 255, 255, 0.2);
}

.price {
  color: var(--primary);
}

.payment-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ticket-preview {
  width: 300px;
  height: 450px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  color: black;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
}

.ticket-header {
  background: var(--primary);
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: 900;
  letter-spacing: 2px;
}

.ticket-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.qr-placeholder {
  width: 150px;
  height: 150px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #000;
  font-weight: bold;
}

.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.success-content {
  text-align: center;
  max-width: 500px;
  padding: 3rem;
}

.success-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}
</style>
