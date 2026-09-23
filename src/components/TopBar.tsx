export default function TopBar() {
  return (
    <header className="topbar">
      <h1 className="topbar-title">Welcome!</h1>
      <div className="topbar-actions">
        <div className="topbar-search">
          <span style={{ color: "#94a3b8", fontSize: 12 }}>⌕</span>
          <input placeholder="Search products, orders, SKUs..." />
        </div>
        <div className="topbar-icons">
          <button className="icon-btn">⚙</button>
          <button className="icon-btn">🔔<span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: 9999 }} /></button>
          <button className="icon-btn">👤</button>
        </div>
      </div>
    </header>
  );
}
