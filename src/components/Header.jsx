import { useLocation } from 'react-router-dom'
import logo from '../assets/images/Logo.png'

export default function Header() {
  const { pathname } = useLocation()

  const isHome = pathname === '/' || pathname === '/new' || pathname === '/success'
  const isOrders = pathname.startsWith('/orders')

  return (
    <header className="site-header">
      <a href="/" className="brand-logo">
        <img src={logo} alt="Ditto" className="brand-logo-img" />
      </a>
      <ul className="nav-links">
        <li><a href="/" className={isHome ? 'active' : ''}>Home</a></li>
        <li><a href="/orders" className={isOrders ? 'active' : ''}>Previous Orders</a></li>
      </ul>
      <a href="#" className="header-cta">Version 0.1</a>
    </header>
  )
}
