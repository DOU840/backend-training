const API_URL = import.meta.env.VITE_API_URL
const TOKEN_KEY = 'token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function formatApiError(data, status) {
  const error = new Error(data?.error || `Erreur ${status}`)
  error.status = status
  error.details = data?.details
  return error
}

async function parseJson(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

/**
 * Client HTTP vers l'API backend.
 * @param {string} path - Chemin relatif, ex: '/auth/login'
 * @param {RequestInit & { body?: object }} options
 */
export async function api(path, options = {}) {
  const { body, headers: extraHeaders, ...rest } = options
  const token = getToken()

  const headers = {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...extraHeaders,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await parseJson(response)

  const isAuthForm =
    path === '/auth/login' || path === '/auth/register'

  if (response.status === 401 && !isAuthForm) {
    localStorage.removeItem(TOKEN_KEY)
    window.location.href = '/login'
    throw formatApiError(data, 401)
  }

  if (!response.ok) {
    throw formatApiError(data, response.status)
  }

  return data
}

export const get = (path, options) => api(path, { ...options, method: 'GET' })
export const post = (path, body, options) =>
  api(path, { ...options, method: 'POST', body })
export const put = (path, body, options) =>
  api(path, { ...options, method: 'PUT', body })
export const del = (path, options) => api(path, { ...options, method: 'DELETE' })
