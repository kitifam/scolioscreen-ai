# ScolioScreen AI 🧬
**แอปพลิเคชันคัดกรองภาวะกระดูกสันหลังคดเบื้องต้นด้วยปัญญาประดิษฐ์**

ScolioScreen AI เป็นเครื่องมือช่วยคัดกรองความเสี่ยงภาวะกระดูกสันหลังคด (Scoliosis) โดยใช้เทคโนโลยี Computer Vision ในการตรวจจับตำแหน่งร่างกาย และใช้ Generative AI (Google Gemini) ในการสรุปผลและให้คำแนะนำเบื้องต้น ออกแบบมาให้ใช้งานง่ายบนมือถือและให้ผลลัพธ์ที่รวดเร็ว

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 1. 📷 ระบบถ่ายภาพและตรวจจับท่าทาง (AI Pose Guidance)
- ใช้ **MediaPipe Pose Landmarker** ในการตรวจจับจุดสำคัญบนร่างกายแบบ Real-time
- มีระบบแนะนำการจัดวางตัวละคร (Guiding Overlay) เพื่อให้ได้ภาพถ่ายที่ถูกต้องตามหลักการแพทย์
- รองรับการคัดกรอง 2 ท่าหลัก:
    - **ท่าลัดทางตรง (Standing Back View)**: ตรวจสอบความเอียงของไหล่และสะโพก
    - **ท่าก้มตัว (Adam's Forward Bend Test)**: ตรวจสอบความนูนของหลัง (Rib Hump)

### 2. 📐 การวิเคราะห์มิติร่างกาย (Quantitative Analysis)
- คำนวณองศาความเอียงของไหล่ (Shoulder Tilt) และสะโพก (Hip Tilt) โดยอัตโนมัติ
- ประเมินค่าการเบี่ยงเบนของกระดูกสันหลัง (Spine Deviation)
- **Manual Adjustment**: ผู้ใช้สามารถลากเลื่อนจุดตำแหน่ง (Landmarks) เพื่อปรับความแม่นยำได้ด้วยตนเองก่อนการประมวลผล

### 3. 🧠 สรุปผลด้วย Gemini AI
- เชื่อมต่อกับ **Google Gemini 2.5 Flash API** เพื่อสรุปผลการวิเคราะห์
- ให้ข้อมูลเชิงลึกใน 3 ส่วน:
    - **Explanation**: คำอธิบายผลการวัดในภาษาที่เข้าใจง่าย
    - **Findings**: สัญญาณความผิดปกติที่พบ
    - **Recommendations**: คำแนะนำในการปฏิบัติตัวหรือการพบแพทย์

### 4. 📊 ระบบติดตามความก้าวหน้า (Progress Tracking)
- บันทึกประวัติการคัดกรองย้อนหลัง
- **Symptom Log**: บันทึกระดับอาการปวด (Pain Level), ตำแหน่งที่ปวด และโน้ตเพิ่มเติม
- **Progress Chart**: แสดงกราฟแนวโน้มความเสี่ยงและระดับอาการปวดเมื่อเวลาผ่านไป

### 5. 📱 ประสบการณ์ใช้งานที่ทันสมัย (User Experience)
- **PWA (Progressive Web App)**: สามารถติดตั้งลงบนมือถือเหมือนแอปทั่วไปได้
- **Multi-language**: รองรับทั้งภาษาไทยและภาษาอังกฤษ
- **Privacy First**: ข้อมูลส่วนบุคลและภาพถ่ายถูกบันทึกใน Local Storage ของผู้ใช้เท่านั้น ไม่มีการอัปโหลดภาพไปเก็บที่ Server อื่น

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **AI Core**: 
    - Google Gemini AI (Analysis & Summary)
    - MediaPipe (Real-time Pose Detection)
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Local Development)

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/scolioscreen-ai-v2.git
   cd scolioscreen-ai-v2
   ```

2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

3. **ตั้งค่า Environment Variables**
   สร้างไฟล์ `.env` ที่ root directory และใส่ API Key ของคุณ:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **รันบนเครื่อง Local**
   ```bash
   npm run dev
   ```

---

## ☁️ การ Deployment (Vercel)

โปรเจกต์นี้ได้รับการตั้งค่าให้พร้อมสำหรับ **Vercel** เรียบร้อยแล้ว:
1. เชื่อมต่อ Repository กับ Vercel
2. ตั้งค่า Environment Variable: `VITE_GEMINI_API_KEY` ในหน้า Settings ของ Vercel
3. ไฟล์ `vercel.json` จะจัดการเรื่อง Routing (SPA) ให้โดยอัตโนมัติ

---

## ⚠️ คำเตือน (Disclaimer)
แอปพลิเคชันนี้เป็นเพียงเครื่องมือ **คัดกรองเบื้องต้น** เท่านั้น **ไม่ใช่การวินิจฉัยทางการแพทย์** ผลลัพธ์ที่ได้อาจมีความคลาดเคลื่อนจากท่าทางการถ่ายภาพหรือความสว่างของแสง โปรดปรึกษาแพทย์เฉพาะทางเพื่อการวินิจฉัยที่ถูกต้องแม่นยำด้วยการเอกซเรย์ (X-ray) ต่อไป
