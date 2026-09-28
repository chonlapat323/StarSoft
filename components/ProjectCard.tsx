import type { Project } from "@/content/site";

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="project-card" style={{ "--hue": 222 + ((index * 23) % 60) } as React.CSSProperties}>
      <div className="project-visual" aria-hidden="true">
        <span className="orbit" />
        <span className="orbit orbit-2" />
      </div>
      <div className="project-body">
        <div className="project-meta">
          <span>{project.category}</span>
          {project.placeholder && <span className="tag">ตัวอย่าง</span>}
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <ul className="stack">
          {project.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
