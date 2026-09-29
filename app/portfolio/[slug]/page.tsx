import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CtaSection from "@/components/CtaSection";
import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import StarMark from "@/components/StarMark";
import { getProject, projects, type ProjectImage } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { images: [project.images[0].src] },
  };
}

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

function Figure({ image, preload = false }: { image: ProjectImage; preload?: boolean }) {
  return (
    <figure className="project-figure">
      <div className="project-figure-frame">
        <Image src={image.src} alt={image.alt} width={2400} height={1500} sizes="(max-width: 1320px) 100vw, 1240px" preload={preload} />
      </div>
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}

export default async function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const [cover, ...gallery] = project.images;
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const story = [
    ["01 — Overview", "ภาพรวม", project.overview],
    ["02 — Challenge", "โจทย์", project.challenge],
    ["03 — Approach", "แนวทางของเรา", project.solution],
  ];

  return (
    <>
      <section className="page-hero project-hero" data-cosmos="drift">
        <Link href="/portfolio" className="back-link intro-fade" style={d(60)}>
          ← ผลงานทั้งหมด
        </Link>
        <p className="eyebrow intro-fade" style={d(120)}>
          {project.category} · {project.kind === "app" ? "Mobile App" : "Web"}
        </p>
        <h1 className="display page-title intro-fade" style={d(220)}>
          {project.title}
        </h1>
        <p className="lead intro-fade" style={d(360)}>
          {project.summary}
        </p>
        <dl className="project-facts intro-fade" style={d(480)}>
          <div>
            <dt className="eyebrow">Brand</dt>
            <dd>{project.brand}</dd>
          </div>
          <div>
            <dt className="eyebrow">Platform</dt>
            <dd>{project.kind === "app" ? "iOS · Android · Web" : "Web · Responsive"}</dd>
          </div>
          <div>
            <dt className="eyebrow">Stack</dt>
            <dd>{project.stack.join(" · ")}</dd>
          </div>
        </dl>
        {project.placeholder && (
          <p className="concept-note intro-fade" style={d(560)}>
            <span className="tag">ตัวอย่าง</span>
            โปรเจกต์แนวคิด (Concept) — ภาพหน้าจอจัดทำขึ้นเพื่อแสดงแนวทางการออกแบบและพัฒนาของเรา ไม่ใช่งานของลูกค้าจริง
          </p>
        )}
      </section>

      <section className="section-media" data-cosmos="lattice" data-cosmos-strength="0.9" data-cosmos-y="-0.2">
        <Reveal>
          <Figure image={cover} preload />
        </Reveal>
      </section>

      <section className="section" data-cosmos="sphere" data-cosmos-x="0.5">
        <div className="section-inner story">
          {story.map(([eyebrow, heading, body], i) => (
            <Reveal key={eyebrow} delay={i * 60}>
              <p className="eyebrow">{eyebrow}</p>
              <h2 className="h3">{heading}</h2>
              <p className="body-lg">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-wide" data-cosmos="ring" data-cosmos-strength="1.4">
        <div className="wide-inner">
          <div className="wide-head">
            <Reveal>
              <p className="eyebrow">04 — Features</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h2">ฟีเจอร์หลัก</h2>
            </Reveal>
          </div>
          <div className="feature-grid">
            {project.features.map((f, i) => (
              <Reveal key={f.title} delay={120 + i * 70} className="feature">
                <StarMark size={12} />
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="section-media" data-cosmos="drift">
          <div className="gallery-head">
            <Reveal>
              <p className="eyebrow">05 — Screens</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h2">หน้าจออื่นๆ ในระบบ</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <Gallery images={gallery} />
          </Reveal>
        </section>
      )}

      <section className="section-media next-project-wrap" data-cosmos="galaxy" data-cosmos-strength="1.2">
        <Reveal>
          <Link href={`/portfolio/${next.slug}`} className="next-project">
            <span className="eyebrow">Next project</span>
            <span className="next-title">{next.title}</span>
            <span className="next-thumb">
              <Image src={next.images[0].src} alt="" width={2400} height={1500} sizes="320px" />
            </span>
            <span className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </section>

      <CtaSection />
    </>
  );
}
