import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { del, get, post, put } from '../api' // Ajout de 'put'
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

  // --- NOUVEAUX ÉTATS ---
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ total: 0, termine: 0, enCours: 0 })
  const [updatingId, setUpdatingId] = useState(null)

  // --- MODIFICATION : on passe la page en paramètre ---
  async function loadTasks(currentPage = 1) {
    setErreur('')
    setLoading(true)
    try {
      // On demande la page actuelle avec 5 tâches par page
      const res = await get(`/tasks?page=${currentPage}&limit=5`)
      setTasks(res.data ?? [])
      setTotalPages(res.totalPages ?? 1) // On récupère le total de pages
    } catch (err) {
      setErreur(err.message || 'Impossible de charger les tâches')
    } finally {
      setLoading(false)
    }
  }

  // --- NOUVEAU : Charger les stats ---
  async function loadStats() {
    try {
      const res = await get('/tasks/stats')
      setStats(res.data) // { total, terminees, enCours }
    } catch (err) {
      console.error("Erreur stats", err)
    }
  }

  // Au chargement, on charge les tâches de la page 1 et les stats
  useEffect(() => {
    loadTasks(page)
    loadStats()
  }, [page]) // Se relance si la page change

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    setErreur('')
    try {
      await post('/tasks', { titre, description })
      setTitre('')
      setDescription('')
      await loadTasks(page) // On reste sur la page actuelle
      await loadStats() // On met à jour les stats
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
      await loadTasks(page)
      await loadStats()
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  // --- NOUVEAU : Marquer comme terminé ---
  async function toggleTermine(task) {
    setUpdatingId(task._id)
    try {
      // On envoie l'inverse de la valeur actuelle
      await put(`/tasks/${task._id}`, { termine: !task.termine })
      await loadTasks(page)
      await loadStats()
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setUpdatingId(null)
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

        {/* --- NOUVEAU : Barre de statistiques --- */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 text-sm">Terminées</p>
            <p className="text-2xl font-bold text-green-400">{stats.termine}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 text-sm">En cours</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.enCours}</p>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <form onSubmit={handleCreate} className="mb-10 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          {/* ... (inchangé) ... */}
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
                <div className="flex items-start gap-3">
                  {/* --- NOUVEAU : Case à cocher pour "termine" --- */}
                  <input 
                    type="checkbox" 
                    checked={task.termine} 
                    onChange={() => toggleTermine(task)}
                    disabled={updatingId === task._id}
                    className="mt-1 w-5 h-5 accent-green-500 cursor-pointer"
                  />
                  <div>
                    <h3 className={`text-lg font-semibold ${task.termine ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.titre}
                    </h3>
                    {task.description && <p className="text-slate-400 mt-1">{task.description}</p>}
                  </div>
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

        {/* --- NOUVEAU : Boutons de pagination --- */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 hover:bg-slate-700 transition"
          >
            Précédent
          </button>
          <span className="text-slate-400 text-sm">Page {page} sur {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 hover:bg-slate-700 transition"
          >
            Suivant
          </button>
        </div>

      </div>
    </div>
  )
}