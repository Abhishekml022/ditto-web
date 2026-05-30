import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../App.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      <Header />

      <div className="home-page">
        <div className="home-hero">
          <h2>Welcome to Ditto</h2>
          <p>Manage and generate legally structured rental agreements in minutes.</p>
        </div>

        <div className="home-cards">
          {/* Create New Agreement */}
          <button className="home-card home-card--primary" onClick={() => navigate('/agreement-formats')}>
            <div className="home-card__icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="home-card__body">
              <div className="home-card__title">Create New Agreement</div>
              <div className="home-card__desc">Fill in owner, tenant, and property details to generate a fresh rental agreement document.</div>
            </div>
            <div className="home-card__arrow">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>

          {/* View Previous Orders */}
          <button className="home-card home-card--secondary" onClick={() => navigate('/orders')}>
            <div className="home-card__icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div className="home-card__body">
              <div className="home-card__title">My Orders</div>
              <div className="home-card__desc">Browse all previously generated agreements with their order IDs, dates, and tenant details.</div>
            </div>
            <div className="home-card__arrow">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        </div>
      </div>
<Footer />
    </>
  )
}
