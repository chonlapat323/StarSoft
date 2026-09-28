"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/content/site";
import StarMark from "./StarMark";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header" data-open={open}>
      <Link href="/" className="brand" data-magnetic onClick={close}>
        <StarMark />
        <span>{site.name}</span>
      </Link>

      <nav className="nav" aria-label="เมนูหลัก">
        {site.nav.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            aria-current={pathname.startsWith(item.href) ? "page" : undefined}
          >
            <span className="nav-index">{String(i + 1).padStart(2, "0")}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link href="/contact" className="btn btn-ghost btn-sm header-cta" data-magnetic>
        เริ่มโปรเจกต์
      </Link>

      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        {site.nav.map((item, i) => (
          <Link key={item.href} href={item.href} className="mobile-link" onClick={close}>
            <span className="nav-index">{String(i + 1).padStart(2, "0")}</span>
            <span>{item.label}</span>
            <span className="mobile-en">{item.en}</span>
          </Link>
        ))}
      </div>
    </header>
  );
}
