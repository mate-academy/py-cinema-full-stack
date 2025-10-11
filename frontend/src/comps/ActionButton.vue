<template>
  <button
    class="action-btn"
    :class="{ loading, disabled }"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="!loading">{{ label }}</span>
    <span v-else class="spinner"></span>
  </button>
</template>

<script>
export default {
  name: 'ActionButton',
  props: {
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  }
};
</script>

<style scoped>
.action-btn {
  background: linear-gradient(90deg, #ff4040 0%, #ff6060 100%);
  border: none;
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 14px 36px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 64, 64, 0.2);
  letter-spacing: 0.5px;
}
.action-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 0 20px rgba(255, 64, 64, 0.4);
}
.action-btn:active {
  transform: scale(0.98);
}
.action-btn.disabled,
.action-btn:disabled {
  background: #2a2a2a;
  color: #777;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .action-btn {
    width: 100%;
    padding: 12px;
    font-size: 15px;
  }
}
</style>
