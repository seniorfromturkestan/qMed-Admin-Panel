<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">qMed Admin</h1>
      <p class="login-subtitle">Вход в админ-панель</p>

      <form class="login-form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="username">Логин</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            autocomplete="username"
            placeholder="Введите логин"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="Введите пароль"
            required
          />
        </div>

        <p v-if="error" class="error-text">
          {{ error }}
        </p>

        <button class="login-button" type="submit" :disabled="loading">
          <span v-if="!loading">Войти</span>
          <span v-else>Входим...</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthApi from '../api/models/AuthApi'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  if (!form.username || !form.password) return

  error.value = ''
  loading.value = true

  try {
    const response = await AuthApi.login(form.username, form.password)

    // !!! ВАЖНО: проверь реальный ответ /login
    // Здесь предполагаем, что токен приходит в response.data.token
    const token = response?.token || response?.data?.token

    if (!token) {
      throw new Error('Не удалось получить токен доступа')
    }

    localStorage.setItem('accessToken', token)
    localStorage.setItem('user_id', response?.user_id || '')

    // После логина перенаправляем на главную админку (путь подстрой под свой роутер)
    router.push({ path: '/main' })
  } catch (e) {
    console.error(e)
    error.value =
      e?.response?.data?.message ||
      e?.message ||
      'Ошибка входа. Проверьте логин и пароль.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 30px;
  padding: 32px 28px;
  box-shadow: 0 1px 30px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
}

.login-subtitle {
  margin: 0 0 24px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
}

.form-group input {
  border-radius: 20px;
  padding: 10px 12px;
  font-size: 14px;
    border: 1px solid #d1d5db;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.form-group input::placeholder {
  color: #6b7280;
}

.form-group input:focus {
  border-color: #1C59F8;
  box-shadow: 0 0 0 1px #1c5af87c;
}

.error-text {
  margin: 0;
  font-size: 13px;
  color: #f97373;
}

.login-button {
  margin-top: 8px;
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #1C59F8, #033ed3);
  display: inline-flex;
  color: #ffffff;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    filter 0.1s ease,
    opacity 0.1s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
    box-shadow: 0 12px 24px #1c5af87c;
  filter: brightness(1.05);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
    box-shadow: 0 8px 16px #1C59F8;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: default;
  box-shadow: none;
}
</style>
