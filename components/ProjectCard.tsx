import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/site";

export default function ProjectCard({ project }: { project: Project }) {
  const cover = project.images[0];
  return (
    <Link href={`/portfolio/${project.slug}`} className="project-card">
      <div className="project-visual">
        <Image src={cover.src} alt={cover.alt} width={2400} height={1500} sizes="(max-width: 900px) 100vw, 33vw" />
      </div>
      <div className="project-body">
        <div className="project-meta">
          <span>{project.category}</span>
          {project.placeholder && <span className="tag">ตัวอย่าง</span>}
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="project-foot">
          <ul className="stack">
            {project.stack.slice(0, 3).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <span className="row-arrow" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
