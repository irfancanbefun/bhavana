"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/", icon: "▦" },
  { label: "Inventory", href: "/inventory", icon: "⧉" },
  { label: "Orders", href: "/orders", icon: "☰" },
  { label: "Purchase", href: "/purchase", icon: "🛒" },
  { label: "Reporting", href: "/reporting", icon: "📊" },
  { label: "Support", href: "/support", icon: "🎧" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">B</div>
        <div>
          <p className="sidebar-brand-title">BHAVANA OUTDOOR</p>
          <p className="sidebar-brand-sub">MANAJEMEN STOK</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menu.map((m) => {
          const active = pathname === m.href || (m.href !== "/" && pathname?.startsWith(m.href));
          return (
            <Link key={m.href} href={m.href} className={`sidebar-link ${active ? "sidebar-link--active" : "sidebar-link--inactive"}`}>
              <span className="sidebar-icon">{m.icon}</span>
              {m.label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-logout"><span>↩</span> Logout</button>
      </div>
    </aside>
  );
}
