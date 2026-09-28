import Link from "next/link";
import { site } from "@/content/site";
import StarMark from "./StarMark";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="brand">
          <StarMark />
          <span>{site.name}</span>
        </span>
        <p>{site.tagline}</p>
      </div>
      <div className="footer-col">
        <p className="eyebrow">Contact</p>
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        <span>{site.contact.phone}</span>
        <span>LINE {site.contact.line}</span>
      </div>
      <div className="footer-col">
        <p className="eyebrow">Menu</p>
        {site.nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
      <p className="footer-legal">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
    </footer>
  );
}
