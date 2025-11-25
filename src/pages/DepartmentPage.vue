<template>
  <div class="department-page">
    <!-- Верхняя панель: назад + хлебные крошки -->
    <div class="department-page__top">
      <div class="breadcrumbs">
        <RouterLink to="/main" class="breadcrumbs__item">Главная</RouterLink>
        <span class="breadcrumbs__sep">/</span>
        <span class="breadcrumbs__item">{{ polyclinicName }}</span>
        <span class="breadcrumbs__sep">/</span>
        <span class="breadcrumbs__item breadcrumbs__item--current">
          {{ department?.name }}
        </span>
      </div>
    </div>


    <div class="department-page__controls">
      <div class="search-box">
        <UiInput
          v-model="searchQuery"
          placeholder="Поиск"
          class="search-box__input"
        />
        <UiButton
          type="button"
          variant="secondary"
          class="search-box__btn"
          @click="onSearch"
        >
          Искать
        </UiButton>
      </div>

      <UiButton type="button" variant="primary" @click="openCreateSectorModal">
        Добавить участок
      </UiButton>
    </div>

    <!-- Таблица участков -->
    <div class="card">
      <div class="card__header-row card__header-row--sectors">
        <div class="col col--id">ID</div>
        <div class="col col--name">Название участка</div>
        <div class="col col--count">Кол-во сотрудников</div>
        <div class="col col--actions">Действия</div>
      </div>

      <div v-if="loadingSectors" class="card__empty">
        Загрузка участков...
      </div>
      <div
        v-else-if="!filteredSectors.length"
        class="card__empty"
      >
        Участки не найдены
      </div>
      <div
        v-else
        v-for="sector in filteredSectors"
        :key="sector.sector_id || sector.SectorID || sector.id"
        class="card__row card__row--sectors"
      >
        <div class="col col--id">
          {{ formatId(sector.sector_id || sector.SectorID || sector.id) }}
        </div>
        <div class="col col--name col--name-link" @click="goToSector(sector)">
          {{ sector.address || `Участок ${sector.number || sector.Number}` }}
        </div>
        <div class="col col--count">
          {{ sector.employees_count ?? sector.employeesCount ?? 0 }}
        </div>
        <div class="col col--actions">
          <button
            type="button"
            class="icon-btn"
            @click="openEditSectorModal(sector)"
          >
            <img src="../assets/img/edit.png" alt="">
          </button>
          <button
            type="button"
            class="icon-btn"
            @click="openDeleteSectorModal(sector)"
          >
            <img src="../assets/img/delete.png" alt="">
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица заведующих отделением -->
    <h2 class="department-page__subtitle">
      Заведующие отделением
    </h2>

    <div class="card card--managers">
      <div class="card__header-row card__header-row--managers">
        <div class="col col--fio">ФИО</div>
        <div class="col col--contacts">Контакты</div>
      </div>

      <div v-if="loadingManagers" class="card__empty">
        Загрузка заведующих...
      </div>
      <div v-else-if="!managers.length" class="card__empty">
        Заведующие не назначены
      </div>
      <div
        v-else
        v-for="m in managers"
        :key="m.user_id || m.UserID || m.id"
        class="card__row card__row--managers"
      >
        <div class="col col--fio">
          {{ buildFullName(m) }}
        </div>
        <div class="col col--contacts">
          {{ m.phone_number || m.PhoneNumber || '—' }}
        </div>
      </div>
    </div>

    <!-- Модалка создания участка -->
    <UiModal
      v-if="isCreateSectorModalOpen"
      title="Добавить участок"
      @close="closeCreateSectorModal"
    >
      <form class="modal-form" @submit.prevent="saveCreatedSector">
        <label class="modal-form__field">
          <span>Номер участка</span>
          <UiInput
            v-model="sectorForm.number"
            type="number"
            min="1"
            required
          />
        </label>

        <label class="modal-form__field">
          <span>Адрес участка</span>
          <UiInput
            v-model="sectorForm.address"
            type="text"
            placeholder="Например, Участок 5"
          />
        </label>

        <div class="modal-form__footer">
          <UiButton
            type="button"
            variant="secondary"
            @click="closeCreateSectorModal"
          >
            Отмена
          </UiButton>
          <UiButton type="submit" variant="primary">
            Сохранить
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Модалка редактирования участка -->
    <UiModal
      v-if="isEditSectorModalOpen"
      title="Редактировать участок"
      @close="closeEditSectorModal"
    >
      <form class="modal-form" @submit.prevent="saveEditedSector">
        <label class="modal-form__field">
          <span>Номер участка</span>
          <UiInput
            v-model="sectorForm.number"
            type="number"
            min="1"
            required
          />
        </label>

        <label class="modal-form__field">
          <span>Адрес участка</span>
          <UiInput
            v-model="sectorForm.address"
            type="text"
          />
        </label>

        <div class="modal-form__footer">
          <UiButton
            type="button"
            variant="secondary"
            @click="closeEditSectorModal"
          >
            Отмена
          </UiButton>
          <UiButton type="submit" variant="primary">
            Сохранить
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Модалка удаления участка -->
    <UiModal
      v-if="isDeleteSectorModalOpen"
      title="Удалить участок"
      @close="cancelDeleteSector"
    >
      <div class="modal-delete">
        <p class="modal-delete__text">
          Вы уверены, что хотите удалить участок
          <strong>
            №{{ sectorToDelete?.number || sectorToDelete?.Number }}
          </strong>
          ?
        </p>

        <div class="modal-delete__footer">
          <UiButton
            type="button"
            variant="secondary"
            @click="cancelDeleteSector"
          >
            Отмена
          </UiButton>
          <UiButton
            type="button"
            variant="primary"
            @click="confirmDeleteSector"
          >
            Удалить
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import UiButton from '../components/ui/UiButton.vue'
import UiInput from '../components/ui/UiInput.vue'
import UiModal from '../components/ui/UiModal.vue'

import DepartmentApi from '../api/models/DepartmentApi'
import SectorApi from '../api/models/SectorApi'
import PolyclinicApi from '../api/models/PolyclinicApi'

const route = useRoute()
const router = useRouter()

const departmentId = computed(() => Number(route.params.id))
const polyclinicName = ref('')
const polyclinicId = ref(route.params.id)



const department = ref(null)
const sectors = ref([])
const managers = ref([])

const loadingSectors = ref(false)
const loadingManagers = ref(false)

const searchQuery = ref('')

// модалки и форма для участков
const isCreateSectorModalOpen = ref(false)
const isEditSectorModalOpen = ref(false)
const isDeleteSectorModalOpen = ref(false)

const sectorForm = ref({
  id: null,
  number: '',
  address: '',
})

const sectorToDelete = ref(null)

const goBack = () => {
  router.back()
}

const formatId = (id) => {
  if (!id && id !== 0) return ''
  const str = String(id)
  if (str.length >= 2) return str.padStart(2, '0')
  return `0${str}`
}

const buildFullName = (user) => {
  const last = user.last_name || user.LastName || ''
  const first = user.first_name || user.FirstName || ''
  const middle = user.middle_name || user.MiddleName || ''
  return [last, first, middle].filter(Boolean).join(' ')
}

const fetchPolyclinicInfo = async () => {
  if (!polyclinicId.value) return
  try {
    const res = await PolyclinicApi.getPolyclinicById(polyclinicId.value)
    const data = res?.data || res
    polyclinicName.value = data.name || data.Name || ''
  } catch (e) {
    console.error('Ошибка при получении поликлиники:', e)
  }
}

const fetchDepartment = async () => {
  if (!departmentId.value) return
  try {
    const res = await DepartmentApi.getDepartment(departmentId.value)
    const data = res?.data || res
    department.value = data

  } catch (e) {
    console.error('Ошибка при получении отделения:', e)
  }
}

const fetchSectors = async () => {
  if (!departmentId.value) return
  loadingSectors.value = true
  try {
    const res = await DepartmentApi.getSectors(departmentId.value)
    const data = res?.data || res
    sectors.value = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Ошибка при получении участков:', e)
  } finally {
    loadingSectors.value = false
  }
}

const fetchManagers = async () => {
  if (!departmentId.value) return
  loadingManagers.value = true
  try {
    const res = await DepartmentApi.getManagers(departmentId.value)
    const data = res?.data || res
    managers.value = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []


  } catch (e) {
    console.error('Ошибка при получении заведующих:', e)
  } finally {
    loadingManagers.value = false
  }
}

const filteredSectors = computed(() => {
  if (!searchQuery.value) return sectors.value
  const q = searchQuery.value.toLowerCase()
  return sectors.value.filter((s) => {
    const num = String(s.number || s.Number || '')
    const addr = String(s.address || '').toLowerCase()
    return num.includes(q) || addr.includes(q)
  })
})

const onSearch = () => {
  // сейчас поиск работает реактивно, кнопка просто "формальная"
}

const openCreateSectorModal = () => {
  sectorForm.value = {
    id: null,
    number: '',
    address: '',
  }
  isCreateSectorModalOpen.value = true
}

const closeCreateSectorModal = () => {
  isCreateSectorModalOpen.value = false
}

const saveCreatedSector = async () => {
  if (!department.value || !departmentId.value) return

  const payload = {
    number: Number(sectorForm.value.number),
    address: sectorForm.value.address || `Участок ${sectorForm.value.number}`,
    polyclinic_id: department.value.polyclinic_id || department.value.PolyclinicID || 0,
    department_id: Number(departmentId.value),
  }

  try {
    await SectorApi.createSector(payload)
    await fetchSectors()
  } catch (e) {
    console.error('Ошибка при создании участка:', e)
  } finally {
    closeCreateSectorModal()
  }
}

const openEditSectorModal = (sector) => {
  sectorForm.value = {
    id: sector.sector_id || sector.SectorID || sector.id,
    number: sector.number || sector.Number || '',
    address: sector.address || '',
  }
  isEditSectorModalOpen.value = true
}

const closeEditSectorModal = () => {
  isEditSectorModalOpen.value = false
}

const saveEditedSector = async () => {
  if (!sectorForm.value.id) return
  const payload = {
    number: Number(sectorForm.value.number),
    address: sectorForm.value.address,
    polyclinic_id: department.value?.polyclinic_id || department.value?.PolyclinicID || 0,
    department_id: Number(departmentId.value),
  }

  try {
    await SectorApi.updateSector(sectorForm.value.id, payload)
    await fetchSectors()
  } catch (e) {
    console.error('Ошибка при обновлении участка:', e)
  } finally {
    closeEditSectorModal()
  }
}

const openDeleteSectorModal = (sector) => {
  sectorToDelete.value = sector
  isDeleteSectorModalOpen.value = true
}

const cancelDeleteSector = () => {
  sectorToDelete.value = null
  isDeleteSectorModalOpen.value = false
}

const confirmDeleteSector = async () => {
  if (!sectorToDelete.value) return
  const id =
    sectorToDelete.value.sector_id ||
    sectorToDelete.value.SectorID ||
    sectorToDelete.value.id
  if (!id) return

  try {
    await SectorApi.deleteSector(id)
    await fetchSectors()
  } catch (e) {
    console.error('Ошибка при удалении участка:', e)
  } finally {
    cancelDeleteSector()
  }
}

const goToSector = (sector) => {
  const id = sector.sector_id || sector.SectorID || sector.id
  if (!id) return
  router.push({ name: 'SectorPage', params: { id } })
}

onMounted(() => {
  fetchDepartment()
  fetchSectors()
  fetchManagers()
  fetchPolyclinicInfo()
})
</script>

<style scoped>
.department-page {
  padding: 24px;
}

.department-page__top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 4px 8px;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.breadcrumbs__item {
  text-decoration: none;
  color: #6b7280;
}

.breadcrumbs__item--current {
  color: #111827;
  font-weight: 500;
}

.breadcrumbs__sep {
  color: #9ca3af;
}

.department-page__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.department-page__controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.search-box__input {
  width: 500px;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 0;
  overflow: hidden;
}

.card__header-row,
.card__row {
  display: grid;
  align-items: center;
  padding: 12px 20px;
}

.card__header-row {
  background: #edf3ff;
  font-weight: 600;
  font-size: 15px;
  padding: 16px;
}

.card__row {
  font-size: 14px;
}

.card__row:nth-child(odd) {
  background: #ffffff;
}

.card__row:nth-child(even) {
  background: #f9fafb;
}

.card__empty {
  padding: 16px 20px;
  font-size: 14px;
  color: #6b7280;
}
.search-box__btn{
  border:2px solid #2563eb;
  color:#2563eb;

}

/* сетка для таблицы участков */
.card__header-row--sectors,
.card__row--sectors {
  grid-template-columns: 0.7fr 3fr 2fr 1.4fr;
  column-gap: 8px;
}

/* сетка для таблицы заведующих */
.card__header-row--managers,
.card__row--managers {
  grid-template-columns: 3fr 2fr;
  column-gap: 8px;
}

.col {
  display: flex;
  align-items: center;
}

.col--id {
  justify-content: flex-start;
}

.col--name {
  justify-content: flex-start;
}

.col--name-link {
  cursor: pointer;
  color: #2563eb;
}

.col--name-link:hover {
  text-decoration: underline;
}

.col--count {
  justify-content: flex-start;
}

.col--actions {
  justify-content: flex-end;
  gap: 6px;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}
.icon-btn img{
  width:20px;

}

.department-page__subtitle {
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 12px;
}

/* модалки */
.modal-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 12px;
}

.modal-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.modal-form__field:only-of-type {
  grid-column: 1 / -1;
}

.modal-form__footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.modal-delete__text {
  font-size: 14px;
  margin-bottom: 16px;
}

.modal-delete__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* адаптив */
@media (max-width: 768px) {
  .department-page__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .card__header-row--sectors,
  .card__row--sectors {
    grid-template-columns: 1fr 2fr;
    row-gap: 4px;
  }

  .col--count,
  .col--actions {
    justify-content: flex-start;
  }

  .modal-form {
    grid-template-columns: 1fr;
  }
}
</style>