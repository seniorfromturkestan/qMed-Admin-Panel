import ApiEndpoint from '../ApiEndpoint'

export default class AuthApi {
  static login(username, password) {
    return ApiEndpoint.makeRequest('POST', '/login', {
      username,
      password,
    })
  }
}