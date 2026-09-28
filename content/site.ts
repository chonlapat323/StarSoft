export type Shape = "drift" | "sphere" | "galaxy" | "ring" | "lattice" | "helix" | `text:${string}`;

export const site = {
  name: "StarSoft",
  tagline: "Software with gravity.",
  description:
    "StarSoft รับพัฒนาซอฟต์แวร์ครบวงจร — เว็บแอปพลิเคชัน แอปมือถือ ซอฟต์แวร์เฉพาะทาง ออกแบบ UI/UX และดูแลระบบหลังส่งมอบ",
  // Placeholder contact details — replace before launch.
  contact: {
    email: "hello@starsoft.example",
    phone: "0X-XXX-XXXX",
    line: "@starsoft",
    address: "กรุงเทพมหานคร ประเทศไทย",
    hours: "จันทร์–ศุกร์ 09:00–18:00",
  },
  nav: [
    { href: "/services", label: "บริการ", en: "Services" },
    { href: "/portfolio", label: "ผลงาน", en: "Work" },
    { href: "/contact", label: "ติดต่อ", en: "Contact" },
  ],
};

export const hero = {
  eyebrow: "StarSoft — Software Development Studio",
  headline: "Software with gravity.",
  lead: "เราออกแบบและพัฒนาซอฟต์แวร์ที่ดึงดูดผู้ใช้ และพาธุรกิจของคุณเติบโต ตั้งแต่ไอเดียแรกจนถึงวันที่ระบบออนไลน์",
  primary: { href: "/contact", label: "เริ่มโปรเจกต์" },
  secondary: { href: "/services", label: "ดูบริการ" },
  hint: ["กดค้างเพื่อดึง", "คลิกเพื่อระเบิด", "เลื่อนเพื่อเปลี่ยนรูป"],
};

export const strengths = [
  { title: "ทีมมืออาชีพ", body: "นักพัฒนาและนักออกแบบทำงานร่วมกันตั้งแต่วันแรก คุยกับคนที่ลงมือทำจริง" },
  { title: "ส่งมอบตรงเวลา", body: "วางแผนเป็นรอบสั้น เห็นความคืบหน้าจริงทุกสัปดาห์ ไม่มีเซอร์ไพรส์ตอนท้าย" },
  { title: "เทคโนโลยีทันสมัย", body: "เลือกเครื่องมือที่เหมาะกับงานและดูแลต่อได้ง่าย ไม่ใช่แค่ตามกระแส" },
  { title: "ดูแลหลังส่งมอบ", body: "เราไม่หายไปหลังระบบขึ้นออนไลน์ พร้อมดูแลและต่อยอดไปด้วยกัน" },
];

export type Service = {
  slug: string;
  en: string;
  th: string;
  summary: string;
  items: string[];
  shape: Shape;
};

export const services: Service[] = [
  {
    slug: "web",
    en: "Web Application",
    th: "พัฒนาเว็บแอปพลิเคชัน",
    summary: "ระบบเว็บที่เร็ว ปลอดภัย และขยายได้ ตั้งแต่เว็บไซต์องค์กร ระบบหลังบ้าน ไปจนถึงแพลตฟอร์มออนไลน์",
    items: ["เว็บไซต์องค์กรและ Landing page", "ระบบหลังบ้านและ Dashboard", "E-commerce และระบบสมาชิก", "API และ Backend"],
    shape: "lattice",
  },
  {
    slug: "mobile",
    en: "Mobile Application",
    th: "พัฒนาแอปพลิเคชันมือถือ",
    summary: "แอป iOS และ Android ที่ลื่นไหล ใช้งานง่าย พร้อมขึ้น App Store และ Google Play",
    items: ["แอป Cross-platform", "ระบบแจ้งเตือนและชำระเงิน", "เชื่อมต่อกับระบบหลังบ้าน", "นำขึ้นสโตร์และดูแลเวอร์ชัน"],
    shape: "sphere",
  },
  {
    slug: "custom",
    en: "Custom Software & Integration",
    th: "ซอฟต์แวร์เฉพาะทางและเชื่อมต่อระบบ",
    summary: "ซอฟต์แวร์ที่ออกแบบตามกระบวนการของธุรกิจคุณ และเชื่อมระบบเดิมเข้ากับบริการใหม่อย่างไร้รอยต่อ",
    items: ["ระบบเฉพาะงานตามความต้องการ", "เชื่อมต่อ API, Payment และ LINE", "ระบบอัตโนมัติลดงานซ้ำ", "ย้ายข้อมูลและปรับปรุงระบบเก่า"],
    shape: "helix",
  },
  {
    slug: "design",
    en: "UI/UX Design",
    th: "ออกแบบ UI/UX",
    summary: "ออกแบบประสบการณ์ผู้ใช้จากความเข้าใจจริง ให้สวย ใช้ง่าย และพาไปสู่เป้าหมายทางธุรกิจ",
    items: ["User research และ Wireframe", "Prototype ที่คลิกได้จริง", "Design system", "ทดสอบการใช้งาน"],
    shape: "galaxy",
  },
  {
    slug: "support",
    en: "Maintenance & Support",
    th: "ดูแลและซัพพอร์ตระบบ",
    summary: "ดูแลระบบหลังส่งมอบ อัปเดตความปลอดภัย แก้ปัญหาอย่างรวดเร็ว และพัฒนาต่อยอดอย่างต่อเนื่อง",
    items: ["Monitoring และสำรองข้อมูล", "อัปเดตความปลอดภัย", "แก้ไขปัญหาตามระยะเวลาที่ตกลง", "พัฒนาฟีเจอร์ต่อยอด"],
    shape: "ring",
  },
];

export type Project = {
  title: string;
  category: string;
  year: string;
  summary: string;
  stack: string[];
  placeholder: boolean;
};

// Sample entries — replace with real projects; `placeholder` renders a visible "ตัวอย่าง" tag.
export const projects: Project[] = [
  { title: "ระบบจองคิวออนไลน์", category: "Web Application", year: "—", summary: "ระบบจองคิวและจัดการตารางนัดหมายสำหรับธุรกิจบริการ", stack: ["Next.js", "PostgreSQL"], placeholder: true },
  { title: "แอปสะสมแต้มร้านค้า", category: "Mobile Application", year: "—", summary: "แอปสมาชิก สะสมแต้ม และแลกของรางวัล", stack: ["React Native", "Node.js"], placeholder: true },
  { title: "Dashboard วิเคราะห์ยอดขาย", category: "Custom Software", year: "—", summary: "รวมข้อมูลจากหลายช่องทางมาแสดงผลแบบเรียลไทม์", stack: ["React", "Python"], placeholder: true },
  { title: "เว็บไซต์องค์กร", category: "Web / UI Design", year: "—", summary: "ออกแบบและพัฒนาเว็บไซต์องค์กรพร้อมระบบจัดการเนื้อหา", stack: ["Next.js", "Headless CMS"], placeholder: true },
  { title: "ระบบจัดการคลังสินค้า", category: "Custom Software", year: "—", summary: "ติดตามสต็อก รับ–จ่ายสินค้า และออกรายงาน", stack: ["TypeScript", "PostgreSQL"], placeholder: true },
  { title: "แพลตฟอร์มคอร์สออนไลน์", category: "Web Application", year: "—", summary: "ระบบขายคอร์ส วิดีโอบทเรียน และติดตามผู้เรียน", stack: ["Next.js", "Stripe"], placeholder: true },
];
