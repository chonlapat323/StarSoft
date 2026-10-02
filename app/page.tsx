import Link from "next/link";
import CtaSection from "@/components/CtaSection";
import GravityHeadline from "@/components/GravityHeadline";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { hero, projects, services, strengths } from "@/content/site";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function Home() {
  return (
    <>
      <section className="hero" data-cosmos="drift">
        <p className="eyebrow intro-fade" style={d(200)}>
          {hero.eyebrow}
        </p>
        <GravityHeadline text={hero.headline} className="display hero-title" />
        <p className="lead intro-fade" style={d(900)}>
          {hero.lead}
        </p>
        <div className="actions intro-fade" style={d(1050)}>
          <Link href={hero.primary.href} className="btn btn-primary" data-magnetic>
            {hero.primary.label} <span className="btn-arrow">→</span>
          </Link>
          <Link href={hero.secondary.href} className="btn btn-ghost" data-magnetic>
            {hero.secondary.label}
          </Link>
        </div>
        <ul className="hint intro-fade" style={d(1500)} aria-label="วิธีเล่นกับพื้นหลัง">
          {hero.hint.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="section" data-cosmos="sphere" data-cosmos-x="0.5">
        <div className="section-inner">
          <Reveal>
            <p className="eyebrow">01 — Why ATC Solutions</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="h2">ทุกระบบที่ดี เริ่มจากแรงดึงดูดของไอเดียเดียว</h2>
          </Reveal>
          <div className="strengths">
            {strengths.map((s, i) => (
              <Reveal key={s.title} delay={160 + i * 70} className="strength">
                <span className="mono-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" data-cosmos="galaxy" data-cosmos-x="0.5">
        <div className="section-inner">
          <Reveal>
            <p className="eyebrow">02 — Services</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="h2">สิ่งที่เราทำ</h2>
          </Reveal>
          <ul className="service-list">
            {services.map((s, i) => (
              <li key={s.slug}>
                <Reveal delay={140 + i * 60}>
                  <Link href={`/services#${s.slug}`} className="service-row">
                    <span className="mono-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="service-name">
                      {s.th}
                      <small>{s.en}</small>
                    </span>
                    <span className="row-arrow">→</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-wide" data-cosmos="lattice" data-cosmos-strength="1.6" data-cosmos-y="-0.15">
        <div className="wide-inner">
          <div className="wide-head">
            <Reveal>
              <p className="eyebrow">03 — Selected work</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h2">ผลงานบางส่วน</h2>
            </Reveal>
          </div>
          <div className="project-grid">
            {projects.slice(0, 3).map((p, i) => (
              <Reveal key={p.title} delay={120 + i * 90}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <Link href="/portfolio" className="text-link">
              ดูผลงานทั้งหมด <span className="btn-arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
