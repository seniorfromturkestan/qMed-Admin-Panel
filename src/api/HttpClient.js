import axios from 'axios'

const instance = axios.create({
  // baseURL: 'https://qmedback.mooo.com',
  // baseURL: 'https://qmedbackprod.chickenkiller.com',
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
})

instance.interceptors.request.use(
  function (config) {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    } else {
      if (!config.headers['Content-Type'] && !config.headers['content-type']) {
        config.headers['Content-Type'] = 'application/json'
      }
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

export default instance