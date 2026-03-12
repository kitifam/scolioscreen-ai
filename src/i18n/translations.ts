export type Language = 'th' | 'en';

export const translations = {
  // Landing
  appName: { th: 'ScolioScreen AI', en: 'ScolioScreen AI' },
  tagline: {
    th: 'คัดกรองความเสี่ยงกระดูกสันหลังคดเบื้องต้น ด้วย AI',
    en: 'AI-Powered Preliminary Scoliosis Screening',
  },
  landingDescription: {
    th: 'ถ่ายภาพ 2 รูปจากมือถือ แล้วให้ AI วิเคราะห์ความเสี่ยงภาวะกระดูกสันหลังคด ง่าย รวดเร็ว ไม่ต้องสมัครสมาชิก',
    en: 'Take 2 photos from your phone and let AI analyze scoliosis risk. Simple, fast, no sign-up required.',
  },
  startScreening: { th: 'เริ่มคัดกรอง', en: 'Start Screening' },
  disclaimer: {
    th: '⚠️ ผลการคัดกรองนี้เป็นเพียงการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์ กรุณาปรึกษาแพทย์เพื่อการวินิจฉัยที่แม่นยำ',
    en: '⚠️ This screening result is a preliminary assessment only, not a medical diagnosis. Please consult a doctor for an accurate diagnosis.',
  },
  howItWorks: { th: 'วิธีการทำงาน', en: 'How It Works' },
  step1Title: { th: '1. ให้ความยินยอม', en: '1. Give Consent' },
  step1Desc: { th: 'ยอมรับข้อตกลงและกรอกข้อมูลพื้นฐาน', en: 'Accept terms and enter basic information' },
  step2Title: { th: '2. ถ่ายภาพ 2 รูป', en: '2. Take 2 Photos' },
  step2Desc: { th: 'ถ่ายภาพช่วงบนและช่วงล่าง ตามคำแนะนำ ระบบจะถ่ายอัตโนมัติเมื่อท่าทางตรง', en: 'Take upper and lower body photos with guidance. Auto-capture when pose is aligned.' },
  step3Title: { th: '3. รับผลคัดกรอง', en: '3. Get Results' },
  step3Desc: { th: 'AI วิเคราะห์และแสดงผลความเสี่ยงพร้อมคำแนะนำ', en: 'AI analyzes and shows risk level with recommendations' },

  // Consent
  consentTitle: { th: 'ข้อตกลงการใช้งาน', en: 'Terms of Use' },
  consentIntro: {
    th: 'กรุณาอ่านและยอมรับข้อตกลงก่อนใช้งาน',
    en: 'Please read and accept the terms before proceeding.',
  },
  consentTerms: {
    th: [
      'ระบบนี้ใช้ AI ในการคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์',
      'ภาพถ่ายจะถูกส่งไปวิเคราะห์โดย AI และจะไม่ถูกจัดเก็บถาวร',
      'ผลลัพธ์เป็นเพียงแนวทางเบื้องต้น ควรปรึกษาแพทย์เพื่อการวินิจฉัยที่ถูกต้อง',
      'ผู้ใช้รับทราบว่าระบบมีข้อจำกัดและอาจมีความคลาดเคลื่อน',
    ],
    en: [
      'This system uses AI for preliminary screening only, not medical diagnosis.',
      'Photos will be sent for AI analysis and will not be permanently stored.',
      'Results are preliminary guidance only. Please consult a doctor for accurate diagnosis.',
      'Users acknowledge that the system has limitations and may have inaccuracies.',
    ],
  },
  consentAgree: {
    th: 'ข้าพเจ้ายอมรับข้อตกลงการใช้งานทั้งหมด',
    en: 'I accept all terms of use',
  },
  minorSection: { th: 'สำหรับผู้เยาว์ (อายุต่ำกว่า 18 ปี)', en: 'For Minors (Under 18)' },
  minorConsent: {
    th: 'ผู้ปกครองได้อ่านและยินยอมให้ใช้งานระบบนี้',
    en: 'A parent/guardian has read and consented to the use of this system',
  },

  // Data entry
  basicInfo: { th: 'ข้อมูลพื้นฐาน', en: 'Basic Information' },
  birthYear: { th: 'ปีเกิด (ค.ศ.)', en: 'Birth Year (A.D.)' },
  age: { th: 'อายุ', en: 'Age' },
  sex: { th: 'เพศ', en: 'Sex' },
  male: { th: 'ชาย', en: 'Male' },
  female: { th: 'หญิง', en: 'Female' },
  other: { th: 'อื่นๆ', en: 'Other' },
  height: { th: 'ส่วนสูง (ซม.) — ไม่บังคับ', en: 'Height (cm) — optional' },
  weight: { th: 'น้ำหนัก (กก.) — ไม่บังคับ', en: 'Weight (kg) — optional' },
  symptoms: { th: 'อาการที่สังเกต (ไม่บังคับ)', en: 'Observed symptoms (optional)' },
  symptomsPlaceholder: {
    th: 'เช่น ปวดหลัง ไหล่ไม่เท่ากัน เดินผิดปกติ',
    en: 'e.g. back pain, uneven shoulders, abnormal gait',
  },

  // Navigation
  next: { th: 'ถัดไป', en: 'Next' },
  back: { th: 'กลับ', en: 'Back' },
  cancel: { th: 'ยกเลิก', en: 'Cancel' },

  // Validation
  requiredField: { th: 'กรุณากรอกข้อมูลนี้', en: 'This field is required' },
  mustAcceptConsent: { th: 'กรุณายอมรับข้อตกลง', en: 'You must accept the terms' },
  invalidBirthYear: { th: 'กรุณากรอกปีเกิดที่ถูกต้อง (1900-ปัจจุบัน)', en: 'Please enter a valid birth year (1900-present)' },
  invalidAge: { th: 'กรุณากรอกอายุที่ถูกต้อง (1-120)', en: 'Please enter a valid age (1-120)' },

  // Features
  feature1: { th: 'ไม่ต้องสมัครสมาชิก', en: 'No Sign-up Required' },
  feature2: { th: 'ผลลัพธ์ภายใน 1 นาที', en: 'Results in 1 Minute' },
  feature3: { th: 'รองรับภาษาไทย', en: 'Thai Language Support' },
  feature4: { th: 'ปลอดภัย ไม่เก็บข้อมูล', en: 'Safe, No Data Stored' },

  // Camera / Capture
  captureTitle: { th: 'ถ่ายภาพคัดกรอง', en: 'Screening Photos' },
  photoOf: { th: 'รูปที่', en: 'Photo' },
  photoFullBody: { th: 'ถ่ายเต็มตัว', en: 'Full Body' },
  photoUpperBody: { th: 'ท่าหันหลัง', en: 'Back View' },
  photoLowerBody: { th: 'ท่าก้มตัว (Adam Test)', en: 'Adam Forward Bending Test' },
  guideFullBody: {
    th: 'ยืนตรง เท้าชิด แขนแนบลำตัว ถ่ายเต็มตัวจากศีรษะถึงเท้า',
    en: 'Stand straight, feet together, arms at sides. Capture from head to toe.',
  },
  guideUpperBody: {
    th: 'ใช้กล้องหลังถ่ายเต็มตัว ให้เห็นแนวกระดูกสันหลังชัดเจน',
    en: 'Use rear camera. Capture full body to clearly see the spine outline.',
  },
  guideLowerBody: {
    th: 'ใช้กล้องหลังถ่ายจากด้านหลังขณะก้มตัว ให้เห็นความความสมบูรณ์ของแผ่นหลัง',
    en: 'Use rear camera. Capture from the back while bending forward to see back symmetry.',
  },
  flipCamera: { th: 'สลับกล้อง', en: 'Flip Camera' },
  rotateImage: { th: 'หมุนภาพ', en: 'Rotate' },
  takePhoto: { th: 'ถ่ายภาพ', en: 'Take Photo' },
  retake: { th: 'ถ่ายใหม่', en: 'Retake' },
  confirm: { th: 'ยืนยัน', en: 'Confirm' },
  cameraPermissionDenied: {
    th: 'ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้องในการตั้งค่าเบราว์เซอร์',
    en: 'Camera access denied. Please allow camera access in your browser settings.',
  },
  cameraNotFound: {
    th: 'ไม่พบกล้อง กรุณาตรวจสอบอุปกรณ์ของคุณ',
    en: 'No camera found. Please check your device.',
  },
  cameraSecureContext: {
    th: 'เบราว์เซอร์รับรองความปลอดภัยไม่อนุญาตให้ใช้กล้องผ่าน HTTP (ต้องรันผ่าน HTTPS หรือ localhost)',
    en: 'Browser restricts camera access over HTTP. Please use HTTPS or localhost.',
  },
  frontCamera: { th: 'กล้องหน้า', en: 'Front Camera' },
  rearCamera: { th: 'กล้องหลัง', en: 'Rear Camera' },
  sendForAnalysis: { th: 'ส่งวิเคราะห์', en: 'Send for Analysis' },
  reviewPhotos: { th: 'ตรวจสอบภาพ', en: 'Review Photos' },
  allPhotosTaken: {
    th: 'ถ่ายภาพครบ 2 รูปแล้ว ตรวจสอบและส่งวิเคราะห์',
    en: 'All 2 photos taken. Review and send for analysis.',
  },
  levelIndicator: { th: 'ระดับน้ำ', en: 'Level' },
  tiltWarning: {
    th: 'กล้องเอียง กรุณาถือให้ตรง',
    en: 'Camera is tilted. Please hold it straight.',
  },
  brightnessLow: {
    th: 'แสงน้อยเกินไป กรุณาเพิ่มแสง',
    en: 'Too dark. Please increase lighting.',
  },
  photoSaved: { th: 'บันทึกภาพแล้ว', en: 'Photo saved' },
  aiAnalysis: { th: 'การวิเคราะห์โดย AI', en: 'AI Analysis' },
  shoulderAngle: { th: 'มุมความเอียงไหล่', en: 'Shoulder Angle' },
  hipAngle: { th: 'มุมความเอียงสะโพก', en: 'Hip Angle' },
  spineAngle: { th: 'มุมความเอียงกระดูกสันหลัง', en: 'Spine Tilt Angle' },
  symmetry: { th: 'ความสมมาตร', en: 'Symmetry' },
  normal: { th: 'ปกติ', en: 'Normal' },
  abnormal: { th: 'ผิดปกติ', en: 'Abnormal' },
  legendTitle: { th: 'สีและสัญลักษณ์', en: 'Colors & Legend' },
  legendGreen: { th: 'จุดเขียว: ปกติ (เอียงไม่เกิน 10°)', en: 'Green: Normal (tilt <= 10°)' },
  legendRed: { th: 'จุดแดง: ผิดปกติ (เอียงเกิน 10°)', en: 'Red: Abnormal (tilt > 10°)' },
  legendBlue: { th: 'เส้นฟ้า: แนวสมมาตรปกติ', en: 'Blue line: Normal symmetry' },
  legendBlack: { th: 'เส้นดำ: ตรวจพบความเอ็นเอียง', en: 'Black line: Tilt detected' },
  midline: { th: 'เส้นกลางตัว', en: 'Midline' },

  // Pose detection feedback
  poseFeedbackNoBody: { th: 'ไม่พบร่างกายในกรอบ จัดท่าให้อยู่ในกรอบ', en: 'No body detected. Position yourself in the frame.' },
  poseFeedbackAdjustPosition: { th: 'เกือบแล้ว! ขยับตัวให้อยู่ในกรอบทั้งหมด', en: 'Almost! Adjust to fit fully in the frame.' },
  poseFeedbackStandStraight: { th: 'ยืนให้ตรง ไหล่เท่ากัน', en: 'Stand straight with level shoulders.' },
  poseFeedbackReady: { th: 'ตรงตำแหน่งแล้ว! กำลังจะถ่ายอัตโนมัติ...', en: 'Aligned! Auto-capturing soon...' },

  // Consent single page
  startCapture: { th: 'เริ่มถ่ายภาพ', en: 'Start Capture' },

  // Quality checks
  qualityTooDark: { th: 'แสงน้อยเกินไป เพิ่มแสงสว่าง', en: 'Too dark. Increase lighting.' },
  qualityTooBright: { th: 'สว่างเกินไป ลดแสง', en: 'Too bright. Reduce lighting.' },
  qualityBacklit: { th: 'ย้อนแสง ย้ายตำแหน่งให้แสงอยู่ด้านหน้า', en: 'Backlit. Move so light is in front of you.' },
  qualityTilted: { th: 'กล้องเอียง ถือให้ตรง', en: 'Camera tilted. Hold it straight.' },
  qualityBlurry: { th: 'ภาพไม่คมชัด ถือกล้องให้นิ่ง', en: 'Image blurry. Hold the camera steady.' },
  qualityMultiplePeople: { th: 'พบหลายคนในภาพ ให้มีเฉพาะผู้ถูกตรวจ', en: 'Multiple people detected. Only the subject should be visible.' },
  qualityBodyTwist: { th: 'หันตัวตรง อย่าบิดตัว', en: 'Face forward. Do not twist your body.' },
  qualityObstruction: { th: 'มีวัตถุบังร่างกาย กรุณาเคลียร์พื้นที่', en: 'Body obstructed. Clear the area.' },
  qualityAllGood: { th: '✅ คุณภาพภาพดี พร้อมถ่าย', en: '✅ Image quality good. Ready to capture.' },

  // Settings / Profile
  settings: { th: 'การตั้งค่า', en: 'Settings' },
  editProfile: { th: 'แก้ไขประวัติส่วนตัว', en: 'Edit Profile' },
  saveChanges: { th: 'บันทึกข้อมูล', en: 'Save Changes' },
  logout: { th: 'ออกจากระบบ', en: 'Log Out' },
  // Progress
  trackProgress: { th: 'ติดตามวิวัฒนาการ', en: 'Track Progress' },
  symptomLog: { th: 'บันทึกอาการ', en: 'Symptom Log' },
  painLevel: { th: 'ระดับความปวด', en: 'Pain Level' },
  location: { th: 'ตำแหน่งที่ปวด', en: 'Pain Location' },
  notes: { th: 'หมายเหตุเพิ่มเติม', en: 'Additional Notes' },
  saveLog: { th: 'บันทึกอาการวันนี้', en: 'Save Daily Log' },
  progressChart: { th: 'กราฟวิวัฒนาการ', en: 'Progress Chart' },
  riskScoreTrend: { th: 'แนวโน้มความเสี่ยง (%)', en: 'Risk Score Trend (%)' },
  painTrend: { th: 'แนวโน้มความปวด (0-10)', en: 'Pain Trend (0-10)' },
  noData: { th: 'ยังไม่มีข้อมูลการบันทึก', en: 'No data recorded yet' },
  history: { th: 'ประวัติ', en: 'History' },
  symptomSaved: { th: 'บันทึกอาการเรียบร้อยแล้ว', en: 'Symptom log saved successfully' },
  painLevel0: { th: 'ไม่มีอาการ', en: 'No Pain' },
  painLevel5: { th: 'ปวดปานกลาง', en: 'Moderate Pain' },
  painLevel10: { th: 'ปวดมากที่สุด', en: 'Severe Pain' },
} as const;

export type TranslationKey = keyof typeof translations;
