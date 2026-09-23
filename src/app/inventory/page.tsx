"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ===== DB: kategori & barang ===== */
type Kategori = { id: string; nama: string; slug: string };
const KATEGORI: Kategori[] = [
  { id: "11111111-1111-1111-1111-111111111111", nama: "Tenda", slug: "tenda" },
  { id: "22222222-2222-2222-2222-222222222222", nama: "Jaket", slug: "jaket" },
  { id: "33333333-3333-3333-3333-333333333333", nama: "Sepatu", slug: "sepatu" },
  { id: "44444444-4444-4444-4444-444444444444", nama: "Tas", slug: "tas" },
  { id: "55555555-5555-5555-5555-555555555555", nama: "Aksesoris", slug: "aksesoris" },
  { id: "66666666-6666-6666-6666-666666666666", nama: "Alat Masak", slug: "alat-masak" },
  { id: "77777777-7777-7777-7777-777777777777", nama: "Lainnya", slug: "lainnya" },
];

type Barang = {
  id: string;
  id_kategori: string;
  nama_barang: string;
  kode_barang: string;
  harga_barang: number;
  total_stok: number;
  stok_layak: number;
  stok_rusak: number;
  gambar: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
};

const DEFAULT_GAMBAR = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}
function kategoriNama(id: string) {
  return KATEGORI.find((k) => k.id === id)?.nama ?? "-";
}

export default function InventoryPage() {
  const [barangs, setBarangs] = useState<Barang[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Barang | null>(null);
  const [form, setForm] = useState<Omit<Barang, "id" | "created_at" | "updated_at">>({
    id_kategori: KATEGORI[0].id,
    nama_barang: "",
    kode_barang: "",
    harga_barang: 0,
    total_stok: 0,
    stok_layak: 0,
    stok_rusak: 0,
    gambar: "",
    status: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const cleared = localStorage.getItem("bhavana_cleared_v2");
    if (!cleared) {
      localStorage.removeItem("bhavana_products");
      localStorage.setItem("bhavana_cleared_v2", "1");
      setBarangs([]);
      return;
    }
    const raw = localStorage.getItem("bhavana_products");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // migrasi dari schema lama (name->nama_barang) jika ada
        if (Array.isArray(parsed) && parsed.length && (parsed[0] as any).name) {
          setBarangs([]);
          return;
        }
        setBarangs(parsed);
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("bhavana_products", JSON.stringify(barangs));
  }, [barangs]);

  const filtered = barangs.filter((b) =>
    [b.nama_barang, b.kode_barang, kategoriNama(b.id_kategori)].some((v) => v.toLowerCase().includes(query.toLowerCase()))
  );

  const resetForm = () => {
    setForm({
      id_kategori: KATEGORI[0].id,
      nama_barang: "",
      kode_barang: "",
      harga_barang: 0,
      total_stok: 0,
      stok_layak: 0,
      stok_rusak: 0,
      gambar: "",
      status: true,
    });
    setEditing(null);
    setError("");
  };

  const handleOpenAdd = () => { resetForm(); setOpen(true); };
  const handleOpenEdit = (b: Barang) => {
    setEditing(b);
    setForm({
      id_kategori: b.id_kategori,
      nama_barang: b.nama_barang,
      kode_barang: b.kode_barang,
      harga_barang: b.harga_barang,
      total_stok: b.total_stok,
      stok_layak: b.stok_layak,
      stok_rusak: b.stok_rusak,
      gambar: b.gambar,
      status: b.status,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_barang.trim() || !form.kode_barang.trim()) { setError("nama_barang dan kode_barang wajib diisi"); return; }
    if (form.harga_barang <= 0) { setError("harga_barang harus > 0"); return; }
    if (form.total_stok < 0 || form.stok_layak < 0 || form.stok_rusak < 0) { setError("stok tidak boleh negatif"); return; }
    if (form.stok_layak + form.stok_rusak > form.total_stok) { setError("stok_layak + stok_rusak tidak boleh melebihi total_stok"); return; }

    const now = new Date().toISOString();
    const payload: Barang = {
      id: editing ? editing.id : crypto.randomUUID(),
      id_kategori: form.id_kategori,
      nama_barang: form.nama_barang.trim(),
      kode_barang: form.kode_barang.trim().toUpperCase(),
      harga_barang: Number(form.harga_barang),
      total_stok: Number(form.total_stok),
      stok_layak: Number(form.stok_layak),
      stok_rusak: Number(form.stok_rusak),
      gambar: form.gambar.trim() || DEFAULT_GAMBAR,
      status: form.status,
      created_at: editing?.created_at ?? now,
      updated_at: now,
    };

    if (editing) setBarangs((prev) => prev.map((x) => (x.id === editing.id ? payload : x)));
    else setBarangs((prev) => [payload, ...prev]);
    setOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus/nonaktifkan barang ini?")) return;
    setBarangs((prev) => prev.filter((p) => p.id !== id));
  };

  const totalStokAll = barangs.reduce((a, b) => a + b.total_stok, 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="main">
          <div className="inventory-header">
            <div>
              <h2 className="inventory-title">Inventory — barang</h2>
              <p className="inventory-sub">{filtered.length} barang • Total stok {totalStokAll} (DB: barang.total_stok)</p>
            </div>
            <div className="inventory-controls">
              <div className="search-pill">
                <span style={{ color: "#94a3b8", fontSize: 12 }}>⌕</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search nama_barang, kode_barang..." />
              </div>
              <button onClick={handleOpenAdd} className="btn-primary">+ Add Product</button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-card">
              {barangs.length === 0 ? (
                <>
                  <div className="empty-icon">📦</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginTop: 12 }}>Belum ada barang</p>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Tabel barang kosong — sesuai DB. Backend bisa langsung INSERT.<br />Skema: id_kategori, nama_barang, kode_barang, harga_barang, total_stok, stok_layak, stok_rusak, gambar, status</p>
                  <button onClick={handleOpenAdd} className="btn-dark" style={{ marginTop: 16 }}>+ Add Product</button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: "#64748b" }}>Tidak ada barang untuk &quot;{query}&quot;</p>
                  <button onClick={() => setQuery("")} style={{ marginTop: 12, fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>Reset pencarian</button>
                </>
              )}
            </div>
          ) : (
            <div className="grid-barang">
              {filtered.map((b) => (
                <div key={b.id} className="barang-card">
                  <div className="barang-image-wrap">
                    <img src={b.gambar} alt={b.nama_barang} onError={(e) => ((e.currentTarget.src = DEFAULT_GAMBAR))} />
                  </div>
                  <div className="barang-body">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <h3 className="barang-name">{b.nama_barang}</h3>
                      <span className={`badge-stock ${b.total_stok > 20 ? "badge-stock--high" : b.total_stok > 5 ? "badge-stock--mid" : "badge-stock--low"}`}>{b.total_stok} stok</span>
                    </div>
                    <p className="barang-meta">{b.kode_barang} • {kategoriNama(b.id_kategori)} {b.status ? "" : "• Nonaktif"}</p>
                    <p className="barang-price">{formatRupiah(b.harga_barang)}</p>
                    <div className="barang-tags">
                      <span className="barang-tag barang-tag--white">Layak {b.stok_layak}</span>
                      <span className="barang-tag barang-tag--ghost">Rusak {b.stok_rusak}</span>
                      <span className="barang-tag barang-tag--white">{b.status ? "Aktif" : "Off"}</span>
                    </div>
                    <div className="barang-actions">
                      <button onClick={() => handleOpenEdit(b)} className="btn-card btn-card--edit">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="btn-card btn-card--delete">Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {open && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setOpen(false)} />
          <form onSubmit={handleSubmit} className="modal">
            <div className="modal-head">
              <h3 className="modal-title">{editing ? "Edit barang" : "Add barang"} <span style={{ fontWeight: 400, fontSize: 12, color: "#64748b" }}>(tabel barang)</span></h3>
              <p className="modal-sub">Field sesuai DB: kategori, nama_barang, kode_barang, harga_barang, stok, gambar, status</p>
            </div>
            <div className="modal-body">
              {error && <div className="form-error">{error}</div>}

              <div>
                <label className="form-label">nama_barang *</label>
                <input value={form.nama_barang} onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} placeholder="Tenda Dome 4P" className="form-input" />
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">kode_barang *</label>
                  <input value={form.kode_barang} onChange={(e) => setForm({ ...form, kode_barang: e.target.value })} placeholder="TND-001" className="form-input" />
                </div>
                <div>
                  <label className="form-label">id_kategori</label>
                  <select value={form.id_kategori} onChange={(e) => setForm({ ...form, id_kategori: e.target.value })} className="form-select">
                    {KATEGORI.map((k) => <option key={k.id} value={k.id}>{k.nama} — {k.slug}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div>
                  <label className="form-label">harga_barang (IDR) *</label>
                  <input type="number" min={0} value={form.harga_barang || ""} onChange={(e) => setForm({ ...form, harga_barang: Number(e.target.value) })} placeholder="772000" className="form-input" />
                </div>
                <div>
                  <label className="form-label">total_stok</label>
                  <input type="number" min={0} value={form.total_stok || ""} onChange={(e) => setForm({ ...form, total_stok: Number(e.target.value) })} placeholder="42" className="form-input" />
                </div>
                <div>
                  <label className="form-label">status</label>
                  <select value={String(form.status)} onChange={(e) => setForm({ ...form, status: e.target.value === "true" })} className="form-select">
                    <option value="true">Aktif (true)</option>
                    <option value="false">Nonaktif (false)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">stok_layak</label>
                  <input type="number" min={0} value={form.stok_layak || ""} onChange={(e) => setForm({ ...form, stok_layak: Number(e.target.value) })} placeholder="38" className="form-input" />
                </div>
                <div>
                  <label className="form-label">stok_rusak</label>
                  <input type="number" min={0} value={form.stok_rusak || ""} onChange={(e) => setForm({ ...form, stok_rusak: Number(e.target.value) })} placeholder="4" className="form-input" />
                </div>
              </div>
              <p className="form-hint">Validasi: stok_layak + stok_rusak ≤ total_stok</p>

              <div>
                <label className="form-label">gambar (text URL)</label>
                <input value={form.gambar} onChange={(e) => setForm({ ...form, gambar: e.target.value })} placeholder="https://..." className="form-input" />
                <p className="form-hint">Kosongkan pakai default Bromo. Kolom DB: barang.gambar (text)</p>
              </div>
            </div>

            <div className="modal-foot">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Batal</button>
              <button type="submit" className="btn-dark">{editing ? "Simpan" : "Tambah"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
