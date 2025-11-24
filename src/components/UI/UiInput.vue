<template>
    <div
      class="ui-input"
      :class="[
        { 'ui-input--full': fullWidth },
      ]"
    >
      <span v-if="$slots.left" class="ui-input__icon-left">
        <slot name="left" />
      </span>
  
      <input
        class="ui-input__field"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        @input="onInput"
        v-bind="$attrs"
      />
    </div>
  </template>
  
  <script setup>
  defineOptions({ inheritAttrs: false })
  
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    fullWidth: {
      type: Boolean,
      default: true,
    },
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const onInput = (event) => {
    emit('update:modelValue', event.target.value)
  }
  </script>
  
  <style scoped>
  .ui-input {
    position: relative;
    display: inline-flex;
    align-items: center;
    background: #f9fafb;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    padding: 0 14px;
    height: 40px;
  }
  
  .ui-input--full {
    width: 100%;
  }
  
  .ui-input__icon-left {
    margin-right: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 14px;
  }
  
  .ui-input__field {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: #111827;
  }
  
  .ui-input__field::placeholder {
    color: #9ca3af;
  }
  
  .ui-input__field:disabled {
    cursor: not-allowed;
    color: #9ca3af;
  }
  </style>