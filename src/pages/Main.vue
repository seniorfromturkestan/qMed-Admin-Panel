<template>
    <div class="polyclinic-page">
      <!-- Верхняя панель: поиск + кнопка -->
      <div class="polyclinic-page__top">
        <div class="polyclinic-page__search">
          <div class="search-input">
            <UiInput
              v-model="search"
              placeholder="Поиск"
              @keyup.enter="onSearch"
            />
          </div>
          <UiButton class="search-btn" variant="secondary" @click="onSearch">
            Искать
          </UiButton>
        </div>
  
        <UiButton variant="primary" @click="onCreateClick">
          Создать поликлинику
        </UiButton>
      </div>
  
      <!-- Таблица -->
      <div class="polyclinic-table">
        <div class="polyclinic-table__header">
          <div class="col col--id">ID</div>
          <div class="col col--name">Название</div>
          <div class="col col--date">Дата создания</div>
          <div class="col col--actions">Действия</div>
        </div>
  
        <div
          v-if="loading"
          class="polyclinic-table__empty"
        >
          Загрузка...
        </div>
  
            <div
            v-else-if="!rows.length"
            class="polyclinic-table__empty"
            >
                Список поликлиник пуст!        
            </div>
  
        <div
          v-else
          v-for="poly in rows"
          :key="poly.id"
          class="polyclinic-table__row"
          @click="goToPolyclinic(poly)"
        >
          <div class="col col--id">
            {{ formatId(poly.id) }}
          </div>
          <div class="col col--name">
            {{ poly.name }}
          </div>
          <div class="col col--date">
            {{ formatDate(poly.created_at) }}
          </div>
          <div class="col col--actions">
            <button
              class="icon-btn"
              type="button"
              @click.stop="onEdit(poly)"
            >
              ✏️
            </button>
            <button
              class="icon-btn"
              type="button"
              @click.stop="onDelete(poly)"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
  
      <!-- Пример модалки (создать/редактировать) -->
      <UiModal
        v-if="isModalOpen"
        :title="modalTitle"
        @close="closeModal"
      >
        <!-- Форму пока просто наброском, потом докрутим -->
        <form class="modal-form" @submit.prevent="onSubmit">
          <label class="modal-form__field">
            <span>Название поликлиники</span>
            <UiInput
              v-model="form.name"
              type="text"
              required
              placeholder="Например, Алматы ГП №3"
            />
          </label>
  
          <div class="modal-form__footer">
            <UiButton
              type="button"
              variant="secondary"
              @click="closeModal"
            >
              Отмена
            </UiButton>
            <UiButton type="submit" variant="primary">
              Сохранить
            </UiButton>
          </div>
        </form>
      </UiModal>

      <!-- Модалка подтверждения удаления -->
      <UiModal
        v-if="isDeleteModalOpen"
        title="Удалить поликлинику"
        @close="cancelDelete"
      >
        <div class="modal-delete">
          <p class="modal-delete__text">
            Вы уверены, что хотите удалить
            <strong>
              «{{ deletingPolyclinic?.name || ('ID ' + deletingPolyclinic?.id) }}»
            </strong>
            ?
          </p>

          <div class="modal-delete__footer">
            <UiButton
              type="button"
              variant="secondary"
              @click="cancelDelete"
            >
              Отмена
            </UiButton>
            <UiButton
              type="button"
              variant="primary"
              @click="confirmDelete"
            >
              Удалить
            </UiButton>
          </div>
        </div>
      </UiModal>
    </div>
  </template>
  
  <script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PolyclinicApi from '../api/models/PolyclinicApi'
import UiButton from '../components/UI/UiButton.vue'
import UiModal from '../components/UI/UiModal.vue'
import UiInput from '../components/UI/UiInput.vue'

// роутер для переходов по id
const router = useRouter()

const polyclinics = ref([])
const loading = ref(false)
const search = ref('')

// Модалка создания/редактирования
const isModalOpen = ref(false)
const modalTitle = ref('Создать поликлинику')
const editingPolyclinic = ref(null)

const form = ref({
  name: '',
})

// Модалка удаления
const isDeleteModalOpen = ref(false)
const deletingPolyclinic = ref(null)

// нормализация поликлиники из ответа бэка
const normalizePolyclinic = (raw) => {
  const id =
    raw?.id ??
    raw?.polyclinic_id ??
    raw?.polyclinicId ??
    raw?.ID

  return {
    id,
    name: raw?.name ?? raw?.title ?? '',
    created_at:
      raw?.created_at ??
      raw?.createdAt ??
      raw?.created_date ??
      raw?.createdDate ??
      null,
    _raw: raw,
  }
}

const fetchPolyclinics = async () => {
  loading.value = true
  try {
    const res = await PolyclinicApi.getPolyclinics()
    const data = res?.data || res

    const items = Array.isArray(data) ? data : data.items || []

    polyclinics.value = items
      .map(normalizePolyclinic)
      .filter((p) => p.id !== undefined && p.id !== null)
  } catch (e) {
    console.error('Ошибка при получении поликлиник:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPolyclinics()
})

const rows = computed(() => {
  if (!search.value.trim()) return polyclinics.value
  const s = search.value.toLowerCase()
  return polyclinics.value.filter((p) =>
    (p.name || '').toLowerCase().includes(s) ||
    String(p.id).includes(s),
  )
})

const onSearch = () => {
  // Сейчас поиск только по фронту.
  // Если бэк будет поддерживать query, тут можно вызвать fetch с параметрами.
}

// открыть модалку удаления
const onDelete = (poly) => {
  if (!poly?.id) {
    console.warn('Нет id у поликлиники для удаления', poly)
    return
  }

  deletingPolyclinic.value = poly
  isDeleteModalOpen.value = true
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  deletingPolyclinic.value = null
}

const confirmDelete = async () => {
  if (!deletingPolyclinic.value?.id) {
    console.warn('Нет id у поликлиники для удаления', deletingPolyclinic.value)
    return
  }

  try {
    await PolyclinicApi.deletePolyclinic(deletingPolyclinic.value.id)
    await fetchPolyclinics()
  } catch (e) {
    console.error('Ошибка при удалении поликлиники:', e)
  } finally {
    isDeleteModalOpen.value = false
    deletingPolyclinic.value = null
  }
}

const formatId = (id) => {
  if (id == null) return ''
  const num = Number(id)
  if (Number.isNaN(num)) return String(id)
  return num.toString().padStart(2, '0')
}

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const dd = d.getDate().toString().padStart(2, '0')
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

// переход "внутрь" поликлиники по id
const goToPolyclinic = (poly) => {
  if (!poly?.id) {
    console.warn('Нет id у поликлиники для перехода', poly)
    return
  }

  // Переход на страницу конкретной поликлиники
  router.push({
    name: 'PolyclinicPage',
    params: { id: poly.id },
    query: { name: poly.name || '' },
  })
}

const onCreateClick = () => {
  editingPolyclinic.value = null
  form.value = { name: '' }
  modalTitle.value = 'Создать поликлинику'
  isModalOpen.value = true
}

const onEdit = (poly) => {
  if (!poly?.id) {
    console.warn('Нет id у поликлиники для редактирования', poly)
    return
  }

  editingPolyclinic.value = poly
  form.value = { name: poly.name || '' }
  modalTitle.value = 'Редактировать поликлинику'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const onSubmit = async () => {
  try {
    if (editingPolyclinic.value && editingPolyclinic.value.id) {
      await PolyclinicApi.updatePolyclinic(editingPolyclinic.value.id, {
        name: form.value.name,
      })
    } else {
      await PolyclinicApi.createPolyclinic({
        name: form.value.name,
      })
    }

    await fetchPolyclinics()
    closeModal()
  } catch (e) {
    console.error('Ошибка при сохранении поликлиники:', e)
  }
}
</script>
  
  <style scoped>
  .polyclinic-page {
    padding: 24px;
  }
  
  /* Верхняя панель */
  .polyclinic-page__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;
  }
  
  .polyclinic-page__search {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .search-input {
    position: relative;
    width: 360px;
    max-width: 100%;
  }
  
  /* Таблица */
  .polyclinic-table {
    margin-top: 8px;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    cursor: pointer;
  }
  
  .polyclinic-table__header {
    display: grid;
    grid-template-columns: 0.7fr 3fr 2fr 1.5fr;
    align-items: center;
    padding: 12px 24px;
    background: #eef4ff;
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }
  
  .polyclinic-table__row {
    display: grid;
    grid-template-columns: 0.7fr 3fr 2fr 1.5fr;
    align-items: center;
    padding: 14px 24px;
    font-size: 14px;
    border-top: 1px solid #f3f4f6;
  }
  
  .polyclinic-table__row:nth-child(odd) {
    background: #ffffff;
  }
  
  .polyclinic-table__row:nth-child(even) {
    background: #f9fafb;
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
  
  .col--date {
    justify-content: flex-start;
  }
  
  .col--actions {
    justify-content: flex-start;
    gap: 8px;
  }
  
  .polyclinic-table__empty {
    padding: 24px;
    text-align: center;
    font-size: 20px;
    color: #000000;
  }
  
  /* Кнопки-иконки */
  .icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: #2563eb;
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }
  
  .icon-btn:hover {
    background: rgba(37, 99, 235, 0.08);
  }
  
  /* Формочка внутри модалки */
  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .modal-form__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
  }
  
  .modal-form__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
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
  </style>