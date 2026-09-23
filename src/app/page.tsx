import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const topItems = [
  { name: "Sepatu EIGER", pct: "+18.4%", val: "874k" },
  { name: "Tenda XL", pct: "+14.2%", val: "721k" },
  { name: "Sleeping Bag", pct: "+9.8%", val: "654k" },
  { name: "Tracking poll", pct: "+11.5%", val: "589k" },
  { name: "Jaket", pct: "+7.4%", val: "512k" },
  { name: "Kompor", pct: "+5.9%", val: "468k" },
  { name: "Tas Carier XL", pct: "+4.3%", val: "423k" },
  { name: "Jas Hujan", pct: "+8.1%", val: "395k" },
  { name: "Tas Carier L", pct: "+3.2%", val: "341k" },
  { name: "Wajan", pct: "+2.1%", val: "308k" },
];

export default function DashboardPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="main">
          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <p className="stat-label">TOTAL PRODUK</p>
                <p className="stat-value">14,820</p>
                <p className="stat-trend">↗ 12.5%</p>
              </div>
              <div className="stat-icon stat-icon--blue">📦</div>
            </div>
            <div className="stat-card">
              <div>
                <p className="stat-label">ORDERS</p>
                <p className="stat-value">2,480</p>
                <p className="stat-trend">↗ 8.2%</p>
              </div>
              <div className="stat-icon stat-icon--emerald">🧾</div>
            </div>
            <div className="stat-card">
              <div>
                <p className="stat-label">TOTAL STOK</p>
                <p className="stat-value">84,310 <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}>barang</span></p>
              </div>
              <div className="stat-icon stat-icon--slate">📊</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card">
                <div className="card-header">
                  <div>
                    <p className="card-title">Inventori</p>
                    <p className="card-sub">Jumlah penjualan berdasarkan kategori</p>
                  </div>
                  <button style={{ color: "#94a3b8", fontSize: 12, border: "none", background: "none" }}>⋮</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, marginTop: 16 }}>
                  <div className="donut-wrap">
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                      <circle cx="50" cy="50" r="32" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                      <circle cx="50" cy="50" r="32" fill="none" stroke="#0f2b3d" strokeWidth="16" strokeDasharray="84 201" />
                      <circle cx="50" cy="50" r="32" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="56 201" strokeDashoffset="-84" />
                      <circle cx="50" cy="50" r="32" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="16 201" strokeDashoffset="-140" />
                      <circle cx="50" cy="50" r="32" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="24 201" strokeDashoffset="-156" />
                    </svg>
                    <div className="donut-center"><div><p style={{ fontSize: 10, color: "#94a3b8" }}>TOTAL</p><p style={{ fontSize: 14, fontWeight: 700 }}>1.84J</p></div></div>
                  </div>
                  <div className="legend">
                    <div className="legend-row"><span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="legend-dot" style={{ background: "#0f2b3d" }} />Tenda</span><span style={{ color: "#64748b" }}>772K(42%)</span></div>
                    <div className="legend-row"><span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="legend-dot" style={{ background: "#f59e0b" }} />Jaket</span><span style={{ color: "#64748b" }}>515.2K(28%)</span></div>
                    <div className="legend-row"><span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="legend-dot" style={{ background: "#3b82f6" }} />Sepatu</span><span style={{ color: "#64748b" }}>331.2K(18%)</span></div>
                    <div className="legend-row"><span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="legend-dot" style={{ background: "#10b981" }} />Dan lain-lain</span><span style={{ color: "#64748b" }}>220.8K(12%)</span></div>
                    <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f7", display: "flex", justifyContent: "center", marginTop: 8 }}>
                      <span className="badge-optimal">Holding Cost Efficiency • 94.2% Optimal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="chart-toggle">
                    <button>Weekly</button>
                    <button className="active">Monthly</button>
                    <button>Yearly</button>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: "#94a3b8" }}>Total Keuntungan</p>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>842K <span style={{ fontSize: 11, fontWeight: 400, color: "#059669", background: "#ecfdf5", padding: "2px 6px", borderRadius: 6 }}>50.1%</span></p>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <svg viewBox="0 0 400 120" style={{ width: "100%", height: 120 }}>
                    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.3" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
                    <path d="M0 80 C40 70 80 95 120 75 C160 55 200 40 240 50 C280 60 320 30 360 20 L360 120 L0 120 Z" fill="url(#g)" />
                    <path d="M0 80 C40 70 80 95 120 75 C160 55 200 40 240 50 C280 60 320 30 360 20" fill="none" stroke="#10b981" strokeWidth="2" />
                    <g><rect x="240" y="10" width="110" height="16" rx="8" fill="#122e44" /><text x="295" y="20" textAnchor="middle" fontSize="7" fill="white">Puncak Keuntungan: 148,200 (Sep)</text></g>
                    <circle cx="360" cy="20" r="3" fill="#122e44" stroke="white" strokeWidth="2" />
                  </svg>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94a3b8", padding: "0 4px" }}>
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <span style={{ fontSize: 11, color: "#047857", display: "flex", alignItems: "center", gap: 4 }}><span className="legend-dot" style={{ background: "#10b981" }} />Profit Flow (148.2k peak)</span>
                    <button style={{ fontSize: 11, color: "#64748b", border: "none", background: "none" }}>↗ Export</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p className="card-title">Top 10 Barang</p>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>This Month <a style={{ color: "#2563eb", marginLeft: 8 }}>View All</a></span>
              </div>
              <div className="top-list">
                {topItems.map((it, i) => (
                  <div key={it.name} className="top-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, width: 16, color: "#94a3b8" }}>{i + 1}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 500 }}>{it.name}</p>
                        <p style={{ fontSize: 11, color: "#059669" }}>{it.pct}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{it.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
