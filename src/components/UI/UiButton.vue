<template>
    <button
      :type="type"
      class="ui-btn"
      :class="[
        `ui-btn--${variant}`,
        { 'ui-btn--full': fullWidth },
      ]"
      v-bind="$attrs"
    >
      <slot />
    </button>
  </template>
  
  <script setup>
  defineProps({
    variant: {
      type: String,
      default: 'primary', 
    },
    type: {
      type: String,
      default: 'button',
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: null,
    },
  })
  </script>
  
  <style scoped>
  .ui-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    padding: 0 20px;
    height: 40px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      box-shadow 0.15s ease,
      transform 0.05s ease;
    white-space: nowrap;
  }
  
  /* Primary — синий как на макете */
  .ui-btn--primary {
    background: #2563eb;
    color: #ffffff;
    box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35);
  }
  
  .ui-btn--primary:hover {
    background: #1d4ed8;
  }
  
  /* Secondary — белый/серый */
  .ui-btn--secondary {
    background: #ffffff;
    color: #111827;
    border: 1px solid #e5e7eb;
  }
  
  .ui-btn--secondary:hover {
    background: #f3f4f6;
  }
  
  /* Ghost — прозрачная */
  .ui-btn--ghost {
    background: transparent;
    color: #111827;
  }
  
  .ui-btn--full {
    width: 100%;
  }
  </style>