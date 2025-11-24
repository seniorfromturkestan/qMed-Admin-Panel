import ApiEndpoint from '../ApiEndpoint'

export default class UsersApi {
  // ===== Работник (employee) =====
  static createEmployee(data) {
    // body как в Postman:
    // {
    //  first_name, last_name, middle_name,
    //  phone_number, gender, address, mail,
    //  birth_date, role_id, polyclinic_id, department_id?, sector_ids?
    // }
    return ApiEndpoint.makeRequest('POST', '/admin/employee', data)
  }

  // ===== Пациент =====
  static createPatient(data) {
    // body как в Postman (height_cm, weight_kg, visit_data и т.п.)
    return ApiEndpoint.makeRequest('POST', '/admin/patient', data)
  }

  // ===== Общие юзеры (admin/users) =====

  // Список юзеров + фильтры
  // UsersApi
  static getUsers(params = {}) {
    return ApiEndpoint.makeRequest('GET', '/admin/users', null, params)
  }

  // Получить юзера по ID
  static getUserById(id) {
    return ApiEndpoint.makeRequest('GET', `/admin/users/${id}`)
  }

  // Создание юзера (ручное)
  static createUser(data) {
    return ApiEndpoint.makeRequest('POST', '/admin/users', data)
  }

  // Обновление юзера
  static updateUser(id, data) {
    // например: { sector_ids: [1,2,3] } или любые другие поля
    return ApiEndpoint.makeRequest('PUT', `/admin/users/${id}`, data)
  }

  // Установка/смена пароля юзера
  static setUserPassword(userId, newPassword) {
    return ApiEndpoint.makeRequest('POST', '/admin/user/password', {
      user_id: userId,
      new_password: newPassword,
    })
  }
}