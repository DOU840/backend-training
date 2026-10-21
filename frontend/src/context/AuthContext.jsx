import { createContext, useContext, useEffect, useState } from 'react'
import { get, post } from '../api'

const TOKEN_KEY = 'token'

const AuthContext = createContext(null)

function persistSession(token, user, setToken, setUser) {
  localStorage.setItem(TOKEN_KEY, token)
  setToken(token)
  setUser(user)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)

    if (!storedToken) {
      setLoading(false)
      return
    }

    get('/auth/me')
      .then((res) => {
        setUser(res.data)
        setToken(storedToken)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  async function login(email, motDePasse) {
    const res = await post('/auth/login', { email, motDePasse })
    persistSession(res.data.token, res.data.userSansMdp, setToken, setUser)
    return res.data
  }

  async function register({ nom, email, motDePasse, age, ville }) {
    const res = await post('/auth/register', {
      nom,
      email,
      motDePasse,
      age,
      ville,
    })
    persistSession(res.data.token, res.data.userSansMdp, setToken, setUser)
    return res.data
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = { user, token, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
