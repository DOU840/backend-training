import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { del, get, post } from '../api'
import { useAuth } from '../context/AuthContext.jsx'

export default function Tasks() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  
  const [tasks, setTasks] = useState([])
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [erreur, setErreur] = useState('')

  async function loadTasks() {
    setErreur('')
    setLoading(true)
    try {
      const res = await get('/tasks')
      setTasks(res.data ?? [])
    } catch (err) {
      setErreur(err.message || 'Impossible de charger les tâches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    setErreur('')
    try {
      await post('/tasks', { titre, description })
      setTitre('')
      setDescription('')
      await loadTasks()
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      await del(`/tasks/${id}`)
      await loadTasks()
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
          <h1 className="text-3xl font-bold text-white">Mes Tâches</h1>
          <div className="flex gap-4">
            <Link to="/me" className="text-blue-400 hover:text-blue-300 font-medium">Mon Profil</Link>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition">
              Déconnexion
            </button>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <form onSubmit={handleCreate} className="mb-10 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Ajouter une tâche</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Titre de la tâche"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            />
            <textarea
              placeholder="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>

        {/* Messages d'erreur */}
        {erreur && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {erreur}
          </div>
        )}

        {/* Liste des tâches */}
        {loading ? (
          <p className="text-center text-slate-400">Chargement de vos tâches...</p>
        ) : tasks.length === 0 ? (
          <p className="text-center text-slate-400 py-10">Aucune tâche pour le moment. Créez-en une !</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex justify-between items-start group hover:border-slate-500 transition">
                <div>
                  <h3 className="text-lg font-semibold text-white">{task.titre}</h3>
                  {task.description && <p className="text-slate-400 mt-1">{task.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(task._id)}
                  disabled={deletingId === task._id}
                  className="text-slate-500 hover:text-red-400 transition text-sm font-medium"
                >
                  {deletingId === task._id ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}