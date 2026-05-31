import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../App.css'

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [userMap, setUserMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAdmin = user?.email === 'admin@goditto.in'

  useEffect(() => {
    if (!user) return
const fetchOrders = async () => {
      try {
        const q = isAdmin
          ? query(collection(db, 'orders'))
          : query(collection(db, 'orders'), where('uid', '==', user.uid))
        const snapshot = await getDocs(q)
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        docs.sort((a, b) => {
          const ta = a.created_at?.toDate?.() ?? new Date(0)
          const tb = b.created_at?.toDate?.() ?? new Date(0)
          return tb - ta
        })
        setOrders(docs)

        if (isAdmin) {
          const uids = [...new Set(docs.map((d) => d.uid).filter(Boolean))]
          const entries = await Promise.all(
            uids.map(async (uid) => {
              const snap = await getDoc(doc(db, 'Users', uid))
              return [uid, snap.exists() ? snap.data() : null]
            })
          )
          setUserMap(Object.fromEntries(entries))
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  const formatDate = (ts) => {
    if (!ts) return '—'
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <Header />

      <div className="orders-page">
        {/* Page Header */}
        <div className="orders-header">
          <div>
            <h2>My Orders</h2>
            <p>All rental agreements generated through Ditto.</p>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="orders-state">
            <div className="loader-spinner" style={{ margin: '0 auto' }} />
            <p>Loading orders…</p>
          </div>
        )}

        {error && (
          <div className="orders-state orders-state--error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-state">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', margin: '0 auto' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <p>No agreements found.</p>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Date</th>
                  <th style={{ width: '160px' }}>Order ID</th>
                  <th style={{ width: '80px' }}>Format</th>
                  <th>Owner</th>
                  <th>Tenant</th>
                  {isAdmin && <th>Created By</th>}
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><div className="order-date">{formatDate(order.created_at)}</div></td>
                    <td><span className="order-badge">{order.order_id || '—'}</span></td>
                    <td><span className="order-format-chip">{order.format === 'english-flat' ? 'DTT-002' : order.format === 'english-standard-classic' ? 'DTT-003' : order.format === 'malayalam-standard' ? 'DTT-MAL-01' : 'DTT-001'}</span></td>
                    <td>
                      <div className="order-name-highlight">{order.owner_name || '—'}</div>
                      <div className="order-sub">{order.owner_address || ''}</div>
                    </td>
                    <td>
                      <div className="order-name-highlight">{order.tenant_name || '—'}</div>
                      <div className="order-sub">{order.tenant_address || ''}</div>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="order-name-highlight">
                          {order.uid
                            ? (userMap[order.uid]?.name || userMap[order.uid]?.email || 'Not found')
                            : 'Not found'}
                        </div>
                      </td>
                    )}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn-action btn-back"
                        style={{ padding: '8px 16px', fontSize: 13, whiteSpace: 'nowrap', minWidth: 'max-content' }}
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
