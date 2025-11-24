import httpClient from './HttpClient.js'

export default class ApiEndpoint {
  static async makeRequest(method, url, data = null, params = null, options = {}, raw = false) {
    const response = await httpClient({
      method,
      url,
      data,
      params,
      ...options,
    })

    return raw ? response : response.data
  }
}
