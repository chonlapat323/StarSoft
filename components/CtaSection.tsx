import Link from "next/link";
import Reveal from "./Reveal";

export default function CtaSection() {
  return (
    <section className="section cta" data-cosmos="text:ATC SOLUTIONS" data-cosmos-y="0.3">
      <div className="cta-inner">
        <Reveal>
          <p className="eyebrow">Next — Let’s talk</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="h2">มีไอเดียอยู่ในใจ? มาคุยกัน</h2>
        </Reveal>
        <Reveal delay={160}>
          <Link href="/contact" className="btn btn-primary" data-magnetic>
            เริ่มโปรเจกต์กับเรา <span className="btn-arrow">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
