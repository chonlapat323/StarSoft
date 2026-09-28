import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "ติดต่อ",
  description: "ติดต่อ StarSoft เพื่อปรึกษาและเริ่มโปรเจกต์ซอฟต์แวร์",
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function ContactPage() {
  const c = site.contact;
  return (
    <>
      <section className="page-hero" data-cosmos="text:HELLO" data-cosmos-y="0.28">
        <p className="eyebrow intro-fade" style={d(100)}>
          Contact
        </p>
        <h1 className="display page-title intro-fade" style={d(220)}>
          มาสร้างอะไรดีๆ ด้วยกัน
        </h1>
        <p className="lead intro-fade" style={d(380)}>
          เล่าไอเดียของคุณให้เราฟัง แล้วเราจะติดต่อกลับเพื่อคุยรายละเอียดโดยไม่มีค่าใช้จ่าย
        </p>
      </section>

      <section className="section section-wide" data-cosmos="drift">
        <div className="wide-inner contact-grid">
          <Reveal className="contact-info">
            <dl>
              <div>
                <dt className="eyebrow">Email</dt>
                <dd>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Phone</dt>
                <dd>{c.phone}</dd>
              </div>
              <div>
                <dt className="eyebrow">LINE</dt>
                <dd>{c.line}</dd>
              </div>
              <div>
                <dt className="eyebrow">Office</dt>
                <dd>
                  {c.address}
                  <br />
                  <span className="muted">{c.hours}</span>
                </dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
