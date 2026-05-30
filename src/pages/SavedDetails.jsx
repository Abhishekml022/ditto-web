import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { FORMAT_SPECIFIC } from '../config/formatFields'
import '../App.css'

export default function SavedDetails() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db, 'saved_details'),
          where('uid', '==', user.uid)
        )
        const snap = await getDocs(q)
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        docs.sort((a, b) => {
          const ta = a.created_at?.toDate?.() ?? new Date(0)
          const tb = b.created_at?.toDate?.() ?? new Date(0)
          return tb - ta
        })
        setItems(docs)
      } catch (err) {
        console.error(err)
        setError('Failed to load saved orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [user])

  const handleUse = (item) => {
    const { id: _id, uid: _uid, name: _name, created_at: _created_at, format, ...prefillData } = item
    navigate('/new', { state: { formatId: format, prefillData } })
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteDoc(doc(db, 'saved_details', id))
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Header />
      <div className="orders-page">
        <div className="orders-header">
          <div>
            <h2>Saved Orders</h2>
            <p>Reuse saved agreement details to quickly create new agreements.</p>
          </div>
          <button className="btn-action btn-next" onClick={() => navigate('/agreement-formats')}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Agreement
          </button>
        </div>

        {loading ? (
          <div className="orders-state">
            <div className="loader-spinner" style={{ margin: '0 auto' }} />
            <p>Loading saved orders…</p>
          </div>
        ) : error ? (
          <div className="orders-state orders-state--error">
            <p>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="orders-state">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.3 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <p>No saved orders yet.</p>
            <p style={{ fontSize: 13 }}>After generating an agreement, click "Save Details" on the success screen.</p>
          </div>
        ) : (
          <div className="saved-cards-grid">
            {items.map((item) => {
              const createdAt = item.created_at?.toDate?.()
                ? item.created_at.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : ''
              const formatChip = FORMAT_SPECIFIC[item.format]?.displayId || item.format
              return (
                <div key={item.id} className="saved-card">
                  <div className="saved-card__header">
                    <div className="saved-card__name">{item.name}</div>
                    <span className="order-format-chip">{formatChip}</span>
                  </div>
                  <div className="saved-card__details">
                    {item.owner_name && (
                      <div className="saved-card__row">
                        <span className="saved-card__label">Owner</span>
                        <span>{item.owner_name}</span>
                      </div>
                    )}
                    {item.tenant_name && (
                      <div className="saved-card__row">
                        <span className="saved-card__label">Tenant</span>
                        <span>{item.tenant_name}</span>
                      </div>
                    )}
                    {item.rent && (
                      <div className="saved-card__row">
                        <span className="saved-card__label">Rent</span>
                        <span>₹{Number(item.rent).toLocaleString('en-IN')} / month</span>
                      </div>
                    )}
                    {item.owner_address && (
                      <div className="saved-card__row">
                        <span className="saved-card__label">Property</span>
                        <span className="saved-card__address">{item.owner_address}</span>
                      </div>
                    )}
                  </div>
                  {createdAt && (
                    <div className="saved-card__date">Saved on {createdAt}</div>
                  )}
                  <div className="saved-card__actions">
                    <button className="btn-action btn-next" onClick={() => handleUse(item)}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      Use Saved Details
                    </button>
                    <button
                      className="btn-action btn-back saved-card__delete"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
