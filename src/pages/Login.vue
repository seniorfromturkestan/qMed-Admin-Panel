<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Левая часть: форма -->
      <div class="login-left">
        <div class="login-left__top">
          <div class="login-logo">
              <img src="../assets/img/qMed-logo.png" alt="">
          </div>

          <button type="button" class="lang-chip">
            RU
          </button>
        </div>

        <div class="login-left__content">
          <h1 class="login-title">Вход</h1>

          <form class="login-form" @submit.prevent="onSubmit">
            <div class="form-group">
              <label for="username">Логин</label>
              <UiInput
                id="username"
                v-model="form.username"
                placeholder="Ваш логин"
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label for="password">Пароль</label>
              <UiInput
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Ваш пароль"
                autocomplete="current-password"
              />
            </div>

            <div class="form-row">
              <label class="remember-checkbox">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                />
                <span>Запомнить меня</span>
              </label>
            </div>

            <p v-if="error" class="error-text">
              {{ error }}
            </p>

            <UiButton
              class="login-button"
              type="submit"
              :disabled="loading"
            >
              <span v-if="!loading">Войти</span>
              <span v-else>Входим...</span>
            </UiButton>
          </form>
        </div>
      </div>

      <!-- Правая часть: картинка -->
      <div class="login-right">
        <!-- Здесь поставь свою картинку врача/медсестры -->
        <img
          src="../assets/img/login-nurse.png"
          alt="Медицинский работник"
          class="login-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthApi from '../api/models/AuthApi'
import UiInput from '../components/ui/UiInput.vue'
import UiButton from '../components/ui/UiButton.vue'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const rememberMe = ref(false)

const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  if (!form.username || !form.password) return

  error.value = ''
  loading.value = true

  try {
    const response = await AuthApi.login(form.username, form.password)
    const token = response?.token || response?.data?.token

    if (!token) {
      throw new Error('Не удалось получить токен доступа')
    }

    localStorage.setItem('accessToken', token)
    localStorage.setItem('user_id', response?.user_id || '')

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
  padding: 32px 16px;
}

.login-card {
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  border-radius: 25px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.login-left {
  flex: 1 1 50%;
  padding: 36px 40px;
  display: flex;
  flex-direction: column;
}

.login-left__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.login-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.login-logo img {
  height: 70px;
}


.lang-chip {
  border: none;
  border-radius: 10px;
  padding: 6px 16px; 
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  background: #1c59f8;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(28, 89, 248, 0.3);
}

.login-left__content {
  flex: 1;
  max-width: 360px;
  margin-top: 30px;
  margin-left: 30px;
}

.login-title {
  text-align: center;
  font-size: 45px;
  font-weight: 700;
  margin: 0 0 24px;
  color: #111827;
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
  color: #374151;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.remember-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.remember-checkbox input {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.error-text {
  margin: 4px 0 0;
  font-size: 13px;
  color: #f97373;
}

.login-button {
  margin-top: 8px;
  width: 100%;
}

.login-right {
  flex: 1 1 50%;
  position: relative;
}

.login-image {
  width: 100%;
  height: 100%;
  border-radius: 25px;
  object-fit: cover;
}


</style>
