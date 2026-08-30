import { useState } from 'react';
import { Menu, Bell, User, Activity } from 'lucide-react';

export default function TopBar({ title, alertCount = 0, onMenuToggle }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          onClick={onMenuToggle}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
          className="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent-green)' }}>
          <div className="status-dot" />
          <span style={{ fontWeight: 600 }}>System Online</span>
        </div>

        <span className="topbar-badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
          DEMO DATA
        </span>

        {alertCount > 0 && (
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="var(--text-secondary)" />
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: 'var(--accent-red)', color: 'white',
              borderRadius: '50%', width: 16, height: 16,
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          </div>
        )}

        <div className="user-pill">
          <div className="user-avatar">A</div>
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
}
