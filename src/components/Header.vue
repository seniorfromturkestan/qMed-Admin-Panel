<template>
  <header class="header">
    <div class="header__left">
      <div class="header__logo">
       <img src="../assets/img/logo.png" alt="">
      </div>
      <span class="header__title">{{ headerTitle }}</span>
    </div>

    <div class="header__right">
  
      <div class="header__profile">
        <div class="header__profile-icon">
          <img src="../assets/img/profile.png" alt="">
        </div>
        <span class="header__profile-name">
          {{ userName }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import UsersApi from '../api/models/UsersApi'
import DepartmentApi from '../api/models/DepartmentApi'
import SectorApi from '../api/models/SectorApi'

import { useRoute } from 'vue-router'

const route = useRoute()

const polyclinicTitle = ref('Поликлиники')
const departmentTitle = ref('Отделение')
const sectorTitle = ref('Участок')

const headerTitle = computed(() => {
  if (route.name === 'PolyclinicPage') {
    return route.query.name || polyclinicTitle.value || 'Поликлиника'
  } else if (route.name === 'DepartmentPage') {
    return departmentTitle.value || route.query.name || 'Отделение'
  } else if (route.name === 'SectorPage') {
    return sectorTitle.value || route.query.name || 'Участок'
  }
  return 'Поликлиники'
})

const currentLang = ref(localStorage.getItem('lang') || 'ru')

const setLang = (lang) => {
  currentLang.value = lang
  localStorage.setItem('lang', lang)
}

const userName = ref('')


const updateHeaderByRoute = async (toRoute = route) => {
  try {
    if (toRoute.name === 'DepartmentPage') {
      const id = toRoute.params.departmentId
      if (!id) return
      const res = await DepartmentApi.getDepartment(id)
      const data = res?.data || res
      const department = data?.department || data
      departmentTitle.value = department?.name || 'Отделение'
    } else if (toRoute.name === 'SectorPage') {
      const id = toRoute.params.sectorId
      if (!id) return
      const res = await SectorApi.getSectorById(id)
      const data = res?.data || res
      const sector = data?.sector || data
      if (sector) {
        sectorTitle.value =
          sector.address ||
          (sector.number ? `Участок ${sector.number}` : 'Участок')
      }
    }
  } catch (e) {
    console.error('Ошибка при обновлении заголовка header:', e)
  }
}

onMounted(async () => {
  updateHeaderByRoute()
  const userId = localStorage.getItem('user_id')
  if (!userId) return

  try {
    const res = await UsersApi.getUserById(userId)
    const data = res?.data || res

    const lastName =
      data?.last_name ||
      data?.LastName ||
      data?.lastName ||
      ''

    const firstName =
      data?.first_name ||
      data?.FirstName ||
      data?.firstName ||
      ''

    userName.value = lastName || [firstName, lastName].filter(Boolean).join(' ')
  } catch (e) {
    console.error('Ошибка при получении пользователя по id:', e)
  }
})

watch(
  () => route.fullPath,
  () => {
    updateHeaderByRoute()
  }
)
</script>


<style scoped>
.header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  color: #000000;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header__logo img {
  height: 40px;
  width: auto;
}

.header__title {
  font-size: 18px;
  font-weight: 600;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__lang {
  display: inline-flex;
  border-radius: 999px;
  padding: 2px;
  background: #1C59F8;
}

.header__lang-btn {
  border: none;
  background: transparent;
  color: #ffffff;
  padding: 4px 10px;
  font-size: 14px;
  border-radius: 999px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.header__lang-btn--active {
  background: #ffffff;
  color: #000000;
}

.header__profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header__profile-icon img {
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.header__profile-name {
  font-size: 14px;
  color: #000000;
}
</style>
