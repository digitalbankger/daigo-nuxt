<template>
  <div v-if="show" class="payment-warning">
    <div class="warning-content">
      <div class="warning-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z" stroke="#d27a36" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="warning-text">
        <p>Рекомендуем отключить VPN перед оплатой для корректной обработки платежа.</p>
      </div>
      <!-- <button v-if="dismissible" @click="dismiss" class="close-btn" aria-label="Закрыть">
        &times;
      </button> -->
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  dismissible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['dismiss']);

const dismiss = () => {
  emit('dismiss');
};
</script>

<style scoped>
.payment-warning {
  background: linear-gradient(135deg, #fff5cf 0%, #ffeb9d 100%);
  border: 1px solid #FBBF24;
  border-radius: 12px;
  padding: 10px;
  padding-right: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.warning-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}

.warning-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-text h3 {
  margin: 0 0 4px 0;
  color: #92400E;
  font-weight: 600;
  font-size: 14px;
}

.warning-text p {
  margin: 0;
  color: #B45309;
  font-size: 12px;
  line-height: 1.4;
}

.close-btn {
  position: absolute;
  top: -6px;
  right: -16px;
  background: #FBBF24;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 18px;
  color: #B45309;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #F59E0B;
}
</style>