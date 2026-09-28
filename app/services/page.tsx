import type { Metadata } from "next";
import CtaSection from "@/components/CtaSection";
import Reveal from "@/components/Reveal";
import StarMark from "@/components/StarMark";
import { services } from "@/content/site";

export const metadata: Metadata = {
  title: "บริการ",
  description: "บริการพัฒนาเว็บแอปพลิเคชัน แอปมือถือ ซอฟต์แวร์เฉพาะทาง ออกแบบ UI/UX และดูแลระบบ",
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero" data-cosmos="ring">
        <p className="eyebrow intro-fade" style={d(100)}>
          Services
        </p>
        <h1 className="display page-title intro-fade" style={d(220)}>
          บริการของเรา
        </h1>
        <p className="lead intro-fade" style={d(380)}>
          ตั้งแต่ออกแบบประสบการณ์ผู้ใช้ พัฒนาระบบ ไปจนถึงดูแลหลังส่งมอบ — ทีมเดียวครบทุกขั้นตอน
        </p>
      </section>

      {services.map((s, i) => (
        <section
          key={s.slug}
          id={s.slug}
          className={`section ${i % 2 ? "align-right" : ""}`}
          data-cosmos={s.shape}
          data-cosmos-x={i % 2 ? -0.5 : 0.5}
        >
          <div className="section-inner">
            <Reveal>
              <p className="eyebrow">
                {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")} — {s.en}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h2">{s.th}</h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="body-lg">{s.summary}</p>
            </Reveal>
            <ul className="bullet-list">
              {s.items.map((item, k) => (
                <li key={item}>
                  <Reveal delay={220 + k * 60}>
                    <StarMark size={10} />
                    {item}
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <CtaSection />
    </>
  );
}
