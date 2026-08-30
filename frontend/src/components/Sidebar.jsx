import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, BrainCircuit, CloudRain,
  BarChart3, Building2, Bell, Menu, X, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Risk Map' },
  { to: '/prediction', icon: BrainCircuit, label: 'AI Prediction' },
  { to: '/rainfall', icon: CloudRain, label: 'Rainfall' },
  { to: '/historical', icon: BarChart3, label: 'Historical Intelligence' },
  { to: '/infrastructure', icon: Building2, label: 'Infrastructure' },
  { to: '/alerts', icon: Bell, label: 'Alert Center' },
];

export default function Sidebar({ open, onClose, onLogout }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">🏔</div>
        <div className="logo-text">
          <span className="logo-title">LandslideAI</span>
          <span className="logo-sub">NER Early Warning</span>
        </div>
        <button
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'none' }}
          className="sidebar-close-btn"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="demo-badge">⚠ DEMO MONITORING DATA</div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 13, padding: '12px 0', width: '100%',
            transition: 'color 0.15s'
          }}
          onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
