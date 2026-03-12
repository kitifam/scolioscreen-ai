import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Scan, ArrowLeft, AlertTriangle, CheckCircle, Home, Loader2, Activity } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import LogoutToggle from '@/components/LogoutToggle';
import UserDisplay from '@/components/UserDisplay';
import { useToast } from '@/hooks/use-toast';

import { useAuth } from '@/contexts/AuthContext';
import { type StandingMetrics } from '@/components/ScoliosisOverlay';
import { type NormalizedLandmark } from '@mediapipe/tasks-vision';

import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalysisResult {
  riskScore: number;
  riskLevel: { th: string; en: string };
  findings: { th: string[]; en: string[] };
  recommendations: { th: string[]; en: string[] };
  shoulderAnalysis?: { th: string; en: string };
  waistAnalysis?: { th: string; en: string };
  hipAnalysis?: { th: string; en: string };
  explanation?: { th: string; en: string };
}

const ResultPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  // ... existing state ...
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backViewImage, setBackViewImage] = useState<string | null>(null);
  const [backLandmarks, setBackLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [adamViewImage, setAdamViewImage] = useState<string | null>(null);
  const [adamLandmarks, setAdamLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [adamMetrics, setAdamMetrics] = useState<{ angle: number; level: { th: string; en: string }; isAbnormal: boolean } | null>(null);

  const [annotatedBackView, setAnnotatedBackView] = useState<string | null>(null);
  const [annotatedAdamView, setAnnotatedAdamView] = useState<string | null>(null);

  const [finalStandingMetrics, setFinalStandingMetrics] = useState<StandingMetrics | null>(null);

  useEffect(() => {
    const analyze = async () => {
      let riskScore = 0;
      let riskLevel: { th: string; en: string } = { th: 'ปกติ', en: 'Normal' };
      let sAngle = 0;
      let hAngle = 0;
      let spineDev = 0;

      try {
        const imagesStr = sessionStorage.getItem('scolioscreen_images');
        const userInfoStr = sessionStorage.getItem('scolioscreen_userinfo');

        if (!imagesStr) {
          setError('no_images');
          setLoading(false);
          return;
        }

        let images: string[] = [];
        try {
          images = JSON.parse(imagesStr) as string[];
        } catch (e) {
          console.error('Failed to parse images data:', e);
          setError('invalid_data'); return;
        }

        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};

        setBackViewImage(images[0] || null);
        setAdamViewImage(images[1] || null);

        const annBackStr = sessionStorage.getItem('scolioscreen_annotated_back');
        const annAdamStr = sessionStorage.getItem('scolioscreen_annotated_adam');
        setAnnotatedBackView(annBackStr || null);
        setAnnotatedAdamView(annAdamStr || null);

        const lmStr = sessionStorage.getItem('scolioscreen_back_landmarks');
        const adamLmStr = sessionStorage.getItem('scolioscreen_adam_landmarks');
        if (!lmStr) {
          console.error('Session storage: scolioscreen_back_landmarks is missing');
          setError('missing_landmarks');
          setLoading(false);
          return;
        }

        let backLms: NormalizedLandmark[] = [];
        let adamLms: NormalizedLandmark[] | null = null;
        try {
          backLms = JSON.parse(lmStr);
          if (adamLmStr) adamLms = JSON.parse(adamLmStr);
        } catch (e) {
          console.error('Failed to parse landmarks JSON:', e);
          setError('invalid_landmarks'); return;
        }
        setBackLandmarks(backLms);
        setAdamLandmarks(adamLms);

        const adamMetricsStr = sessionStorage.getItem('scolioscreen_adam_metrics');
        if (adamMetricsStr) {
          try {
            setAdamMetrics(JSON.parse(adamMetricsStr));
          } catch(e) {}
        }

        // --- LOCAL CALCULATION ---
        const LEFT_SHOULDER = 11;
        const RIGHT_SHOULDER = 12;
        const LEFT_HIP = 23;
        const RIGHT_HIP = 24;

        if (!backLms[LEFT_SHOULDER] || !backLms[RIGHT_SHOULDER] || !backLms[LEFT_HIP] || !backLms[RIGHT_HIP]) {
          console.error('Required landmarks missing from array');
          setError('missing_landmarks');
          setLoading(false);
          return;
        }

        // Use a virtual canvas reference for consistent angle calculation
        const vHeight = 1000;
        const vWidth = 1000;

        const calcAngle = (p1: NormalizedLandmark, p2: NormalizedLandmark, isVertical = false) => {
          const dy = (p2.y - p1.y) * vHeight;
          const dx = (p2.x - p1.x) * vWidth;
          if (isVertical) return Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
          return Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
        };

        sAngle = calcAngle(backLms[LEFT_SHOULDER], backLms[RIGHT_SHOULDER]) * 2;
        hAngle = calcAngle(backLms[LEFT_HIP], backLms[RIGHT_HIP]) * 2;
        spineDev = (sAngle * 0.5) + (hAngle * 0.5);

        // Risk Thresholds (Cobb Angle based)
        if (spineDev < 10) {
          riskScore = Math.round(spineDev * 1.5); // 0-15%
          riskLevel = { th: 'ปกติ', en: 'Normal' };
        } else if (spineDev < 25) {
          riskScore = 16 + Math.round(((spineDev - 10) / 15) * 24); // 16-40%
          riskLevel = { th: 'น้อย (Mild)', en: 'Mild' };
        } else if (spineDev <= 45) {
          riskScore = 41 + Math.round(((spineDev - 25) / 20) * 29); // 41-70%
          riskLevel = { th: 'ปานกลาง (Moderate)', en: 'Moderate' };
        } else {
          riskScore = 71 + Math.min(Math.round(((spineDev - 45) / 45) * 29), 29); // 71-100%
          riskLevel = { th: 'มาก (Severe)', en: 'Severe' };
        }

        // --- END LOCAL CALCULATION ---

        const initialStandingMetrics: StandingMetrics = {
          sAngle,
          hAngle,
          spineDev,
          riskScore,
          riskLevel,
          landmarks: backLms
        };

        setFinalStandingMetrics(initialStandingMetrics);

        // Provide partial results to display the first analysis immediately,
        // but keep loading false so user can interact.
        setResult({
          riskScore,
          riskLevel,
          findings: { th: [], en: [] },
          recommendations: { th: [], en: [] },
          shoulderAnalysis: { th: `${sAngle.toFixed(1)}°`, en: `${sAngle.toFixed(1)}°` },
          hipAnalysis: { th: `${hAngle.toFixed(1)}°`, en: `${hAngle.toFixed(1)}°` },
          waistAnalysis: { th: `${spineDev.toFixed(1)}°`, en: `${spineDev.toFixed(1)}°` }
        });
        setLoading(false);

      } catch (e: any) {
        console.error('Analysis process error:', e);

        // If we have at least the local calculations, don't show the error page
        // Instead, show a simple fallback result
        if (typeof riskScore !== 'undefined' && riskLevel) {
          setResult({
            riskScore,
            riskLevel,
            findings: {
              th: ['ตรวจพบความคลาดเคลื่อนเบื้องต้นจากเซนเซอร์'],
              en: ['Detected preliminary deviations from sensors']
            },
            recommendations: {
              th: ['กรุณาตรวจสอบท่าทางการยืนและถ่ายภาพใหม่อีกครั้งเพื่อความแม่นยำ'],
              en: ['Please check your posture and retake photos for better accuracy']
            },
            shoulderAnalysis: { th: `${sAngle.toFixed(1)}°`, en: `${sAngle.toFixed(1)}°` },
            hipAnalysis: { th: `${hAngle.toFixed(1)}°`, en: `${hAngle.toFixed(1)}°` },
            waistAnalysis: { th: `${spineDev.toFixed(1)}°`, en: `${spineDev.toFixed(1)}°` },
            explanation: {
              th: `(โหมดสำรอง) ระบบไม่สามารถเชื่อมต่อ AI ได้ชั่วคราว แต่ผลการคำนวณจากร่างกายของคุณคือ ${riskLevel.th} (${riskScore}%)`,
              en: `(Fallback Mode) AI connection failed, but your calculated risk is ${riskLevel.en} (${riskScore}%).`
            }
          });
          toast({
            title: language === 'th' ? 'การเชื่อมต่อ AI ขัดข้อง' : 'AI Connection Issue',
            description: language === 'th' ? 'แสดงผลการวิเคราะห์เบื้องต้นด้วยระบบสำรอง' : 'Showing preliminary analysis using fallback system.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        } else {
          setError(e.message || 'unknown');
        }
      } finally {
        setLoading(false);
      }
    };

    analyze();
  }, [user, language, toast]);

  const generateFinalSummary = async (
    sAngle: number,
    hAngle: number,
    spineDev: number,
    riskScore: number,
    riskLevel: { th: string, en: string },
    adamResult: { angle: number; level: { th: string; en: string }; isAbnormal: boolean } | null
  ) => {
    setLoading(true);

    try {
      let explanation = { th: '', en: '' };
      let recommendations = { th: [] as string[], en: [] as string[] };
      let findings = { th: [] as string[], en: [] as string[] };

      // Initialize Gemini AI if key exists
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        const genAI = new GoogleGenerativeAI(apiKey);

        // Get images for vision analysis
        const imagesStr = sessionStorage.getItem('scolioscreen_images');
        const images = imagesStr ? JSON.parse(imagesStr) : [];

        const prompt = `
          You are a specialized Scoliosis Analysis AI. 
          Analyze the attached images (Back View and Adam Test) and the following measurements:
          - Shoulder Tilt: ${sAngle.toFixed(1)}°
          - Hip Tilt: ${hAngle.toFixed(1)}°
          - Combined Spine Deviation Score: ${spineDev.toFixed(1)}°
          - Overall Risk Score: ${riskScore}% (${riskLevel.en})
          ${adamResult ? `- Adam Test Angle: ${adamResult.angle.toFixed(1)}° (${adamResult.level.en})` : ''}

          Please provide a summary in both THAI and ENGLISH.
          FORMAT:
          EXPLANATION_TH: [Summary of the results in Thai]
          EXPLANATION_EN: [Summary of the results in English]
          FINDINGS_TH: [Bulleted list, max 3 items in Thai]
          FINDINGS_EN: [Bulleted list, max 3 items in English]
          RECOMMENDATIONS_TH: [Bulleted list, max 3 items in Thai]
          RECOMMENDATIONS_EN: [Bulleted list, max 3 items in English]

          Note: Use the images to refine your analysis (e.g., mention specific asymmetry or rib humps visible). 
          Keep the advice medical-professional but clearly state it's an AI screening, not a clinical diagnosis.
        `;

        for (const modelName of modelNames) {
          try {
            console.log(`Attempting analysis with ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Prepare content parts (Text + Images)
            const parts: any[] = [{ text: prompt }];
            images.forEach((imgBase64: string) => {
              if (imgBase64 && imgBase64.includes(',')) {
                parts.push({
                  inlineData: {
                    data: imgBase64.split(',')[1],
                    mimeType: "image/jpeg"
                  }
                });
              }
            });

            const result = await model.generateContent(parts);
            const responseText = result.response.text();

            // Simple parser for AI response
            const sections = responseText.split('\n');
            const newExplanationTh = sections.find(s => s.startsWith('EXPLANATION_TH:'))?.replace('EXPLANATION_TH:', '').trim() || "";
            const newExplanationEn = sections.find(s => s.startsWith('EXPLANATION_EN:'))?.replace('EXPLANATION_EN:', '').trim() || "";

            if (newExplanationTh) {
              explanation.th = newExplanationTh;
              explanation.en = newExplanationEn;

              // Extract bullet points
              const extractList = (prefix: string) => {
                const startIdx = sections.findIndex(s => s.startsWith(prefix));
                if (startIdx === -1) return [];
                const list = [];
                for (let i = startIdx + 1; i < sections.length; i++) {
                  if (sections[i].trim().startsWith('-') || sections[i].trim().startsWith('*')) {
                    list.push(sections[i].replace(/^[-*]\s*/, '').trim());
                  } else if (sections[i].includes(':') || sections[i].trim() === "") {
                    break;
                  }
                }
                return list.slice(0, 3);
              };

              findings.th = extractList('FINDINGS_TH:');
              findings.en = extractList('FINDINGS_EN:');
              recommendations.th = extractList('RECOMMENDATIONS_TH:');
              recommendations.en = extractList('RECOMMENDATIONS_EN:');

              console.log(`Success with ${modelName}`);
              break; // Success! Exit the loop
            }
          } catch (aiErr) {
            console.warn(`${modelName} failed, trying next...`, aiErr);
            // Loop continues to next model
          }
        }
      }

      // Fallback logic if AI failed or explanation is empty
      if (!explanation.th) {
        if (riskScore <= 25) {
          explanation.th = "ยังไม่เข้าเกณฑ์ภาวะกระดูกสันหลังคด";
          explanation.en = "Does not meet the criteria for scoliosis.";
          recommendations.th = ["ควรเฝ้าสังเกตท่าทางและความสมมาตรของลำตัวอย่างต่อเนื่อง หากพบว่ามีความเอียงเด่นชัดขึ้น หรือมีอาการผิดปกติ เช่น ปวดหลังมาก อ่อนแรง ชา หรือมีการเปลี่ยนแปลงอย่างรวดเร็ว ควรเข้ารับการประเมินโดยแพทย์เพิ่มเติม"];
          recommendations.en = ["Continue to monitor posture and body symmetry. If asymmetry becomes prominent or if you experience severe back pain, weakness, numbness, or rapid changes, please consult a doctor for further evaluation."];
        } else if (riskScore <= 50) {
          explanation.th = "ตรวจพบภาวะกระดูกสันหลังคดระดับเล็กน้อย";
          explanation.en = "Mild scoliosis detected.";
          recommendations.th = ["โดยทั่วไปแนะนำการติดตามอาการและพบแพทย์เพื่อตรวจประเมินเป็นระยะ ร่วมกับการออกกำลังกายหรือกายภาพบำบัดตามความเหมาะสม เพื่อช่วยดูแลท่าทาง การเคลื่อนไหว และลดโอกาสการลุกลามของความผิดรูป"];
          recommendations.en = ["Generally, regular monitoring and periodic medical check-ups are recommended, along with appropriate exercise or physical therapy to maintain posture, mobility, and reduce the risk of progression."];
        } else if (riskScore <= 75) {
          explanation.th = "ตรวจพบภาวะกระดูกสันหลังคดระดับปานกลาง";
          explanation.en = "Moderate scoliosis detected.";
          recommendations.th = ["ควรได้รับการติดตามโดยแพทย์อย่างใกล้ชิด และในผู้ป่วยที่ยังโตไม่เต็มที่อาจพิจารณาใช้เสื้อเกราะดามหลังร่วมกับกายภาพบำบัด เพื่อช่วยควบคุมการลุกลามของความโค้ง"];
          recommendations.en = ["Close medical monitoring is advised. For patients still growing, bracing along with physical therapy may be considered to help control the progression of the curve."];
        } else {
          explanation.th = "ตรวจพบภาวะกระดูกสันหลังคดระดับรุนแรง";
          explanation.en = "Severe scoliosis detected.";
          recommendations.th = ["ควรได้รับการประเมินโดยแพทย์ผู้เชี่ยวชาญด้านกระดูกสันหลังโดยเร็วเพื่อวางแผนการรักษาอย่างเหมาะสม เนื่องจากอาจจำเป็นต้องพิจารณาการรักษาเชิงรุกมากขึ้น รวมถึงการผ่าตัดในบางราย"];
          recommendations.en = ["Prompt evaluation by a spine specialist is highly recommended to plan appropriate treatment, as more aggressive interventions, potentially including surgery, may be necessary in some cases."];
        }
      }

      setResult(prev => {
        const baseRiskScore = prev ? prev.riskScore : riskScore;
        const baseRiskLevel = prev ? prev.riskLevel : riskLevel;

        return {
          ...prev!,
          riskScore: baseRiskScore,
          riskLevel: baseRiskLevel,
          findings: findings.th.length > 0 ? findings : prev?.findings || { th: [], en: [] },
          recommendations: recommendations.th.length > 0 ? recommendations : prev?.recommendations || { th: [], en: [] },
          shoulderAnalysis: { th: `${sAngle.toFixed(1)}°`, en: `${sAngle.toFixed(1)}°` },
          hipAnalysis: { th: `${hAngle.toFixed(1)}°`, en: `${hAngle.toFixed(1)}°` },
          waistAnalysis: { th: `${spineDev.toFixed(1)}°`, en: `${spineDev.toFixed(1)}°` },
          explanation: explanation
        };
      });

      // Save to local storage screening history if user is logged in
      if (user) {
        try {
          const storageKey = `scolioscreen_screenings_${user.id}`;
          const currentScreenings = JSON.parse(localStorage.getItem(storageKey) || '[]');
          currentScreenings.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            risk_score: riskScore,
            risk_level: riskLevel,
            findings: findings,
            recommendations: recommendations,
            created_at: new Date().toISOString()
          });
          localStorage.setItem(storageKey, JSON.stringify(currentScreenings));
        } catch (e) {
          console.error('Failed to save to local history:', e);
        }
      }
    } catch (err: any) {
      console.error('Explanation error:', err);
      // Fallback
      setResult(prev => ({
        ...prev!,
        findings: { th: ['เกิดข้อผิดพลาดในการประมวลผลข้อความ'], en: ['Error during text processing'] },
        recommendations: { th: ['โปรดปรึกษาแพทย์หากมีความกังวล'], en: ['Consult a doctor if you have concerns'] },
        explanation: { th: `หน้าจอแสดงผลขัดข้อง`, en: `Display error` }
      }));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!finalStandingMetrics) return;

    // Calculate combined score
    const getRiskLevelFromScore = (score: number) => {
      if (score <= 15) return { th: 'ปกติ', en: 'Normal' };
      if (score <= 40) return { th: 'น้อย (Mild)', en: 'Mild' };
      if (score <= 70) return { th: 'ปานกลาง (Moderate)', en: 'Moderate' };
      return { th: 'มาก (Severe)', en: 'Severe' };
    };

    let finalScore = finalStandingMetrics.riskScore;
    let finalLevel = finalStandingMetrics.riskLevel;

    const needsAdam = !!adamViewImage;
    if (needsAdam && adamMetrics) {
      const adamScore = Math.min(100, Math.round((adamMetrics.angle / 40) * 100));
      finalScore = Math.round((finalStandingMetrics.riskScore + adamScore) / 2);
      finalLevel = getRiskLevelFromScore(finalScore);
    }

    generateFinalSummary(
      finalStandingMetrics.sAngle,
      finalStandingMetrics.hAngle,
      finalStandingMetrics.spineDev,
      finalScore,
      finalLevel,
      adamMetrics || null
    );

  }, [finalStandingMetrics, adamMetrics, adamViewImage]);


  const getRiskColor = (score: number) => {
    if (score < 25) return 'text-green-500';
    if (score < 50) return 'text-yellow-500';
    if (score < 75) return 'text-orange-500';
    return 'text-destructive';
  };

  const getRiskBg = (score: number) => {
    if (score < 25) return 'bg-green-500';
    if (score < 50) return 'bg-yellow-500';
    if (score < 75) return 'bg-orange-500';
    return 'bg-destructive';
  };

  // Loading state
  if (loading && !result) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Activity className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <Loader2 className="h-6 w-6 text-primary animate-spin absolute -top-1 -right-1 mx-auto" style={{ left: 'calc(50% + 20px)' }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              {language === 'th' ? 'กำลังวิเคราะห์ด้วย AI...' : 'Analyzing with AI...'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'th' ? 'กรุณารอสักครู่ AI กำลังประมวลผลภาพถ่าย' : 'Please wait while AI processes your photos'}
            </p>
          </div>
          <Progress value={66} className="h-2" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">
            {language === 'th' ? 'ไม่สามารถวิเคราะห์ได้' : 'Analysis Failed'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {error === 'no_images'
              ? (language === 'th' ? 'ไม่พบภาพถ่าย กรุณาถ่ายภาพใหม่' : 'No photos found. Please take photos again.')
              : error === 'missing_landmarks'
                ? (language === 'th' ? 'ไม่พบตำแหน่งร่างกายในภาพ กรุณาถ่ายใหม่ให้เห็นไหล่และเอวชัดเจน' : 'Body landmarks not detected. Please retake ensuring shoulders and waist are visible.')
                : error === 'api_key_missing'
                  ? (language === 'th' ? 'ยังไม่ได้ตั้งค่า Google AI API Key' : 'Google AI API Key is missing.')
                  : (
                    <div className="space-y-2">
                      <p>{language === 'th' ? 'เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง' : 'An error occurred during processing. Please try again.'}</p>
                      <p className="text-[10px] opacity-70 font-mono">Debug: {error}</p>
                    </div>
                  )}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              {language === 'th' ? 'หน้าแรก' : 'Home'}
            </Button>
            <Button onClick={() => navigate('/capture')} className="flex-1">
              {language === 'th' ? 'ถ่ายใหม่' : 'Retake'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const lang = language === 'th' ? 'th' : 'en';

  const getRiskLevelFromScore = (score: number) => {
    if (score <= 15) return { th: 'ปกติ', en: 'Normal' };
    if (score <= 40) return { th: 'น้อย (Mild)', en: 'Mild' };
    if (score <= 70) return { th: 'ปานกลาง (Moderate)', en: 'Moderate' };
    return { th: 'มาก (Severe)', en: 'Severe' };
  };

  let finalRiskScoreText = "-";
  let finalRiskScoreNum = 0;
  let finalRiskLevel = { th: '-', en: '-' };
  let currentRiskColor = "text-muted-foreground";
  let currentRiskBg = "bg-muted";
  let barWidth = "0%";

  if (result) {
    if (adamViewImage) {
      if (adamMetrics) {
        const adamScore = Math.min(100, Math.round((adamMetrics.angle / 40) * 100));
        finalRiskScoreNum = Math.round((result.riskScore + adamScore) / 2);
        finalRiskScoreText = `${finalRiskScoreNum}`;
        finalRiskLevel = getRiskLevelFromScore(finalRiskScoreNum);
      } else {
        finalRiskScoreText = "-";
        finalRiskScoreNum = 0;
      }
    } else {
      finalRiskScoreNum = result.riskScore;
      finalRiskScoreText = `${finalRiskScoreNum}`;
      finalRiskLevel = getRiskLevelFromScore(finalRiskScoreNum);
    }

    if (finalRiskScoreText !== "-") {
      currentRiskColor = getRiskColor(finalRiskScoreNum);
      currentRiskBg = getRiskBg(finalRiskScoreNum);
      barWidth = `${finalRiskScoreNum}%`;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('back')}</span>
          </button>
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold hidden sm:block">{t('appName')}</span>
          </div>
        </div>
        <UserDisplay />
        <div className="flex items-center gap-1">
          <LogoutToggle />
          <LanguageToggle />
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-5">
        
        {/* Annotated Images */}
        {(annotatedBackView || annotatedAdamView) && (
          <div className={`grid ${annotatedBackView && annotatedAdamView ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {annotatedBackView && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground ml-1">{language === 'th' ? 'ท่าหันหลัง' : 'Back View'}</span>
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border/50 bg-black/5 relative">
                  <img src={annotatedBackView} alt="Annotated Back View" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            {annotatedAdamView && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground ml-1">{language === 'th' ? 'ท่าก้มตัว' : 'Adam Test'}</span>
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border/50 bg-black/5 relative">
                  <img src={annotatedAdamView} alt="Annotated Adam Test View" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Risk Score */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-base">
              {language === 'th' ? 'ผลการคัดกรอง' : 'Screening Result'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <div className={`text-5xl font-bold ${currentRiskColor}`}>
              {finalRiskScoreText !== "-" ? `${finalRiskScoreText}%` : "-%"}
            </div>
            <div className={`text-lg font-semibold ${currentRiskColor}`}>{finalRiskLevel[lang]}</div>
            <div className="relative h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${currentRiskBg}`}
                style={{ width: barWidth }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {language === 'th' ? 'วิเคราะห์โดย AI — ไม่ใช่การวินิจฉัยทางการแพทย์' : 'AI-powered analysis — not a medical diagnosis'}
            </p>
          </CardContent>
        </Card>

        {/* Measured Metrics */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              {language === 'th' ? 'ข้อมูลที่วัดได้จริง' : 'Measured Metrics'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">{language === 'th' ? 'ไหล่เอียง:' : 'Shoulder Tilt:'}</span>
              <span className="font-semibold">{result.shoulderAnalysis?.[lang]}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">{language === 'th' ? 'สะโพกเอียง:' : 'Hip Tilt:'}</span>
              <span className="font-semibold">{result.hipAnalysis?.[lang]}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">{language === 'th' ? 'ค่า Spine Deviation:' : 'Spine Deviation:'}</span>
              <span className="font-semibold">{result.waistAnalysis?.[lang]}</span>
            </div>
            {adamMetrics && (
              <div className="flex justify-between items-center py-1 border-b border-border/30">
                <span className="text-sm text-muted-foreground">{language === 'th' ? 'องศา Adam Test:' : 'Adam Test Angle:'}</span>
                <span className="font-semibold">{adamMetrics.angle.toFixed(1)}° ({adamMetrics.level[lang]})</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Explanation */}
        {loading && result ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-primary">
                {language === 'th' ? 'AI กำลังประมวลผลสรุป...' : 'AI is generating summary...'}
              </p>
            </CardContent>
          </Card>
        ) : result?.explanation && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                {language === 'th' ? 'สรุปการวิเคราะห์' : 'Analysis Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {result.explanation[lang]}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Findings */}
        {result?.findings && result.findings[lang] && result.findings[lang].length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                {language === 'th' ? 'สัญญาณที่พบ' : 'Findings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.findings[lang].map((f: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {result?.recommendations && result.recommendations[lang] && result.recommendations[lang].length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                {language === 'th' ? 'คำแนะนำ' : 'Recommendations'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations[lang].map((r: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="bg-accent/30 border-accent">
          <CardContent className="p-3">
            <p className="text-[11px] text-accent-foreground leading-relaxed">
              {t('disclaimer') as string}
            </p>
          </CardContent>
        </Card>

        <Button onClick={() => navigate('/')} variant="outline" className="w-full h-11 rounded-xl">
          <Home className="h-4 w-4 mr-2" />
          {language === 'th' ? 'กลับหน้าแรก' : 'Back to Home'}
        </Button>
      </main>
    </div >
  );
};

export default ResultPage;
