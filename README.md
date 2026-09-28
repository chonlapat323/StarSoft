# StarSoft

เว็บไซต์บริษัท StarSoft — รับพัฒนาซอฟต์แวร์ ธีมหลักเป็นหลุมดำจากอนุภาค (Three.js) ที่ตอบสนองต่อเมาส์และการเลื่อนหน้า

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Three.js

## เริ่มใช้งาน

ต้องใช้ Node.js 20 ขึ้นไป

```bash
npm install
npm run dev      # เปิด http://localhost:3000
```

Build สำหรับขึ้น server:

```bash
npm run build
npm start        # รันเวอร์ชัน production ที่พอร์ต 3000
```

ทุกหน้าเป็น static จึง deploy ได้ทั้ง Vercel และ server Node.js ทั่วไป

### Deploy ด้วย pm2

```bash
chmod +x scripts/find-port.sh
PORT=$(./scripts/find-port.sh)          # หาพอร์ตว่างช่วง 3100–3199
npm ci && npm run build
PORT=$PORT pm2 start ecosystem.config.cjs
pm2 save
```

อัปเดตโค้ด: `git pull && npm ci && npm run build && pm2 restart starsoft`
(พอร์ตถูกจำไว้ใน pm2 แล้ว ไม่ต้องหาใหม่)

## หน้าเว็บ

| หน้า | ไฟล์ |
| --- | --- |
| หน้าแรก | `app/page.tsx` |
| บริการ | `app/services/page.tsx` |
| ผลงาน | `app/portfolio/page.tsx` |
| ติดต่อ | `app/contact/page.tsx` |

## แก้เนื้อหา

ข้อความทั้งหมด (บริการ, ผลงาน, ข้อมูลติดต่อ, หัวเรื่อง) อยู่ที่ไฟล์เดียว: **`content/site.ts`**

> ⚠️ ยังเป็นข้อมูลร่าง — อีเมล/เบอร์โทรเป็นค่าสมมติ และผลงานทั้ง 6 ชิ้นเป็นตัวอย่าง (มีป้าย "ตัวอย่าง") ต้องแทนด้วยข้อมูลจริงก่อนเปิดใช้งาน
>
> ฟอร์มติดต่อตอนนี้เปิดแอปอีเมลของผู้ใช้ (`mailto:`) ยังไม่ได้เชื่อมระบบหลังบ้าน

## ธีมอนุภาค

| การกระทำ | ผล |
| --- | --- |
| ขยับเมาส์ | อนุภาคถูกดึงเข้าหาและโคจรรอบเมาส์ |
| คลิก | คลื่นระเบิด |
| กดค้าง | แรงดึงแรงขึ้น |
| ปล่อย | เหวี่ยงอนุภาคออก |
| เลื่อนหน้า | อนุภาคเปลี่ยนรูปตามแต่ละ section |

รูปทรงของอนุภาคกำหนดจาก attribute บน `<section>`:

```tsx
<section data-cosmos="galaxy" data-cosmos-x="0.5">
```

- `data-cosmos` — รูปทรง: `drift`, `sphere`, `galaxy`, `ring`, `lattice`, `helix` หรือ `text:คำภาษาอังกฤษ` (เช่น `text:HELLO`)
- `data-cosmos-x` / `data-cosmos-y` — เลื่อนตำแหน่ง (-1 ถึง 1 ของความกว้าง/สูงจอ)
- `data-cosmos-strength` — แรงดึงเข้ารูปทรง (ค่าน้อย = หลวมๆ)

โค้ดธีมอยู่ที่ `lib/cosmos/` — ฟิสิกส์คำนวณบน GPU มือถือจะลดจำนวนอนุภาคให้อัตโนมัติ และรองรับการตั้งค่าลดการเคลื่อนไหว (reduced motion) ถ้าเครื่องไม่รองรับ WebGL จะแสดงพื้นหลังดาวแบบนิ่งแทน
