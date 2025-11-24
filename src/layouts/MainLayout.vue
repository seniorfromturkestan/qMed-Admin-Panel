<template>
  <div class="main-layout">
    <Header />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import Header from '../components/Header.vue'

export default {
  name: 'MainLayout',
  components: {
    Header,
  },
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-layout > main {
  flex: 1 1 auto;
  overflow: auto;
}
</style>