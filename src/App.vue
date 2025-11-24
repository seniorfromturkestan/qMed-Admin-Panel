<template>
  <div class="app">
    <div class="app__container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// Здесь при необходимости можно добавить:
// - provide/inject для глобальных сервисов
// - инициализацию i18n
// - глобальный трекинг и т.д.
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}
* {
  font-family: 'Montserrat', sans-serif;
  font-style: normal;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

button {
  cursor: pointer;
}

.app {
  min-height: 100vh;
}

.app__container {
  max-width: 1440px;
  margin: 0 auto;
}


</style>
