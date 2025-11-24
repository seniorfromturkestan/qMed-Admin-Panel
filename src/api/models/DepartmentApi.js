import ApiEndpoint from '../ApiEndpoint'

export default class DepartmentApi {
  // Создать департамент
  static createDepartment(data) {
    // { name, polyclinic_id }
    return ApiEndpoint.makeRequest('POST', '/admin/department', data)
  }

  static getDepartment(id) {
    return ApiEndpoint.makeRequest('GET', `/admin/department/${id}`, )
  }

  // Обновить департамент
  static updateDepartment(id, data) {
    return ApiEndpoint.makeRequest('PUT', `/admin/department/${id}`, data)
  }

  // Удалить департамент
  static deleteDepartment(id) {
    return ApiEndpoint.makeRequest('DELETE', `/admin/department/${id}`)
  }

  // Секторы департамента
  static getSectors(departmentId) {
    return ApiEndpoint.makeRequest('GET', `/admin/department/${departmentId}/sectors`)
  }

  // Назначение менеджера департамента
  static assignManager(departmentId, userId) {
    return ApiEndpoint.makeRequest('POST', `/admin/department/${departmentId}/manager`, {
      user_id: userId,
    })
  }

  // Список менеджеров департамента
  static getManagers(departmentId) {
    return ApiEndpoint.makeRequest('GET', `/admin/department/${departmentId}/managers`)
  }

  // Удаление менеджера департамента
  static removeManager(departmentId, userId) {
    return ApiEndpoint.makeRequest(
      'DELETE',
      `/admin/department/${departmentId}/manager/${userId}`,
    )
  }
}