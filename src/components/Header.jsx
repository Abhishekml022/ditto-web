import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/images/Logo.png'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { pathname } = useLocation()
  const { logout, user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const isHome = pathname === '/' || pathname === '/new' || pathname === '/success' || pathname === '/agreement-formats'
  const isOrders = pathname.startsWith('/orders')
  const isSaved = pathname === '/saved-details'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const displayName = userProfile?.name || user?.email?.split('@')[0] || 'User'

  return (
    <header className="site-header">
      <a href="/" className="brand-logo">
        <img src={logo} alt="Ditto" className="brand-logo-img" />
      </a>
      <ul className="nav-links">
        <li><a href="/" className={isHome ? 'active' : ''}>Home</a></li>
        <li><a href="/orders" className={isOrders ? 'active' : ''}>My Orders</a></li>
        <li><a href="/saved-details" className={isSaved ? 'active' : ''}>Saved Orders</a></li>
      </ul>
      <div className="header-right">
        <div className="profile-wrap">
          <div className="header-user" onClick={() => setShowProfile((v) => !v)} style={{ cursor: 'pointer' }}>
            <div className="header-user-avatar">{displayName[0].toUpperCase()}</div>
            <span className="header-user-name">{displayName}</span>
          </div>
          {showProfile && (
            <div className="profile-popover">
              <div className="profile-popover__avatar">{displayName[0].toUpperCase()}</div>
              <div className="profile-popover__name">{displayName}</div>
              <div className="profile-popover__email">{user?.email}</div>
              <div className="profile-popover__divider" />
              <nav className="profile-popover__nav">
                <a href="/" className={isHome ? 'active' : ''}>Home</a>
                <a href="/orders" className={isOrders ? 'active' : ''}>My Orders</a>
                <a href="/saved-details" className={isSaved ? 'active' : ''}>Saved Orders</a>
              </nav>
              <div className="profile-popover__divider" />
              {!showConfirm ? (
                <button className="profile-popover__signout" onClick={() => setShowConfirm(true)}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign Out
                </button>
              ) : (
                <div className="profile-popover__confirm">
                  <p>Are you sure?</p>
                  <div className="signout-popover__actions">
                    <button className="signout-popover__btn signout-popover__btn--cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
                    <button className="signout-popover__btn signout-popover__btn--confirm" onClick={handleLogout}>Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
