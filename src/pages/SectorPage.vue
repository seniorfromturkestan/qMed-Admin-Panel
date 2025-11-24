<template>
    <div class="sector-page">
      <!-- Хлебные крошки -->
      <div class="sector-page__top">  
        <div class="breadcrumbs">
          <RouterLink to="/main" class="breadcrumbs__item">Главная</RouterLink>
          <span class="breadcrumbs__sep">/</span>
          <span class="breadcrumbs__item">Отделения</span>
          <span class="breadcrumbs__sep">/</span>
          <span class="breadcrumbs__item breadcrumbs__item--current">
            Участок {{ sector?.number ?? sectorId }}
          </span>
        </div>
      </div>
  
    
      <!-- Поиск + кнопка -->
      <div class="sector-page__controls">
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
  
        <!-- пока без логики создания пациента, просто кнопка как в макете -->
        <UiButton type="button" variant="primary">
          Добавить пациента
        </UiButton>
      </div>
  
      <!-- Табы -->
      <div class="tabs">
        <button
          type="button"
          class="tabs__item"
          :class="{ 'tabs__item--active': activeTab === 'patients' }"
          @click="activeTab = 'patients'"
        >
          Пациенты
        </button>
        <button
          type="button"
          class="tabs__item"
          :class="{ 'tabs__item--active': activeTab === 'med_staff' }"
          @click="activeTab = 'med_staff'"
        >
          Сотрудники
        </button>
      </div>
  
      <!-- Таблица пациентов -->
      <div v-if="activeTab === 'patients'" class="card">
        <div class="card__header-row card__header-row--patients">
          <div class="col col--fio">ФИО</div>
          <div class="col col--iin">ИИН</div>
          <div class="col col--disease">Нозология</div>
          <div class="col col--phone">Номер телефона</div>
          <div class="col col--actions">Действия</div>
        </div>
  
        <div v-if="loading" class="card__empty">
          Загрузка...
        </div>
        <div v-else-if="!filteredPatients.length" class="card__empty">
          Пациенты не найдены
        </div>
        <div
          v-else
          v-for="p in filteredPatients"
          :key="p.user_id || p.UserID || p.id"
          class="card__row card__row--patients"
        >
          <div class="col col--fio">
            {{ buildFullName(p) }}
          </div>
          <div class="col col--iin">
            {{ p.iin || p.IIN || '—' }}
          </div>
          <div class="col col--disease">
            {{ getDiseasesLabel(p) }}
          </div>
          <div class="col col--phone">
            {{ p.phone_number || p.PhoneNumber || '—' }}
          </div>
          <div class="col col--actions">
            <button
              type="button"
              class="icon-btn"
              @click="onEditPatient(p)"
            >
              ✏️
            </button>
            <button
              type="button"
              class="icon-btn"
              @click="onDeletePatient(p)"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
  
      <!-- Таблица сотрудников (med_staff) -->
      <div v-else class="card">
        <div class="card__header-row card__header-row--med">
          <div class="col col--fio">ФИО</div>
          <div class="col col--role">Роль</div>
          <div class="col col--phone">Номер телефона</div>
          <div class="col col--actions">Действия</div>
        </div>
  
        <div v-if="loading" class="card__empty">
          Загрузка...
        </div>
        <div v-else-if="!filteredMedStaff.length" class="card__empty">
          Сотрудники не найдены
        </div>
        <div
          v-else
          v-for="emp in filteredMedStaff"
          :key="emp.user_id || emp.UserID || emp.id"
          class="card__row card__row--med"
        >
          <div class="col col--fio">
            {{ buildFullName(emp) }}
          </div>
          <div class="col col--role">
            {{ getRoleLabel(emp.roles || emp.Roles) }}
          </div>
          <div class="col col--phone">
            {{ emp.phone_number || emp.PhoneNumber || '—' }}
          </div>
          <div class="col col--actions">
            <button
              type="button"
              class="icon-btn"
              @click="onEditEmployee(emp)"
            >
              ✏️
            </button>
            <button
              type="button"
              class="icon-btn"
              @click="onDeleteEmployee(emp)"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
  
      <!-- Модалка редактирования пациента -->
      <UiModal
        v-if="isPatientEditModalOpen"
        title="Редактирование пациента"
        @close="closeEditPatientModal"
      >
        <form class="modal-form" @submit.prevent="savePatient">
          <label class="modal-form__field">
            <span>Фамилия</span>
            <UiInput
              v-model="patientEditForm.last_name"
              type="text"
              required
            />
          </label>
          <label class="modal-form__field">
            <span>Имя</span>
            <UiInput
              v-model="patientEditForm.first_name"
              type="text"
              required
            />
          </label>
          <label class="modal-form__field">
            <span>Отчество</span>
            <UiInput
              v-model="patientEditForm.middle_name"
              type="text"
            />
          </label>
          <label class="modal-form__field">
            <span>ИИН</span>
            <UiInput
              v-model="patientEditForm.iin"
              type="text"
            />
          </label>
          <label class="modal-form__field">
            <span>Телефон</span>
            <UiInput
              v-model="patientEditForm.phone_number"
              type="text"
            />
          </label>
          <label class="modal-form__field">
            <span>Дата рождения</span>
            <UiInput
              v-model="patientEditForm.birth_date"
              type="date"
            />
          </label>
          <label class="modal-form__field">
            <span>Пол</span>
            <select
              v-model="patientEditForm.gender"
              class="modal-select"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="F">Женский (F)</option>
              <option value="M">Мужской (M)</option>
            </select>
          </label>
          <label class="modal-form__field">
            <span>Адрес</span>
            <UiInput
              v-model="patientEditForm.address"
              type="text"
            />
          </label>
          <label class="modal-form__field">
            <span>E-mail</span>
            <UiInput
              v-model="patientEditForm.mail"
              type="email"
            />
          </label>
          <label class="modal-form__field">
            <span>Рост (см)</span>
            <UiInput
              v-model="patientEditForm.height_cm"
              type="number"
              min="0"
            />
          </label>
          <label class="modal-form__field">
            <span>Вес (кг)</span>
            <UiInput
              v-model="patientEditForm.weight_kg"
              type="number"
              min="0"
            />
          </label>
          <label class="modal-form__field">
            <span>Давление</span>
            <UiInput
              v-model="patientEditForm.blood_pressure"
              type="text"
            />
          </label>
          <label class="modal-form__field">
            <span>Сахар</span>
            <UiInput
              v-model="patientEditForm.sugar_level"
              type="number"
              step="0.1"
            />
          </label>
          <label class="modal-form__field">
            <span>Пульс</span>
            <UiInput
              v-model="patientEditForm.heart_rate"
              type="number"
              min="0"
            />
          </label>
  
          <div class="modal-form__footer">
            <UiButton
              type="button"
              variant="secondary"
              @click="closeEditPatientModal"
            >
              Отмена
            </UiButton>
            <UiButton type="submit" variant="primary">
              Сохранить
            </UiButton>
          </div>
        </form>
      </UiModal>
  
      <!-- Модалка удаления пациента -->
      <UiModal
        v-if="isPatientDeleteModalOpen"
        title="Удалить пациента"
        @close="cancelDeletePatient"
      >
        <div class="modal-delete">
          <p class="modal-delete__text">
            Вы уверены, что хотите удалить пациента
            <strong>{{ buildFullName(deletingPatient) }}</strong>?
          </p>
  
          <div class="modal-delete__footer">
            <UiButton
              type="button"
              variant="secondary"
              @click="cancelDeletePatient"
            >
              Отмена
            </UiButton>
            <UiButton
              type="button"
              variant="primary"
              @click="confirmDeletePatient"
            >
              Удалить
            </UiButton>
          </div>
        </div>
      </UiModal>
  
      <!-- Модалка редактирования сотрудника -->
      <UiModal
        v-if="isEmployeeEditModalOpen"
        title="Редактирование сотрудника"
        @close="closeEditEmployeeModal"
      >
        <form class="modal-form" @submit.prevent="saveEmployee">
          <label class="modal-form__field">
            <span>Фамилия</span>
            <UiInput
              v-model="employeeEditForm.last_name"
              type="text"
              required
            />
          </label>
          <label class="modal-form__field">
            <span>Имя</span>
            <UiInput
              v-model="employeeEditForm.first_name"
              type="text"
              required
            />
          </label>
          <label class="modal-form__field">
            <span>Отчество</span>
            <UiInput
              v-model="employeeEditForm.middle_name"
              type="text"
            />
          </label>
          <label class="modal-form__field">
            <span>Телефон</span>
            <UiInput
              v-model="employeeEditForm.phone_number"
              type="text"
            />
          </label>
          <label class="modal-form__field">
            <span>Дата рождения</span>
            <UiInput
              v-model="employeeEditForm.birth_date"
              type="date"
            />
          </label>
          <label class="modal-form__field">
            <span>Адрес</span>
            <UiInput
              v-model="employeeEditForm.address"
              type="text"
            />
          </label>
          <label class="modal-form__field">
            <span>E-mail</span>
            <UiInput
              v-model="employeeEditForm.mail"
              type="email"
            />
          </label>
  
          <div class="modal-form__footer">
            <UiButton
              type="button"
              variant="secondary"
              @click="closeEditEmployeeModal"
            >
              Отмена
            </UiButton>
            <UiButton type="submit" variant="primary">
              Сохранить
            </UiButton>
          </div>
        </form>
      </UiModal>
  
      <!-- Модалка удаления сотрудника -->
      <UiModal
        v-if="isEmployeeDeleteModalOpen"
        title="Удалить сотрудника"
        @close="cancelDeleteEmployee"
      >
        <div class="modal-delete">
          <p class="modal-delete__text">
            Вы уверены, что хотите удалить сотрудника
            <strong>{{ buildFullName(deletingEmployee) }}</strong>?
          </p>
  
          <div class="modal-delete__footer">
            <UiButton
              type="button"
              variant="secondary"
              @click="cancelDeleteEmployee"
            >
              Отмена
            </UiButton>
            <UiButton
              type="button"
              variant="primary"
              @click="confirmDeleteEmployee"
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
  
  import SectorApi from '../api/models/SectorApi'
  import UsersApi from '../api/models/UsersApi'

  
  const route = useRoute()
  const router = useRouter()
  
  const sectorId = computed(() => Number(route.params.id))
  
const sector = ref(null)
const managers = ref([])
const medStaff = ref([])
const patients = ref([])

const allEmployees = computed(() => {
  const mgrs = Array.isArray(managers.value) ? managers.value : []
  const staff = Array.isArray(medStaff.value) ? medStaff.value : []
  return [...mgrs, ...staff]
})
  
  const loading = ref(false)
  const searchQuery = ref('')
  
  const activeTab = ref('patients')
  
  // модалки и формы
  const isPatientEditModalOpen = ref(false)
  const isPatientDeleteModalOpen = ref(false)
  const editingPatient = ref(null)
  const deletingPatient = ref(null)
  
  const patientEditForm = ref({
    last_name: '',
    first_name: '',
    middle_name: '',
    iin: '',
    phone_number: '',
    birth_date: '',
    gender: 'female',
    address: '',
    mail: '',
    height_cm: null,
    weight_kg: null,
    blood_pressure: '',
    sugar_level: null,
    heart_rate: null,
  })
  
  const isEmployeeEditModalOpen = ref(false)
  const isEmployeeDeleteModalOpen = ref(false)
  const editingEmployee = ref(null)
  const deletingEmployee = ref(null)
  
  const employeeEditForm = ref({
    last_name: '',
    first_name: '',
    middle_name: '',
    phone_number: '',
    birth_date: '',
    address: '',
    mail: '',
  })
  
  const goBack = () => {
    router.back()
  }
  
  const buildFullName = (u) => {
    if (!u) return ''
    const last = u.last_name || u.LastName || ''
    const first = u.first_name || u.FirstName || ''
    const middle = u.middle_name || u.MiddleName || ''
    return [last, first, middle].filter(Boolean).join(' ')
  }
  
  const getDiseasesLabel = (p) => {
    const ds = p.diseases || p.Diseases || []
    if (!Array.isArray(ds) || !ds.length) return '—'
    return ds.map((d) => d.name).join(', ')
  }
  
  const getRoleLabel = (roles) => {
    const r = Array.isArray(roles) && roles.length ? roles[0] : null
    if (!r) return '—'
    const map = {
      1: 'Менеджер поликлиники',
      2: 'Менеджер сектора',
      3: 'Медперсонал',
      5: 'Зав. отделением',
    }
    return map[r] || `Роль ${r}`
  }
  
  const fetchSector = async () => {
    if (!sectorId.value) return
    loading.value = true
    try {
      const res = await SectorApi.getSectorById(sectorId.value)
      const data = res?.data || res
      sector.value = data.sector || null
      managers.value = data.managers || []
      medStaff.value = data.med_staff || []
      patients.value = data.patients || []
    } catch (e) {
      console.error('Ошибка при получении участка:', e)
    } finally {
      loading.value = false
    }
  }
  
  const filteredPatients = computed(() => {
    if (!searchQuery.value) return patients.value
    const q = searchQuery.value.toLowerCase()
    return patients.value.filter((p) => {
      const fio = buildFullName(p).toLowerCase()
      const iin = String(p.iin || p.IIN || '').toLowerCase()
      const phone = String(p.phone_number || p.PhoneNumber || '').toLowerCase()
      return fio.includes(q) || iin.includes(q) || phone.includes(q)
    })
  })
  
const filteredMedStaff = computed(() => {
  if (!searchQuery.value) return allEmployees.value
  const q = searchQuery.value.toLowerCase()
  return allEmployees.value.filter((e) => {
    const fio = buildFullName(e).toLowerCase()
    const phone = String(e.phone_number || e.PhoneNumber || '').toLowerCase()
    return fio.includes(q) || phone.includes(q)
  })
})
  
  const onSearch = () => {
    // поиск уже реактивный, кнопка "Искать" просто визуальная
  }
  
  // --- Пациенты: редактирование / удаление ---
  
  const onEditPatient = (p) => {
    editingPatient.value = p
    patientEditForm.value = {
      last_name: p.last_name || p.LastName || '',
      first_name: p.first_name || p.FirstName || '',
      middle_name: p.middle_name || p.MiddleName || '',
      iin: p.iin || p.IIN || '',
      phone_number: p.phone_number || p.PhoneNumber || '',
      birth_date: p.birth_date || p.BirthDate || '',
      gender: p.gender || p.Gender || 'female',
      address: p.address || p.Address || '',
      mail: p.mail || p.Mail || '',
      height_cm: p.height_cm ?? p.HeightCM ?? null,
      weight_kg: p.weight_kg ?? p.WeightKG ?? null,
      blood_pressure: p.blood_pressure || p.BloodPressure || '',
      sugar_level: p.sugar_level ?? p.SugarLevel ?? null,
      heart_rate: p.heart_rate ?? p.HeartRate ?? null,
    }
    isPatientEditModalOpen.value = true
  }
  
  const closeEditPatientModal = () => {
    isPatientEditModalOpen.value = false
    editingPatient.value = null
  }
  
  const savePatient = async () => {
    if (!editingPatient.value) return
    const id =
      editingPatient.value.user_id ||
      editingPatient.value.UserID ||
      editingPatient.value.id
    if (!id) return
  
    try {
      const payload = {
        last_name: patientEditForm.value.last_name,
        first_name: patientEditForm.value.first_name,
        middle_name: patientEditForm.value.middle_name,
        iin: patientEditForm.value.iin,
        phone_number: patientEditForm.value.phone_number,
        birth_date: patientEditForm.value.birth_date,
        gender: patientEditForm.value.gender,
        address: patientEditForm.value.address,
        mail: patientEditForm.value.mail,
        height_cm: patientEditForm.value.height_cm,
        weight_kg: patientEditForm.value.weight_kg,
        blood_pressure: patientEditForm.value.blood_pressure,
        sugar_level: patientEditForm.value.sugar_level,
        heart_rate: patientEditForm.value.heart_rate,
      }
  
      await UsersApi.updateUser(id, payload)
      await fetchSector()
    } catch (e) {
      console.error('Ошибка при обновлении пациента:', e)
    } finally {
      closeEditPatientModal()
    }
  }
  
  const onDeletePatient = (p) => {
    deletingPatient.value = p
    isPatientDeleteModalOpen.value = true
  }
  
  const cancelDeletePatient = () => {
    deletingPatient.value = null
    isPatientDeleteModalOpen.value = false
  }
  
  const confirmDeletePatient = async () => {
    if (!deletingPatient.value) return
    const id =
      deletingPatient.value.user_id ||
      deletingPatient.value.UserID ||
      deletingPatient.value.id
    if (!id) return
  
    try {
      // если есть отдельный DELETE /admin/users/{id}, можно заменить на UsersApi.deleteUser(id)
      await UsersApi.updateUser(id, { is_active: false })
      await fetchSector()
    } catch (e) {
      console.error('Ошибка при удалении пациента:', e)
    } finally {
      cancelDeletePatient()
    }
  }
  
  // --- Сотрудники: редактирование / удаление ---
  
  const onEditEmployee = (emp) => {
    editingEmployee.value = emp
    employeeEditForm.value = {
      last_name: emp.last_name || emp.LastName || '',
      first_name: emp.first_name || emp.FirstName || '',
      middle_name: emp.middle_name || emp.MiddleName || '',
      phone_number: emp.phone_number || emp.PhoneNumber || '',
      birth_date: emp.birth_date || emp.BirthDate || '',
      address: emp.address || emp.Address || '',
      mail: emp.mail || emp.Mail || '',
    }
    isEmployeeEditModalOpen.value = true
  }
  
  const closeEditEmployeeModal = () => {
    isEmployeeEditModalOpen.value = false
    editingEmployee.value = null
  }
  
  const saveEmployee = async () => {
    if (!editingEmployee.value) return
    const id =
      editingEmployee.value.user_id ||
      editingEmployee.value.UserID ||
      editingEmployee.value.id
    if (!id) return
  
    try {
      const payload = {
        last_name: employeeEditForm.value.last_name,
        first_name: employeeEditForm.value.first_name,
        middle_name: employeeEditForm.value.middle_name,
        phone_number: employeeEditForm.value.phone_number,
        birth_date: employeeEditForm.value.birth_date,
        address: employeeEditForm.value.address,
        mail: employeeEditForm.value.mail,
      }
  
      await UsersApi.updateUser(id, payload)
      await fetchSector()
    } catch (e) {
      console.error('Ошибка при обновлении сотрудника:', e)
    } finally {
      closeEditEmployeeModal()
    }
  }
  
  const onDeleteEmployee = (emp) => {
    deletingEmployee.value = emp
    isEmployeeDeleteModalOpen.value = true
  }
  
  const cancelDeleteEmployee = () => {
    deletingEmployee.value = null
    isEmployeeDeleteModalOpen.value = false
  }
  
  const confirmDeleteEmployee = async () => {
    if (!deletingEmployee.value) return
    const id =
      deletingEmployee.value.user_id ||
      deletingEmployee.value.UserID ||
      deletingEmployee.value.id
    if (!id) return
  
    try {
      await UsersApi.updateUser(id, { is_active: false })
      await fetchSector()
    } catch (e) {
      console.error('Ошибка при удалении сотрудника:', e)
    } finally {
      cancelDeleteEmployee()
    }
  }
  
  onMounted(() => {
    fetchSector()
  })
  </script>
  
  <style scoped>
  .sector-page {
    padding: 24px;
  }
  
  /* верхняя часть */
  .sector-page__top {
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
  
  .sector-page__title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .sector-page__subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 20px;
  }
  
  /* поиск + кнопка */
  .sector-page__controls {
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
    flex: 1;
  }
  
  /* табы */
  .tabs {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .tabs__item {
    border: none;
    background: transparent;
    padding: 8px 0;
    font-size: 14px;
    cursor: pointer;
    color: #6b7280;
    position: relative;
  }
  
  .tabs__item--active {
    color: #2563eb;
    font-weight: 500;
  }
  
  .tabs__item--active::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 100%;
    height: 2px;
    background: #2563eb;
  }
  
  /* таблицы */
  .card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
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
    font-weight: 500;
    font-size: 14px;
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
  
  /* сетка для пациентов */
  .card__header-row--patients,
  .card__row--patients {
    grid-template-columns: 3fr 2fr 1.5fr 2fr 1.2fr;
    column-gap: 8px;
  }
  
  /* сетка для сотрудников */
  .card__header-row--med,
  .card__row--med {
    grid-template-columns: 3fr 2fr 2fr 1.2fr;
    column-gap: 8px;
  }
  
  .col {
    display: flex;
    align-items: center;
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
    .sector-page__controls {
      flex-direction: column;
      align-items: stretch;
    }
  
    .card__header-row--patients,
    .card__row--patients,
    .card__header-row--med,
    .card__row--med {
      grid-template-columns: 1.5fr 1.5fr;
      row-gap: 4px;
    }
  
    .modal-form {
      grid-template-columns: 1fr;
    }
  }
  </style>