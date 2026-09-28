"use client";

import { services, site } from "@/content/site";
import Select from "./Select";

export default function ContactForm() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const subject = `[${site.name}] สอบถามโปรเจกต์: ${get("type") || "ทั่วไป"}`;
    const body = [
      `ชื่อ: ${get("name")}`,
      `อีเมล: ${get("email")}`,
      `โทร: ${get("phone")}`,
      `ประเภทงาน: ${get("type")}`,
      "",
      get("message"),
    ].join("\n");
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <div className="field-row">
        <label className="field">
          <span>ชื่อ–นามสกุล</span>
          <input name="name" required autoComplete="name" />
        </label>
        <label className="field">
          <span>อีเมล</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>เบอร์โทร</span>
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        <Select name="type" label="ประเภทงาน" placeholder="เลือกบริการ" options={[...services.map((s) => s.th), "อื่นๆ"]} />
      </div>
      <label className="field">
        <span>รายละเอียดโปรเจกต์</span>
        <textarea name="message" rows={5} required placeholder="เล่าไอเดีย เป้าหมาย หรือปัญหาที่อยากแก้ได้เลย" />
      </label>
      <div className="form-foot">
        <button type="submit" className="btn btn-primary" data-magnetic>
          ส่งข้อความ <span className="btn-arrow">→</span>
        </button>
        <p className="form-note">ระบบจะเปิดแอปอีเมลของคุณพร้อมข้อความที่กรอกไว้</p>
      </div>
    </form>
  );
}
