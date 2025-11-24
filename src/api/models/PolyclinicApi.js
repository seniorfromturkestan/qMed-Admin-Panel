import ApiEndpoint from '../ApiEndpoint'

export default class PolyclinicApi {
  // Создать поликлинику
  static createPolyclinic(data) {
    return ApiEndpoint.makeRequest('POST', '/admin/polyclinic', data)
  }

  // Получить все поликлиники
  static getPolyclinics() {
    return ApiEndpoint.makeRequest('GET', '/admin/polyclinic')
  }

  // Получить поликлинику по ID
  static getPolyclinicById(id) {
    return ApiEndpoint.makeRequest('GET', `/admin/polyclinic/${id}`)
  }

  // Обновить поликлинику
  static updatePolyclinic(id, data) {
    return ApiEndpoint.makeRequest('PUT', `/admin/polyclinic/${id}`, data)
  }

  // Удалить поликлинику
  static deletePolyclinic(id) {
    return ApiEndpoint.makeRequest('DELETE', `/admin/polyclinic/${id}`)
  }

  // Получить департаменты поликлиники
  static getDepartments(id) {
    return ApiEndpoint.makeRequest('GET', `/admin/polyclinic/${id}/departments`)
  }

  // Назначить менеджера поликлиники
  static assignManager(polyclinicId, userId) {
    return ApiEndpoint.makeRequest('POST', `/admin/polyclinic/${polyclinicId}/manager`, {
      user_id: userId,
    })
  }

  // Список менеджеров поликлиники
  static getManagers(polyclinicId) {
    return ApiEndpoint.makeRequest('GET', `/admin/polyclinic/${polyclinicId}/managers`)
  }

  // Удалить менеджера поликлиники
  static removeManager(polyclinicId, userId) {
    return ApiEndpoint.makeRequest(
      'DELETE',
      `/admin/polyclinic/${polyclinicId}/manager/${userId}`,
    )
  }

  static uploadEmployeesExcel(polyclinicId, file) {
    const formData = new FormData()
    formData.append('file', file)
  
    return ApiEndpoint.makeRequest(
      'POST',
      '/admin/employee/excel',
      formData,
      { polyclinic_id: Number(polyclinicId) }, 
      { responseType: 'blob' },               
    )
  }

    // Загрузка пациентов из Excel по нозологии
  static uploadPatientsExcel(polyclinicId, diseaseId, file) {
    const formData = new FormData()
    formData.append('file', file)

    return ApiEndpoint.makeRequest(
      'POST',
      '/admin/patient/excel',
      formData,
      {
        polyclinic_id: Number(polyclinicId),
        disease_id: Number(diseaseId),
      },
    )
  }
}