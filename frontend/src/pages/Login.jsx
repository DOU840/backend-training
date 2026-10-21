import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setEnCours(true)
    try {
      await login(email, motDePasse)
      navigate('/tasks')
    } catch (err) {
      setErreur(err.message || 'Identifiants invalides')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Connexion</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {erreur && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center">
              {erreur}
            </div>
          )}

          <button
            type="submit"
            disabled={enCours}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {enCours ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}