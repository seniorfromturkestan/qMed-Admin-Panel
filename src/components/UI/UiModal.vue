<template>
    <div class="modal-backdrop" @click.self="onClose">
      <div class="modal">
        <header class="modal__header">
          <h3 class="modal__title">
            {{ title }}
          </h3>
          <button
            class="modal__close"
            type="button"
            @click="onClose"
          >
            ✕
          </button>
        </header>
  
        <div class="modal__body">
          <slot />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const emit = defineEmits(['close'])
  
  defineProps({
    title: {
      type: String,
      default: '',
    },
  })
  
  const onClose = () => {
    emit('close')
  }
  </script>
  
  <style scoped>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
  
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px); /* как ты просил */
  }
  
  .modal {
    width: 100%;
    max-width: 480px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    padding: 16px 20px 20px;
  }
  
  .modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  
  .modal__title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
  
  .modal__close {
    border: none;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
    padding: 2px 4px;
    line-height: 1;
  }
  
  .modal__body {
    font-size: 14px;
  }
  </style>