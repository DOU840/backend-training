import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Chargement...</div>
  if (!user) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Utilisateur non connecté.</div>

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Mon Profil</h1>
        
        <div className="space-y-4 mb-8">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400">Nom</p>
            <p className="text-white font-medium text-lg">{user.nom}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-white font-medium text-lg">{user.email}</p>
          </div>
          {user.ville && (
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400">Ville</p>
              <p className="text-white font-medium text-lg">{user.ville}</p>
            </div>
          )}
        </div>

        <Link to="/tasks" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition">
          Retour aux tâches
        </Link>
      </div>
    </div>
  )
}