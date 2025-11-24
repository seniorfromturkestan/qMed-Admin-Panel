<template>
  <div class="polyclinic-detail">
    <div class="polyclinic-detail__breadcrumbs">
      <RouterLink class="crumb" to="/main">Главная</RouterLink>
      <span class="crumb-sep">/</span>
      <span class="crumb">
       {{ polyclinicName }}
      </span>
      <span class="crumb-sep">/</span>
    </div>

    <!-- Верхняя панель: поиск + действия -->
    <div class="polyclinic-detail__top">
      <div class="polyclinic-detail__search">
        <UiInput
          v-model="searchQuery"
          placeholder="Поиск"
        />
        <UiButton
          type="button"
          variant="secondary"
          @click="onSearch"
        >
          Искать
        </UiButton>
      </div>

      <div class="polyclinic-detail__actions">
  <UiButton
    v-if="activeTab === 'departments'"
    type="button"
    variant="primary"
    @click="openCreateDepartmentModal"
  >
    Добавить отделение
  </UiButton>

  <template v-else-if="activeTab === 'employees'">
    <UiButton
      type="button"
      variant="primary"
      @click="openCreateEmployeeModal"
    >
      Добавить сотрудника
    </UiButton>

    <div class="polyclinic-detail__file">
      <label class="file-upload">
        <input
          type="file"
          accept=".xlsx,.xls"
          @change="onEmployeesFileChange"
        />
        <span class="file-upload__text">
          {{ employeesFile ? 'Файл: ' + employeesFile.name : 'Загрузить Excel' }}
        </span>
      </label>
    </div>
  </template>

  <div
    v-else-if="activeTab === 'patients'"
    class="polyclinic-detail__actions"
  >
    <select
      v-model="selectedDiseaseForPatientsExcel"
      class="polyclinic-detail__select"
    >
      <option disabled value="">Выберите нозологию</option>
      <option
        v-for="d in diseasesOptions"
        :key="d.id"
        :value="d.id"
      >
        {{ d.label }}
      </option>
    </select>

    <div class="polyclinic-detail__file">
      <label class="file-upload">
        <input
          type="file"
          accept=".xlsx,.xls"
          @change="onPatientsFileChange"
        />
        <span class="file-upload__text">
          {{
            patientsFile
              ? 'Файл: ' + patientsFile.name
              : (isPatientsUploading ? 'Загрузка...' : 'Загрузить Excel')
          }}
        </span>
      </label>
    </div>
    <span
      v-if="patientsExcelError"
      class="polyclinic-detail__error"
    >
      {{ patientsExcelError }}
    </span>
  </div>
</div>
    </div>

    <!-- Верхняя панель с таб-кнопками -->
    <div class="polyclinic-detail__tabs">
      <UiButton
        :variant="activeTab === 'departments' ? 'primary' : 'secondary'"
        @click="changeTab('departments')"
      >
        Отделения
      </UiButton>
      <UiButton
        :variant="activeTab === 'employees' ? 'primary' : 'secondary'"
        @click="changeTab('employees')"
      >
        Сотрудники
      </UiButton>
      <UiButton
        :variant="activeTab === 'patients' ? 'primary' : 'secondary'"
        @click="changeTab('patients')"
      >
        Пациенты
      </UiButton>
    </div>

    <!-- Контейнер контента -->
    <div class="polyclinic-detail__content">
      <!-- Отделения -->
      <div v-if="activeTab === 'departments'">
        <h2 class="section-title">Отделения поликлиники</h2>

        <div v-if="loadingDepartments" class="section-empty">Загрузка...</div>
        <div v-else-if="!departments.length" class="section-empty">
          Отделения не найдены
        </div>
        <div v-else class="section-table">
          <div class="section-table__header section-table__header--departments">
            <div class="col col--name">Название отделения</div>
            <div class="col col--count">Сотрудников</div>
            <div class="col col--count">Участков</div>
            <div class="col col--actions">Действия</div>
          </div>
          <div
            v-for="dept in filteredDepartments"
            :key="dept.id || dept.department_id"
            class="section-table__row section-table__row--departments"
            @click="goToDepartment(dept)"
          >
            <div class="col col--name">
              {{ dept.name }}
            </div>
            <div class="col col--count">
              {{ dept.employees_count ?? dept.employeesCount ?? 0 }}
            </div>
            <div class="col col--count">
              {{ dept.sectors_count ?? dept.sectorsCount ?? 0 }}
            </div>
            <div class="col col--actions">
              <button
                type="button"
                class="icon-btn"
                @click="onEditDepartment(dept)"
              >
                ✏️
              </button>
              <button
                type="button"
                class="icon-btn"
                @click="onDeleteDepartment(dept)"
              >
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Сотрудники -->
      <div v-else-if="activeTab === 'employees'">
        <h2 class="section-title">Сотрудники поликлиники</h2>

        <div v-if="loadingEmployees" class="section-empty">Загрузка...</div>
        <div v-else-if="!employees.length" class="section-empty">
          Сотрудники не найдены
        </div>
        <div v-else class="section-table">
          <div class="section-table__header section-table__header--employees">
            <div class="col col--name">Фамилия Имя</div>
            <div class="col col--role">Роль</div>
            <div class="col col--dept">Отделение</div>
            <div class="col col--sector">Участок</div>
            <div class="col col--phone">Телефон</div>
            <div class="col col--actions">Действия</div>
          </div>
          <div
            v-for="emp in employees"
            :key="emp.UserID || emp.user_id || emp.id"
            class="section-table__row section-table__row--employees"
          >
            <div class="col col--name">
              {{ formatUserName(emp) }}
            </div>
            <div class="col col--role">
              {{ getRoleName(emp) }}
            </div>
            <div class="col col--dept">
              {{ getDepartmentName(emp) }}
            </div>
            <div class="col col--sector">
                №{{ getSectorName(emp) }}
            </div>
            <div class="col col--phone">
              {{ emp.PhoneNumber || emp.phone_number || '' }}
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
      </div>

      <!-- Пациенты -->
      <div v-else-if="activeTab === 'patients'">
        <h2 class="section-title">Пациенты поликлиники</h2>

        <div v-if="loadingPatients" class="section-empty">Загрузка...</div>
        <div v-else-if="!patients.length" class="section-empty">
          Пациенты не найдены
        </div>
        <div v-else class="section-table">
          <div class="section-table__header section-table__header--patients">
            <div class="col col--name">Фамилия Имя</div>
            <div class="col col--dept">Отделение</div>
            <div class="col col--sector">Участок</div>
            <div class="col col--phone">Телефон</div>
            <div class="col col--actions">Действия</div>
          </div>
          <div
            v-for="p in patients"
            :key="p.UserID || p.user_id || p.id"
            class="section-table__row section-table__row--patients"
          >
            <div class="col col--name">
              {{ formatUserName(p) }}
            </div>
            <div class="col col--dept">
              {{ getDepartmentName(p) }}
            </div>
            <div class="col col--sector">
              №{{ getSectorName(p) }}
            </div>
            <div class="col col--phone">
              {{ p.phone_number || '' }}
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
      </div>
    </div>

    <!-- Модалка создания отделения -->
    <UiModal
      v-if="isDeptCreateModalOpen"
      title="Добавить отделение"
      @close="closeCreateDepartmentModal"
    >
      <form class="modal-form" @submit.prevent="saveDepartment">
        <label class="modal-form__field">
          <span>Название отделения</span>
          <UiInput
            v-model="deptForm.name"
            type="text"
            required
            placeholder="Например, Терапевтическое отделение"
          />
        </label>

        <div class="modal-form__footer">
          <UiButton
            type="button"
            variant="secondary"
            @click="closeCreateDepartmentModal"
          >
            Отмена
          </UiButton>
          <UiButton
            type="submit"
            variant="primary"
          >
            Сохранить
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Модалка редактирования отделения -->
    <UiModal
      v-if="isDeptEditModalOpen"
      title="Редактировать отделение"
      @close="closeEditDepartmentModal"
    >
      <form class="modal-form" @submit.prevent="saveEditDepartment">
        <label class="modal-form__field">
          <span>Название отделения</span>
          <UiInput
            v-model="deptEditForm.name"
            type="text"
            required
          />
        </label>

        <div class="modal-form__footer">
          <UiButton
            type="button"
            variant="secondary"
            @click="closeEditDepartmentModal"
          >
            Отмена
          </UiButton>
          <UiButton
            type="submit"
            variant="primary"
          >
            Сохранить
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Модалка удаления отделения -->
    <UiModal
      v-if="isDeptDeleteModalOpen"
      title="Удалить отделение"
      @close="cancelDeleteDepartment"
    >
      <div class="modal-delete">
        <p class="modal-delete__text">
          Вы уверены, что хотите удалить
          <strong>
            «{{ deletingDepartment ? deletingDepartment.name : '' }}»
          </strong>
          ?
        </p>

        <div class="modal-delete__footer">
          <UiButton
            type="button"
            variant="secondary"
            @click="cancelDeleteDepartment"
          >
            Отмена
          </UiButton>
          <UiButton
            type="button"
            variant="primary"
            @click="confirmDeleteDepartment"
          >
            Удалить
          </UiButton>
        </div>
      </div>
    </UiModal>

    <!-- Модалка создания сотрудника -->
    <UiModal
      v-if="isEmployeeCreateModalOpen"
      title="Добавить сотрудника"
      @close="closeCreateEmployeeModal"
    >
      <form class="modal-form" @submit.prevent="saveCreatedEmployee">
        <label class="modal-form__field">
          <span>Фамилия</span>
          <UiInput
            v-model="employeeCreateForm.last_name"
            type="text"
            required
          />
        </label>
        <label class="modal-form__field">
          <span>Имя</span>
          <UiInput
            v-model="employeeCreateForm.first_name"
            type="text"
            required
          />
        </label>
        <label class="modal-form__field">
          <span>Отчество</span>
          <UiInput
            v-model="employeeCreateForm.middle_name"
            type="text"
          />
        </label>
        <label class="modal-form__field">
          <span>Телефон</span>
          <UiInput
            v-model="employeeCreateForm.phone_number"
            type="text"
          />
        </label>
        <label class="modal-form__field">
      <span>Пол</span>
      <select
        v-model="employeeCreateForm.gender"
        class="modal-select"
      >
        <option value="F">Женский</option>
        <option value="M">Мужской</option>
      </select>
    </label>

    <label class="modal-form__field">
      <span>Адрес</span>
      <UiInput
        v-model="employeeCreateForm.address"
        type="text"
      />
    </label>

    <label class="modal-form__field">
      <span>E-mail</span>
      <UiInput
        v-model="employeeCreateForm.mail"
        type="email"
      />
    </label>

    <label class="modal-form__field">
      <span>Дата рождения</span>
      <UiInput
        v-model="employeeCreateForm.birth_date"
        type="date"
      />
    </label>
      <label class="modal-form__field">
        <span>Роль</span>
        <select
          v-model="employeeCreateForm.role_id"
          class="modal-select"
        >
          <option
            v-for="role in rolesOptions"
            :key="role.id"
            :value="role.id"
          >
            {{ role.label }}
          </option>
        </select>
      </label>

      <label class="modal-form__field">
        <span>Отделение</span>
        <select
          v-model="employeeCreateForm.department_id"
          class="modal-select"
        >
          <option
            v-for="d in departments"
            :key="d.id || d.department_id"
            :value="d.id || d.department_id"
          >
            {{ d.name }}
          </option>
        </select>
      </label>

      <label class="modal-form__field">
        <span>Участки</span>
        <select
          v-model="employeeCreateForm.sector_ids"
          class="modal-select"
          multiple
        >
          <option
            v-for="s in departmentSectors"
            :key="s.sector_id || s.id"
            :value="s.sector_id || s.id"
          >
            №{{ s.Number || s.number }} Участок
          </option>
        </select>
      </label>

        <div class="modal-form__footer">
          <UiButton
            type="button"
            variant="secondary"
            @click="closeCreateEmployeeModal"
          >
            Отмена
          </UiButton>
          <UiButton
            type="submit"
            variant="primary"
          >
            Сохранить
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Модалка редактирования сотрудника -->
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
        v-model="employeeCreateForm.last_name"
        type="text"
        required
      />
    </label>
    <label class="modal-form__field">
      <span>Имя</span>
      <UiInput
        v-model="employeeCreateForm.first_name"
        type="text"
        required
      />
    </label>
    <label class="modal-form__field">
      <span>Отчество</span>
      <UiInput
        v-model="employeeCreateForm.middle_name"
        type="text"
      />
    </label>
    <label class="modal-form__field">
      <span>Телефон</span>
      <UiInput
        v-model="employeeCreateForm.phone_number"
        type="text"
      />
    </label>

    <label class="modal-form__field">
      <span>Пол</span>
      <select
        v-model="employeeCreateForm.gender"
        class="modal-select"
      >
        <option value="F">Женский</option>
        <option value="M">Мужской</option>
      </select>
    </label>

    <label class="modal-form__field">
      <span>Адрес</span>
      <UiInput
        v-model="employeeCreateForm.address"
        type="text"
      />
    </label>

    <label class="modal-form__field">
      <span>E-mail</span>
      <UiInput
        v-model="employeeCreateForm.mail"
        type="email"
      />
    </label>

    <label class="modal-form__field">
      <span>Дата рождения</span>
      <UiInput
        v-model="employeeCreateForm.birth_date"
        type="date"
      />
    </label>

    <label class="modal-form__field">
      <span>Роль</span>
      <select
        v-model="employeeCreateForm.role_id"
        class="modal-select"
      >
        <option
          v-for="role in rolesOptions"
          :key="role.id"
          :value="role.id"
        >
          {{ role.label }}
        </option>
      </select>
    </label>

    <label class="modal-form__field">
      <span>Отделение</span>
      <select
        v-model="employeeCreateForm.department_id"
        class="modal-select"
      >
        <option
          v-for="d in departments"
          :key="d.id || d.department_id"
          :value="d.id || d.department_id"
        >
          {{ d.name }}
        </option>
      </select>
    </label>

    <label class="modal-form__field">
      <span>Участки</span>
      <select
        v-model="employeeCreateForm.sector_ids"
        class="modal-select"
        multiple
      >
        <option
          v-for="s in departmentSectors"
          :key="s.SectorID || s.sector_id || s.id"
          :value="s.SectorID || s.sector_id || s.id"
        >
          №{{ s.Number || s.number }} Участок
        </option>
      </select>
    </label>

    <div class="modal-form__footer">
      <UiButton
        type="button"
        variant="secondary"
        @click="closeEditEmployeeModal"
      >
        Отмена
      </UiButton>
      <UiButton
        type="submit"
        variant="primary"
      >
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
          Вы уверены, что хотите удалить
          <strong>
            «{{ deletingEmployee ? formatUserName(deletingEmployee) : '' }}»
          </strong>
          ?
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
      <span>ЖСН</span>
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
      <UiButton
        type="submit"
        variant="primary"
      >
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
          Вы уверены, что хотите удалить
          <strong>
            «{{ deletingPatient ? formatUserName(deletingPatient) : '' }}»
          </strong>
          ?
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

    <UiModal
      v-if="isPatientsExcelErrorModalOpen"
      title="Ошибка"
      @close="isPatientsExcelErrorModalOpen = false"
    >
      <div class="modal-delete">
        <p class="modal-delete__text">
          {{ patientsExcelError || 'Сначала выберите нозологию перед загрузкой файла' }}
        </p>

        <div class="modal-delete__footer">
          <UiButton
            type="button"
            variant="primary"
            @click="isPatientsExcelErrorModalOpen = false"
          >
            Ок
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router/index.js'
import PolyclinicApi from '../api/models/PolyclinicApi'
import DepartmentApi from '../api/models/DepartmentApi'
import UsersApi from '../api/models/UsersApi'
import UiButton from '../components/UI/UiButton.vue'
import UiModal from '../components/UI/UiModal.vue'
import UiInput from '../components/UI/UiInput.vue'

const route = useRoute()
const polyclinicId = ref(route.params.id)
const polyclinicName = ref('')


const goToDepartment = (dept) => {
  router.push({ name: 'DepartmentPage', params: { id: dept.department_id } })
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

const currentTabLabel = computed(() => {
  if (activeTab.value === 'departments') return 'Отделения'
  if (activeTab.value === 'employees') return 'Сотрудники'
  if (activeTab.value === 'patients') return 'Пациенты'
  return ''
})

// активный таб: departments | employees | patients
const activeTab = ref('departments')

// данные
const departments = ref([])
const employees = ref([])
const patients = ref([])

// загрузка
const loadingDepartments = ref(false)
const loadingEmployees = ref(false)
const loadingPatients = ref(false)

// модалки для сотрудников
const isEmployeeDeleteModalOpen = ref(false)
const deletingEmployee = ref(null)

const isEmployeeEditModalOpen = ref(false)
const editingEmployee = ref(null)
const editForm = ref({
  last_name: '',
  first_name: '',
  middle_name: '',
  phone_number: '',
})

// модалка для пациентов (удаление)
const isPatientDeleteModalOpen = ref(false)
const deletingPatient = ref(null)

const isPatientEditModalOpen = ref(false)
const editingPatient = ref(null)
const patientEditForm = ref({
  last_name: '',
  first_name: '',
  middle_name: '',
  iin: '',
  phone_number: '',
  birth_date: '',
  gender: 'male',
  address: '',
  mail: '',
  height_cm: null,
  weight_kg: null,
  blood_pressure: '',
  sugar_level: null,
  heart_rate: null,
})

// поиск
const searchQuery = ref('')

// создание отделения
const isDeptCreateModalOpen = ref(false)
const deptForm = ref({
  name: '',
})

// создание сотрудника
const isEmployeeCreateModalOpen = ref(false)
const employeeCreateForm = ref({
  last_name: '',
  first_name: '',
  middle_name: '',
  phone_number: '',
  gender: 'F',
  address: '',
  mail: '',
  birth_date: '',
  role_id: 3,
  department_id: null,
  sector_ids: [],
})

// загрузка пациентов из Excel (UI)
const patientsFile = ref(null)
const isPatientsUploading = ref(false)
const patientsExcelError = ref('')

const isPatientsExcelErrorModalOpen = ref(false)

const selectedDiseaseForPatientsExcel = ref('')

const diseasesOptions = [
  { id: 1, label: 'АГ' },
  { id: 2, label: 'ХСН' },
  { id: 3, label: 'СД' },
]


const employeesFile = ref(null)
const isEmployeesUploading = ref(false)

// редактирование отделения
const isDeptEditModalOpen = ref(false)
const deptEditForm = ref({
  id: null,
  name: '',
})

// удаление отделения
const isDeptDeleteModalOpen = ref(false)
const deletingDepartment = ref(null)

// список ролей для select
const rolesOptions = [
  { id: 1, label: 'polyclinic_manager' },
  { id: 2, label: 'sector_manager' },
  { id: 3, label: 'med_staff' },
  { id: 5, label: 'department_manager' },
]

// сектора выбранного отделения
const departmentSectors = ref([])

const fetchDepartmentSectors = async (departmentId) => {
  if (!departmentId) {
    departmentSectors.value = []
    return
  }
  try {
    const res = await DepartmentApi.getSectors(departmentId)
    const data = res?.data || res
    departmentSectors.value = Array.isArray(data) ? data : data.items || []
  } catch (e) {
    console.error('Ошибка при получении секторов отделения:', e)
  }
}

const filteredDepartments = computed(() => {
  if (!searchQuery.value) return departments.value
  const q = searchQuery.value.toLowerCase()
  return departments.value.filter((d) =>
    (d.name || '').toLowerCase().includes(q),
  )
})

const fetchDepartments = async () => {
  if (!polyclinicId.value) return
  loadingDepartments.value = true
  try {
    const res = await PolyclinicApi.getDepartments(polyclinicId.value)
    const data = res?.data || res
    departments.value = Array.isArray(data) ? data : data.items || []
  } catch (e) {
    console.error('Ошибка при получении отделений:', e)
  } finally {
    loadingDepartments.value = false
  }
}

const fetchEmployees = async (query = '') => {
  if (!polyclinicId.value) return
  loadingEmployees.value = true
  try {
    const res = await UsersApi.getUsers({
      polyclinic_id: polyclinicId.value,
      role_id: '1,2,3,5',
      query: query || undefined,
    })
    const data = res?.data || res
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : data.items || []

    employees.value = list
  } catch (e) {
    console.error('Ошибка при получении сотрудников:', e)
  } finally {
    loadingEmployees.value = false
  }
}

const fetchPatients = async (query = '') => {
  if (!polyclinicId.value) return
  loadingPatients.value = true
  try {
    const res = await UsersApi.getUsers({
      polyclinic_id: polyclinicId.value,
      role_id: 4,
      query: query || undefined,
    })
    const data = res?.data || res
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : data.items || []

    patients.value = list
  } catch (e) {
    console.error('Ошибка при получении пациентов:', e)
  } finally {
    loadingPatients.value = false
  }
}

const changeTab = (tab) => {
  activeTab.value = tab

  if (tab === 'departments') {
    if (!departments.value.length) fetchDepartments()
  } else if (tab === 'employees') {
    if (!employees.value.length) fetchEmployees(searchQuery.value)
  } else if (tab === 'patients') {
    if (!patients.value.length) fetchPatients(searchQuery.value)
  }
}

const onSearch = () => {
  if (activeTab.value === 'employees') {
    fetchEmployees(searchQuery.value)
  } else if (activeTab.value === 'patients') {
    fetchPatients(searchQuery.value)
  }
}

// создание отделения
const openCreateDepartmentModal = () => {
  deptForm.value = { name: '' }
  isDeptCreateModalOpen.value = true
}

const closeCreateDepartmentModal = () => {
  isDeptCreateModalOpen.value = false
}

const saveDepartment = async () => {
  if (!deptForm.value.name || !polyclinicId.value) return
  try {
    await DepartmentApi.createDepartment({
      name: deptForm.value.name,
      polyclinic_id: Number(polyclinicId.value),
    })
    await fetchDepartments()
  } catch (e) {
    console.error('Ошибка при создании отделения:', e)
  } finally {
    closeCreateDepartmentModal()
  }
}

// создание сотрудника
const onEditDepartment = (dept) => {
  deptEditForm.value = {
    id: dept.id || dept.department_id,
    name: dept.name || '',
  }
  isDeptEditModalOpen.value = true
}

const closeEditDepartmentModal = () => {
  isDeptEditModalOpen.value = false
  deptEditForm.value = { id: null, name: '' }
}

const saveEditDepartment = async () => {
  if (!deptEditForm.value.id || !deptEditForm.value.name || !polyclinicId.value) return
  try {
    await DepartmentApi.updateDepartment(deptEditForm.value.id, {
      name: deptEditForm.value.name,
      polyclinic_id: Number(polyclinicId.value),
    })
    await fetchDepartments()
  } catch (e) {
    console.error('Ошибка при обновлении отделения:', e)
  } finally {
    closeEditDepartmentModal()
  }
}

const onDeleteDepartment = (dept) => {
  deletingDepartment.value = dept
  isDeptDeleteModalOpen.value = true
}

const cancelDeleteDepartment = () => {
  isDeptDeleteModalOpen.value = false
  deletingDepartment.value = null
}

const confirmDeleteDepartment = async () => {
  if (!deletingDepartment.value) return
  const id = deletingDepartment.value.id || deletingDepartment.value.department_id
  if (!id) return
  try {
    await DepartmentApi.deleteDepartment(id)
    await fetchDepartments()
  } catch (e) {
    console.error('Ошибка при удалении отделения:', e)
  } finally {
    cancelDeleteDepartment()
  }
}
const openCreateEmployeeModal = async () => {
  // если отделения ещё не загружены — подгрузим
  if (!departments.value.length) {
    await fetchDepartments()
  }

  const defaultDeptId =
    departments.value[0]?.id || departments.value[0]?.department_id || null

  employeeCreateForm.value = {
    last_name: '',
    first_name: '',
    middle_name: '',
    phone_number: '',
    gender: 'F',
    address: '',
    mail: '',
    birth_date: '',
    role_id: 3,
    department_id: defaultDeptId,
    sector_ids: [],
  }

  if (defaultDeptId) {
    await fetchDepartmentSectors(defaultDeptId)
  }

  isEmployeeCreateModalOpen.value = true
}

const closeCreateEmployeeModal = () => {
  isEmployeeCreateModalOpen.value = false
}

const saveCreatedEmployee = async () => {
  if (!employeeCreateForm.value.last_name || !employeeCreateForm.value.first_name) return
  if (!polyclinicId.value) return

  try {
    const payload = {
      first_name: employeeCreateForm.value.first_name,
      last_name: employeeCreateForm.value.last_name,
      middle_name: employeeCreateForm.value.middle_name,
      phone_number: employeeCreateForm.value.phone_number,
      gender: employeeCreateForm.value.gender,
      address: employeeCreateForm.value.address,
      mail: employeeCreateForm.value.mail,
      birth_date: employeeCreateForm.value.birth_date,
      role_id: Number(employeeCreateForm.value.role_id),
      polyclinic_id: Number(polyclinicId.value),
      department_id: employeeCreateForm.value.department_id
        ? Number(employeeCreateForm.value.department_id)
        : null,
    }

    if (employeeCreateForm.value.sector_ids && employeeCreateForm.value.sector_ids.length) {
      payload.sector_ids = employeeCreateForm.value.sector_ids.map((id) => Number(id))
    }

    await UsersApi.createEmployee(payload)
    await fetchEmployees(searchQuery.value)
  } catch (e) {
    console.error('Ошибка при создании сотрудника:', e)
  } finally {
    closeCreateEmployeeModal()
  }
}

const onPatientsFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  patientsExcelError.value = ''

  if (!selectedDiseaseForPatientsExcel.value) {
    patientsExcelError.value = 'Сначала выберите нозологию перед загрузкой файла'
    isPatientsExcelErrorModalOpen.value = true
    if (event.target) {
      event.target.value = ''
    }
    return
  }

  if (!polyclinicId.value) {
    console.error('polyclinicId не задан — нельзя отправить Excel пациентов')
    return
  }

  patientsFile.value = file

  try {
    isPatientsUploading.value = true

    await PolyclinicApi.uploadPatientsExcel(
      Number(polyclinicId.value),
      Number(selectedDiseaseForPatientsExcel.value),
      file,
    )

    // после успешного импорта просто обновляем список пациентов
    await fetchPatients(searchQuery.value)
    patientsExcelError.value = ''
    isPatientsExcelErrorModalOpen.value = false
  } catch (e) {
    console.error('Ошибка при загрузке Excel пациентов:', e)
    // если бэк вернёт текст ошибки, можно так же, как с employees, прочитать Blob
    if (e.response && e.response.data instanceof Blob) {
      try {
        const errorText = await e.response.data.text()
        console.log('Ответ бэка (patient excel):', errorText)
      } catch (readErr) {
        console.error('Не удалось прочитать текст ошибки (patients excel):', readErr)
      }
    }
  } finally {
    isPatientsUploading.value = false
    if (event.target) {
      event.target.value = ''
    }
  }
}

const onEmployeesFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  employeesFile.value = file

  if (!polyclinicId.value) {
    console.error('polyclinicId не задан — нельзя отправить Excel')
    return
  }

  try {
    isEmployeesUploading.value = true

    const blob = await PolyclinicApi.uploadEmployeesExcel(
      Number(polyclinicId.value),
      file,
    )

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'employees_result.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)

    await fetchEmployees(searchQuery.value)
    } catch (e) {
    console.error('Ошибка при загрузке Excel сотрудников:', e)

    // Попробуем прочитать текст ошибки от бэка
    if (e.response && e.response.data instanceof Blob) {
      try {
        const errorText = await e.response.data.text()
        console.log('Ответ бэка (400):', errorText)
      } catch (readErr) {
        console.error('Не удалось прочитать текст ошибки:', readErr)
      }
    }
  } finally {
    isEmployeesUploading.value = false
    if (event.target) {
      event.target.value = ''
    }
  }
}

const formatUserName = (user) => {
  const last =
    user.last_name || user.lastName || user.LastName || ''
  const first =
    user.first_name || user.firstName || user.FirstName || ''
  const middle =
    user.middle_name || user.middleName || user.MiddleName || ''

  return [last, first, middle].filter(Boolean).join(' ')
}

const getRoleName = (user) => {
  const roles = user.Roles || user.roles || []
  const roleId = Array.isArray(roles) ? roles[0] : roles

  const map = {
    1: 'Менеджер',
    2: 'Врач',
    3: 'Медсестра',
    5: 'Зав. отделением',
  }

  return map[roleId] || `Роль ${roleId ?? ''}`
}

const getDepartmentName = (user) => {
  const deps = user.Departments || user.departments || []
  if (!Array.isArray(deps) || !deps.length) return ''
  return deps[0].name || ''
}

const getSectorName = (user) => {
  const sectors = user.Sectors || user.sectors || []
  if (!Array.isArray(sectors) || !sectors.length) return ''
  return sectors[0].Number || sectors[0].number || ''
}

const onEditPatient = async (p) => {
  const id = p.UserID || p.user_id || p.id
  if (!id) return
  try {
    const res = await UsersApi.getUserById(id)
    const data = res?.data || res

    editingPatient.value = data
    patientEditForm.value = {
      last_name: data.last_name || data.LastName || '',
      first_name: data.first_name || data.FirstName || '',
      middle_name: data.middle_name || data.MiddleName || '',
      iin: data.iin || data.IIN || '',
      phone_number: data.phone_number || data.PhoneNumber || '',
      birth_date: data.birth_date || data.BirthDate || '',
      gender: data.gender || data.Gender || 'male',
      address: data.address || data.Address || '',
      mail: data.mail || data.Mail || '',
      height_cm: data.height_cm ?? data.HeightCM ?? null,
      weight_kg: data.weight_kg ?? data.WeightKG ?? null,
      blood_pressure: data.blood_pressure || data.BloodPressure || '',
      sugar_level: data.sugar_level ?? data.SugarLevel ?? null,
      heart_rate: data.heart_rate ?? data.HeartRate ?? null,
    }

    isPatientEditModalOpen.value = true
  } catch (e) {
    console.error('Ошибка при получении пациента:', e)
  }
}

const closeEditPatientModal = () => {
  isPatientEditModalOpen.value = false
  editingPatient.value = null
}

const savePatient = async () => {
  if (!editingPatient.value) return
  const id =
    editingPatient.value.UserID ||
    editingPatient.value.user_id ||
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
    await fetchPatients(searchQuery.value)
  } catch (e) {
    console.error('Ошибка при обновлении пациента:', e)
  } finally {
    closeEditPatientModal()
  }
}

const onEditEmployee = (emp) => {
  editingEmployee.value = emp

  const roles = emp.Roles || emp.roles || []
  const roleId = Array.isArray(roles) ? roles[0] : roles || 3

  const deps = emp.Departments || emp.departments || []
  const deptId = Array.isArray(deps) && deps.length
    ? deps[0].department_id || deps[0].id
    : null

  const sectors = emp.Sectors || emp.sectors || []
  const sectorIds = Array.isArray(sectors)
    ? sectors.map((s) => s.sector_id || s.SectorID || s.id)
    : []

  employeeCreateForm.value = {
    last_name: emp.last_name || emp.LastName || '',
    first_name: emp.first_name || emp.FirstName || '',
    middle_name: emp.middle_name || emp.MiddleName || '',
    phone_number: emp.phone_number || emp.PhoneNumber || '',
    gender: emp.gender || emp.Gender || 'F',
    address: emp.address || emp.Address || '',
    mail: emp.mail || emp.Mail || '',
    birth_date: emp.birth_date || emp.BirthDate || '',
    role_id: roleId,
    department_id: deptId,
    sector_ids: sectorIds,
  }

  if (deptId) {
    fetchDepartmentSectors(deptId)
  }

  isEmployeeEditModalOpen.value = true
}

const closeEditEmployeeModal = () => {
  isEmployeeEditModalOpen.value = false
  editingEmployee.value = null
  employeeCreateForm.value = {
    last_name: '',
    first_name: '',
    middle_name: '',
    phone_number: '',
    gender: 'F',
    address: '',
    mail: '',
    birth_date: '',
    role_id: 3,
    department_id: null,
    sector_ids: [],
  }
}

const saveEmployee = async () => {
  if (!editingEmployee.value) return
  const id =
    editingEmployee.value.UserID ||
    editingEmployee.value.user_id ||
    editingEmployee.value.id
  if (!id) return

  try {
    const payload = {
      first_name: employeeCreateForm.value.first_name,
      last_name: employeeCreateForm.value.last_name,
      middle_name: employeeCreateForm.value.middle_name,
      phone_number: employeeCreateForm.value.phone_number,
      gender: employeeCreateForm.value.gender,
      address: employeeCreateForm.value.address,
      mail: employeeCreateForm.value.mail,
      birth_date: employeeCreateForm.value.birth_date,
      role_id: Number(employeeCreateForm.value.role_id),
      department_id: employeeCreateForm.value.department_id
        ? Number(employeeCreateForm.value.department_id)
        : null,
    }

    if (
      employeeCreateForm.value.sector_ids &&
      employeeCreateForm.value.sector_ids.length
    ) {
      payload.sector_ids = employeeCreateForm.value.sector_ids.map((val) =>
        Number(val),
      )
    }

    await UsersApi.updateUser(id, payload)
    await fetchEmployees(searchQuery.value)
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
  isEmployeeDeleteModalOpen.value = false
  deletingEmployee.value = null
}

const confirmDeleteEmployee = async () => {
  if (!deletingEmployee.value) return
  try {
    await UsersApi.deleteUser(
      deletingEmployee.value.UserID || deletingEmployee.value.user_id || deletingEmployee.value.id,
    )
    await fetchEmployees()
  } catch (e) {
    console.error('Ошибка при удалении сотрудника:', e)
  } finally {
    cancelDeleteEmployee()
  }
}

const onDeletePatient = (p) => {
  deletingPatient.value = p
  isPatientDeleteModalOpen.value = true
}

const cancelDeletePatient = () => {
  isPatientDeleteModalOpen.value = false
  deletingPatient.value = null
}

const confirmDeletePatient = async () => {
  if (!deletingPatient.value) return
  try {
    await UsersApi.deleteUser(
      deletingPatient.value.UserID || deletingPatient.value.user_id || deletingPatient.value.id,
    )
    await fetchPatients()
  } catch (e) {
    console.error('Ошибка при удалении пациента:', e)
  } finally {
    cancelDeletePatient()
  }
}

onMounted(() => {
  fetchPolyclinicInfo()
  fetchDepartments()
})

// если id в роуте поменяется — обновим данные
watch(
  () => route.params.id,
  (newId) => {
    polyclinicId.value = newId
    departments.value = []
    employees.value = []
    patients.value = []
    activeTab.value = 'departments'
    fetchPolyclinicInfo()
    fetchDepartments()
  },
)
watch(
  () => employeeCreateForm.value.department_id,
  (newDeptId) => {
    if (newDeptId) {
      fetchDepartmentSectors(newDeptId)
    } else {
      departmentSectors.value = []
    }
  },
)
</script>

<style scoped>
.polyclinic-detail {
  padding: 24px;
}

.polyclinic-detail__breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.crumb-sep {
  color: #9ca3af;
}

/* Табы */
.polyclinic-detail__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

/* Контент */
.polyclinic-detail__content {
  margin-top: 8px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px 20px 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

/* Таблички */
.section-table {
  margin-top: 4px;
}

.section-table__header {
  display: grid;
  grid-template-columns: 3fr 2fr;
  padding: 10px 12px;
  background: #eef4ff;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.section-table__row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  padding: 10px 12px;
  font-size: 14px;
  border-top: 1px solid #f3f4f6;
}

.col {
  display: flex;
  align-items: center;
}

.col--name {
  justify-content: flex-start;
}

.col--role,
.col--phone {
  justify-content: flex-start;
}

.section-empty {
  padding: 16px 4px;
  font-size: 14px;
  color: #6b7280;
}

.section-table__header--employees,
.section-table__row--employees {
  display: grid;
  grid-template-columns: 2.4fr 1.4fr 2fr 2fr 2fr 1.4fr;
  column-gap: 8px;
}

.section-table__header--patients,
.section-table__row--patients {
  display: grid;
  grid-template-columns: 2.4fr 2fr 2fr 2fr 1.4fr;
  column-gap: 8px;
}

.section-table__header--departments,
.section-table__row--departments {
  display: grid;
  grid-template-columns: 3fr 1.5fr 1.5fr 1.5fr;
  column-gap: 8px;
}

.col--count {
  justify-content: flex-start;
}

.col--actions {
  justify-content: flex-end;
  gap: 4px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.icon-btn:hover {
  background: rgba(37, 99, 235, 0.08);
}

/* модалки для сотрудников (повторяем стили из Main.vue) */
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

.modal-form__field input {
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  font-size: 14px;
}

.modal-form__footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .modal-form {
    grid-template-columns: 1fr;
  }
}

.modal-delete {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-delete__text {
  font-size: 14px;
  color: #111827;
}

.modal-delete__text strong {
  font-weight: 600;
}

.modal-delete__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.polyclinic-detail__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.polyclinic-detail__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  max-width: 480px;
}
.polyclinic-detail__select {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 6px 12px;
  font-size: 14px;
  background: #ffffff;
}

.polyclinic-detail__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.polyclinic-detail__file .file-upload {
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  border: 1px dashed #9ca3af;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
}

.file-upload input[type='file'] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.file-upload__text {
  white-space: nowrap;
}

.modal-select {
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  font-size: 14px;
  background: #ffffff;
}
</style>
<style scoped>
.polyclinic-detail__error {
  font-size: 12px;
  color: #ef4444;
}
</style>