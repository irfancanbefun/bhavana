"use client";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* Types sesuai DB */
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
};

type Penyewaan = {
  id: string;
  kode_booking: string;
  nama_penyewa: string;
  wa: string;
  no_telepon: string;
  tanggal_mulai: string; // yyyy-mm-dd
  tanggal_selesai: string;
  tanggal_jeda: string;
  status_sewa: "dipesan" | "disewa" | "selesai" | "dibatalkan";
  total_biaya: number;
  id_barang: string;
  jumlah_barang: number;
  harga_per_item: number;
  created_at: string;
  updated_at: string;
};

function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function parseISO(s: string) { return new Date(s + "T00:00:00"); }
function addDaysISO(s: string, n: number) {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}
function formatIndo(iso: string) {
  if (!iso) return "-";
  const d = parseISO(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export default function OrdersPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [barangs, setBarangs] = useState<Barang[]>([]);
  const [penyewaan, setPenyewaan] = useState<Penyewaan[]>([]);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [form, setForm] = useState({ nama_penyewa: "", wa: "", no_telepon: "", id_barang: "", jumlah_barang: 1 });
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  // load barang & penyewaan
  useEffect(() => {
    const rawBarang = localStorage.getItem("bhavana_products");
    if (rawBarang) { try { setBarangs(JSON.parse(rawBarang)); if (JSON.parse(rawBarang)[0]?.id) setForm((f) => ({ ...f, id_barang: JSON.parse(rawBarang)[0].id })); } catch {} }
    const rawSewa = localStorage.getItem("bhavana_penyewaan");
    if (rawSewa) { try { setPenyewaan(JSON.parse(rawSewa)); } catch {} }
  }, []);
  useEffect(() => { localStorage.setItem("bhavana_penyewaan", JSON.stringify(penyewaan)); }, [penyewaan]);
  useEffect(() => { if (barangs.length && !form.id_barang) setForm((f) => ({ ...f, id_barang: barangs[0].id })); }, [barangs]);

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const monthGrid = useMemo(() => {
    const y = current.getFullYear(), m = current.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const firstIdx = (first.getDay() + 6) % 7; // Monday 0
    const cells: { date: Date; iso: string; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < firstIdx; i++) {
      const d = new Date(y, m, 1 - firstIdx + i);
      cells.push({ date: d, iso: toISO(d), isCurrentMonth: false });
    }
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(y, m, d);
      cells.push({ date, iso: toISO(date), isCurrentMonth: true });
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const lastCell = cells[cells.length - 1].date;
      const d = new Date(lastCell);
      d.setDate(d.getDate() + 1);
      cells.push({ date: d, iso: toISO(d), isCurrentMonth: false });
      if (cells.length >= 42) break;
    }
    return cells.slice(0, 42);
  }, [current]);

  const getDateStatus = (iso: string) => {
    for (const p of penyewaan) {
      if (p.status_sewa === "dibatalkan" || p.status_sewa === "selesai") continue;
      if (iso >= p.tanggal_mulai && iso <= p.tanggal_selesai) return "booked";
      if (iso === p.tanggal_jeda) return "jeda";
    }
    return "available";
  };

  const isInSelectedRange = (iso: string) => {
    if (!start || !end) return false;
    const s = start <= end ? start : end;
    const e = start <= end ? end : start;
    return iso >= s && iso <= e;
  };
  const isSelected = (iso: string) => iso === start || iso === end;

  const handleDayClick = (iso: string) => {
    if (!start || (start && end)) {
      setStart(iso);
      setEnd(null);
    } else {
      if (iso === start) { setEnd(null); return; }
      setEnd(iso);
    }
    setError("");
  };

  const tanggalJeda = useMemo(() => {
    if (!start || !end) return null;
    const s = start <= end ? start : end;
    const e = start <= end ? end : start;
    return addDaysISO(e, 1);
  }, [start, end]);

  const selectedBarang = barangs.find((b) => b.id === form.id_barang);

  const checkAvailability = (s: string, e: string, barangId: string, qty: number) => {
    const barang = barangs.find((b) => b.id === barangId);
    if (!barang) return { ok: false, msg: "Barang tidak ditemukan" };
    // per date in range
    let cur = parseISO(s);
    const endD = parseISO(e);
    while (cur <= endD) {
      const iso = toISO(cur);
      // jeda day also blocked: check if iso is jeda of existing
      let booked = 0;
      for (const p of penyewaan) {
        if (p.status_sewa === "dibatalkan" || p.status_sewa === "selesai") continue;
        if (p.id_barang !== barangId) continue;
        const pStart = p.tanggal_mulai;
        const pJeda = p.tanggal_jeda;
        if (iso >= pStart && iso <= pJeda) booked += p.jumlah_barang;
      }
      if (booked + qty > barang.total_stok) {
        return { ok: false, msg: `Tanggal ${formatIndo(iso)} melebihi stok. Tersisa ${barang.total_stok - booked}, diminta ${qty} (${barang.nama_barang})` };
      }
      cur.setDate(cur.getDate() + 1);
    }
    // juga cek jeda baru vs booking lama yang mulai di jeda
    if (tanggalJeda) {
      for (const p of penyewaan) {
        if (p.status_sewa === "dibatalkan" || p.status_sewa === "selesai") continue;
        if (p.id_barang !== barangId) continue;
        if (p.tanggal_mulai === tanggalJeda) {
          return { ok: false, msg: `Tanggal jeda ${formatIndo(tanggalJeda)} bentrok dengan booking ${p.kode_booking} mulai ${formatIndo(p.tanggal_mulai)}` };
        }
      }
    }
    return { ok: true, msg: "" };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) { setError("Pilih tanggal_mulai dan tanggal_selesai di kalender"); return; }
    const s = start <= end ? start : end;
    const eDate = start <= end ? end : start;
    if (!form.nama_penyewa.trim()) { setError("nama_penyewa wajib"); return; }
    if (!form.id_barang) { setError("Pilih barang dulu (tambah di Inventory)"); return; }
    const qty = Number(form.jumlah_barang);
    if (qty <= 0) { setError("jumlah_barang harus >0"); return; }

    const avail = checkAvailability(s, eDate, form.id_barang, qty);
    if (!avail.ok) { setError(avail.msg); return; }

    const barang = barangs.find((b) => b.id === form.id_barang)!;
    const daysCount = Math.ceil((parseISO(eDate).getTime() - parseISO(s).getTime()) / 86400000) + 1;
    const total = barang.harga_barang * qty * daysCount;
    const jeda = addDaysISO(eDate, 1);
    const now = new Date().toISOString();
    const p: Penyewaan = {
      id: crypto.randomUUID(),
      kode_booking: "BO-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      nama_penyewa: form.nama_penyewa.trim(),
      wa: form.wa.trim(),
      no_telepon: form.no_telepon.trim() || form.wa.trim(),
      tanggal_mulai: s,
      tanggal_selesai: eDate,
      tanggal_jeda: jeda,
      status_sewa: "dipesan",
      total_biaya: total,
      id_barang: form.id_barang,
      jumlah_barang: qty,
      harga_per_item: barang.harga_barang,
      created_at: now,
      updated_at: now,
    };
    setPenyewaan((prev) => [p, ...prev]);
    setStart(null); setEnd(null);
    setForm((f) => ({ ...f, nama_penyewa: "", wa: "", no_telepon: "", jumlah_barang: 1 }));
    setError("");
  };

  const updateStatus = (id: string, status: Penyewaan["status_sewa"]) => {
    setPenyewaan((prev) => prev.map((p) => p.id === id ? { ...p, status_sewa: status, updated_at: new Date().toISOString() } : p));
  };
  const handleCancel = (id: string) => {
    if (!confirm("Batalkan booking? stok akan kembali tersedia (status dibatalkan)")) return;
    updateStatus(id, "dibatalkan");
  };

  const filteredSewa = penyewaan.filter((p) => filterStatus === "semua" ? true : p.status_sewa === filterStatus);
  const todayISO = toISO(new Date());

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="main">
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="calendar-card">
              <div className="cal-header">
                <div>
                  <p className="cal-title" style={{ textTransform: "capitalize" }}>{monthLabel(current)}</p>
                  <p className="cal-sub">Kalender booking bulanan — pilih tanggal_mulai & tanggal_selesai, jeda 1 hari otomatis</p>
                </div>
                <div className="cal-nav">
                  <button className="icon-btn" onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))}>‹</button>
                  <button className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => setCurrent(new Date())}>Hari ini</button>
                  <button className="icon-btn" onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))}>›</button>
                </div>
              </div>

              <div className="cal-grid">
                {days.map((d) => <div key={d} className="cal-dayname">{d}</div>)}
                {monthGrid.map((c) => {
                  const status = getDateStatus(c.iso);
                  const muted = !c.isCurrentMonth;
                  const today = c.iso === todayISO;
                  const sel = isSelected(c.iso);
                  const range = isInSelectedRange(c.iso) && !sel;
                  let extra = "";
                  if (!muted && status === "booked") extra = " cal-day--booked";
                  else if (!muted && status === "jeda") extra = " cal-day--jeda";
                  if (sel) extra = " cal-day--selected";
                  else if (range) extra = " cal-day--range";
                  return (
                    <div
                      key={c.iso}
                      onClick={() => handleDayClick(c.iso)}
                      className={`cal-day ${muted ? "cal-day--muted" : ""} ${today ? "cal-day--today" : ""}${extra}`}
                      title={`${c.iso} — ${status}${muted ? " (bulan lain)" : ""}`}
                    >
                      {c.date.getDate()}
                    </div>
                  );
                })}
              </div>

              <div className="cal-legend">
                <span><span className="legend-box" style={{ background: "#fee2e2" }} /> Dibooking</span>
                <span><span className="legend-box" style={{ background: "#fef3c7" }} /> Jeda 1 hari</span>
                <span><span className="legend-box" style={{ background: "#122e44" }} /> Dipilih</span>
                <span><span className="legend-box" style={{ background: "#e0f2fe" }} /> Range</span>
                <span><span className="legend-box" /> Tersedia</span>
              </div>

              {(start || end) && (
                <div className="range-info" style={{ marginTop: 16 }}>
                  <span><b>Tanggal mulai:</b> {start ? formatIndo(start) : "-"} &nbsp; <b>Tanggal selesai:</b> {end ? formatIndo(end) : "-"} {tanggalJeda && <> &nbsp; <b>Tanggal jeda:</b> {formatIndo(tanggalJeda)} (blok 1 hari)</>}</span>
                  {start && end && <span style={{ color: "#64748b" }}>Durasi {Math.ceil((parseISO(start <= end ? end : start).getTime() - parseISO(start <= end ? start : end).getTime()) / 86400000) + 1} hari • Klik tanggal lain untuk reset</span>}
                  <button onClick={() => { setStart(null); setEnd(null); }} className="btn-ghost" style={{ width: "fit-content", marginTop: 4 }}>Reset pilihan</button>
                </div>
              )}
            </div>

            {/* Form booking */}
            <div className="booking-panel">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#122e44" }}>Buat Penyewaan</h3>
              <p style={{ fontSize: 11, color: "#64748b" }}>Isi sesuai DB: penyewaan + detail_penyewaan (id_barang, jumlah_barang, harga_per_item). Cegah double booking otomatis.</p>
              {barangs.length === 0 && <div className="form-error" style={{ marginTop: 12 }}>Belum ada barang di Inventory. Tambah barang dulu.</div>}
              {error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}
              <form onSubmit={handleCreate} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="form-grid-2">
                  <div><label className="form-label">nama_penyewa *</label><input value={form.nama_penyewa} onChange={(e) => setForm({ ...form, nama_penyewa: e.target.value })} placeholder="Budi" className="form-input" /></div>
                  <div><label className="form-label">wa / no_telepon</label><input value={form.wa} onChange={(e) => setForm({ ...form, wa: e.target.value })} placeholder="0812..." className="form-input" /></div>
                </div>
                <div className="form-grid-3">
                  <div><label className="form-label">Barang (id_barang)</label>
                    <select value={form.id_barang} onChange={(e) => setForm({ ...form, id_barang: e.target.value })} className="form-select">
                      {barangs.map((b) => <option key={b.id} value={b.id}>{b.nama_barang} — {b.kode_barang} (stok {b.total_stok})</option>)}
                      {barangs.length === 0 && <option value="">- kosong -</option>}
                    </select>
                    {selectedBarang && <p className="form-hint">Harga {selectedBarang.harga_barang.toLocaleString("id-ID")} /hari • Stok layak {selectedBarang.stok_layak}</p>}
                  </div>
                  <div><label className="form-label">jumlah_barang</label><input type="number" min={1} value={form.jumlah_barang} onChange={(e) => setForm({ ...form, jumlah_barang: Number(e.target.value) })} className="form-input" /></div>
                  <div><label className="form-label">Preview biaya</label><div className="form-input" style={{ background: "#f8fafc", color: "#334155" }}>{selectedBarang && start && end ? (selectedBarang.harga_barang * form.jumlah_barang * (Math.ceil((parseISO(start <= end ? end : start).getTime() - parseISO(start <= end ? start : end).getTime()) / 86400000) + 1)).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }) : "-"}</div></div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                  <button type="submit" className="btn-primary">Simpan Penyewaan (dipesan)</button>
                </div>
              </form>
            </div>

            {/* Daftar penyewaan */}
            <div className="booking-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>Daftar Penyewaan ({filteredSewa.length})</h3>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select" style={{ width: 160, marginTop: 0 }}>
                  <option value="semua">Semua status</option>
                  <option value="dipesan">dipesan</option>
                  <option value="disewa">disewa</option>
                  <option value="selesai">selesai</option>
                  <option value="dibatalkan">dibatalkan</option>
                </select>
              </div>
              <div className="booking-list">
                {filteredSewa.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: 16 }}>Belum ada penyewaan</p>
                ) : filteredSewa.map((p) => {
                  const barang = barangs.find((b) => b.id === p.id_barang);
                  return (
                    <div key={p.id} className="booking-card">
                      <div className="booking-top">
                        <span className="booking-code">{p.kode_booking}</span>
                        <span className={`status-badge status-badge--${p.status_sewa}`}>{p.status_sewa}</span>
                      </div>
                      <p className="booking-name">{p.nama_penyewa} {p.wa && <span style={{ fontWeight: 400, color: "#64748b", fontSize: 11 }}>• {p.wa}</span>}</p>
                      <p className="booking-meta">{barang ? `${barang.nama_barang} (${barang.kode_barang})` : p.id_barang} • {p.jumlah_barang} x {p.harga_per_item.toLocaleString("id-ID")} • {formatIndo(p.tanggal_mulai)} → {formatIndo(p.tanggal_selesai)} • Jeda {formatIndo(p.tanggal_jeda)} • Total {p.total_biaya.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</p>
                      <div className="booking-actions">
                        <select value={p.status_sewa} onChange={(e) => updateStatus(p.id, e.target.value as any)} className="btn-sm">
                          <option value="dipesan">dipesan</option>
                          <option value="disewa">disewa</option>
                          <option value="selesai">selesai</option>
                          <option value="dibatalkan">dibatalkan</option>
                        </select>
                        {p.status_sewa !== "dibatalkan" && p.status_sewa !== "selesai" && <button onClick={() => handleCancel(p.id)} className="btn-sm btn-sm--danger">Batalkan</button>}
                        <button onClick={() => { if (confirm("Hapus permanen?")) setPenyewaan((prev) => prev.filter((x) => x.id !== p.id)); }} className="btn-sm">Hapus</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
