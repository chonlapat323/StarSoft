import type { Metadata } from "next";
import CtaSection from "@/components/CtaSection";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { projects } from "@/content/site";

export const metadata: Metadata = {
  title: "ผลงาน",
  description: "ผลงานพัฒนาซอฟต์แวร์ของ ATC Solutions",
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function PortfolioPage() {
  return (
    <>
      <section className="page-hero" data-cosmos="text:ATC SOLUTIONS" data-cosmos-y="0.28">
        <p className="eyebrow intro-fade" style={d(100)}>
          Work
        </p>
        <h1 className="display page-title intro-fade" style={d(220)}>
          ผลงาน
        </h1>
        <p className="lead intro-fade" style={d(380)}>
          ตัวอย่างระบบและผลิตภัณฑ์ที่เราออกแบบและพัฒนา
        </p>
      </section>

      <section className="section section-wide" data-cosmos="lattice" data-cosmos-strength="1.2">
        <div className="wide-inner">
          <div className="project-grid">
            {projects.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 90}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
