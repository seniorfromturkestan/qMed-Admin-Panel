import axios from 'axios'

const instance = axios.create({
  // baseURL: 'https://qmedback.mooo.com',
  // baseURL: 'https://qmedbackprod.chickenkiller.com',
  baseURL: 'https://qmedback.qbots.kz',
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
})

instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token')

    if (accessToken) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type']
        delete config.headers['content-type']
      }
    } else {
      if (config.headers && !config.headers['Content-Type'] && !config.headers['content-type']) {
        config.headers['Content-Type'] = 'application/json'
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('role')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      localStorage.removeItem('accessToken')
      alert('У вас нет доступа к админке.')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }      
    }

    return Promise.reject(error)
  },
)

export default instance