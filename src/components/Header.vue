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
        <span class="header__profile-name">
          {{ userName }}
        </span>
        <div class="header__profile-icon">
          <img src="../assets/img/profile.png" alt="">
        </div>
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
  height: 72px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__logo {
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.header__logo:hover {
  transform: scale(1.05);
}

.header__logo img {
  height: 44px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06));
}

.header__title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header__lang {
  display: inline-flex;
  border-radius: 12px;
  padding: 4px;
  background: linear-gradient(135deg, #1C59F8 0%, #3b82f6 100%);
  box-shadow: 0 2px 8px rgba(28, 89, 248, 0.2);
}

.header__lang-btn {
  border: none;
  background: transparent;
  color: #ffffff;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header__lang-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header__lang-btn--active {
  background: #ffffff;
  color: #1C59F8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header__profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  
}



.header__profile-name {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}



.header__profile-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}




</style>