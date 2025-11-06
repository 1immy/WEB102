import { Link, NavLink } from 'react-router-dom'
import './Sidebar.css'

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Sidebar({ stats }) {
  return (
    <aside className="sidebar">
      <Link className="sidebar__brand" to="/dashboard">
        <span className="sidebar__eyebrow">CodePath · Project 6</span>
        <h1>HopSpotter</h1>
        <p>Track breweries across the U.S. and discover new favorites.</p>
      </Link>

      <nav className="sidebar__nav">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <section className="sidebar__stats">
        <h2>Data Snapshot</h2>
        <dl>
          <div>
            <dt>Total Breweries</dt>
            <dd>{stats.total}</dd>
          </div>
          <div>
            <dt>States Covered</dt>
            <dd>{stats.states}</dd>
          </div>
          <div>
            <dt>Types Represented</dt>
            <dd>{stats.types}</dd>
          </div>
        </dl>
        <p className="sidebar__footnote">
          Last updated:{' '}
          {stats.lastUpdated
            ? stats.lastUpdated.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—'}
        </p>
      </section>
    </aside>
  )
}
