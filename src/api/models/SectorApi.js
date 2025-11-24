import ApiEndpoint from '../ApiEndpoint'

export default class SectorApi {
  // Создание сектора
  static createSector(data) {
    // { number, address, polyclinic_id, department_id }
    return ApiEndpoint.makeRequest('POST', '/admin/sector', data)
  }

  // Обновление сектора
  static updateSector(id, data) {
    return ApiEndpoint.makeRequest('PUT', `/admin/sector/${id}`, data)
  }

  // Получить детальную инфу по сектору
  static getSectorById(id) {
    return ApiEndpoint.makeRequest('GET', `/admin/sector/${id}`)
  }

  // Удаление сектора
  static deleteSector(id) {
    return ApiEndpoint.makeRequest('DELETE', `/admin/sector/${id}`)
  }

  // Назначение менеджера сектора
  static assignManager(sectorId, userId) {
    return ApiEndpoint.makeRequest('POST', `/admin/sector/${sectorId}/manager`, {
      user_id: userId,
    })
  }

  // Удаление менеджера сектора
  static removeManager(sectorId, userId) {
    return ApiEndpoint.makeRequest(
      'DELETE',
      `/admin/sector/${sectorId}/manager/${userId}`,
    )
  }

  // Список менеджеров сектора
  static getManagers(sectorId) {
    return ApiEndpoint.makeRequest('GET', `/admin/sector/${sectorId}/managers`)
  }
}