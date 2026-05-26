import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import Header from '../components/Header'
import '../App.css'

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'Agreements'), orderBy('created_at', 'desc'))
        const snapshot = await getDocs(q)
        setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        console.error(err)
        setError('Failed to load orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

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
            <h2>Previous Orders</h2>
            <p>All rental agreements generated through Ditto.</p>
          </div>
          <button className="btn-action btn-next" onClick={() => navigate('/new')}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Agreement
          </button>
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
            <p>No agreements found. Create your first one.</p>
            <button className="btn-action btn-next" onClick={() => navigate('/new')}>
              Create Agreement
            </button>
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Tenant</th>
                  <th>Owner</th>
                  <th>Agreement Date</th>
                  <th>Rent</th>
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{formatDate(order.created_at)}</td>
                    <td><span className="order-badge">{order.order_id || '—'}</span></td>
                    <td>
                      <div className="order-name">{order.tenant_name || '—'}</div>
                      <div className="order-sub">{order.tenant_address || ''}</div>
                    </td>
                    <td><div className="order-name">{order.owner_name || '—'}</div></td>
                    <td><div className="order-name">{formatDate(order.agreement_date)}</div></td>
                    <td>
                      <div className="order-name">₹{order.rent ? Number(order.rent).toLocaleString('en-IN') : '—'}</div>
                      <div className="order-sub">/ month</div>
                    </td>
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
    </>
  )
}
