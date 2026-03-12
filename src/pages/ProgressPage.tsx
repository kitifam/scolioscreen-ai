import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Scan, Activity, TrendingUp, History, ClipboardList, Save } from 'lucide-react';
import UserDisplay from '@/components/UserDisplay';
import LogoutToggle from '@/components/LogoutToggle';
import LanguageToggle from '@/components/LanguageToggle';

interface ScreeningData {
    id: string;
    risk_score: number;
    created_at: string;
}

interface SymptomData {
    id: string;
    pain_level: number;
    location: string;
    notes: string;
    created_at: string;
}

const ProgressPage = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { toast } = useToast();

    const [screenings, setScreenings] = useState<ScreeningData[]>([]);
    const [symptoms, setSymptoms] = useState<SymptomData[]>([]);
    const [painLevel, setPainLevel] = useState([0]);
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            const screeningKey = `scolioscreen_screenings_${user.id}`;
            const symptomKey = `scolioscreen_symptoms_${user.id}`;

            const savedScreenings = JSON.parse(localStorage.getItem(screeningKey) || '[]');
            const savedSymptoms = JSON.parse(localStorage.getItem(symptomKey) || '[]');

            setScreenings(savedScreenings);
            setSymptoms(savedSymptoms);
        }
    }, [user]);

    const handleSaveSymptom = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            const symptomKey = `scolioscreen_symptoms_${user.id}`;
            const newSymptom: SymptomData = {
                id: crypto.randomUUID(),
                pain_level: painLevel[0],
                location,
                notes,
                created_at: new Date().toISOString()
            };

            const updatedSymptoms = [newSymptom, ...symptoms];
            localStorage.setItem(symptomKey, JSON.stringify(updatedSymptoms));
            setSymptoms(updatedSymptoms);

            toast({
                title: t('symptomSaved') as string,
            });

            setLocation('');
            setNotes('');
            setPainLevel([0]);
        } catch (error) {
            console.error('Error saving symptom:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Prepare chart data
    const chartData = [...screenings, ...symptoms]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(item => ({
            date: format(new Date(item.created_at), 'dd/MM', { locale: language === 'th' ? th : enUS }),
            timestamp: new Date(item.created_at).getTime(),
            risk: (item as ScreeningData).risk_score,
            pain: (item as SymptomData).pain_level !== undefined ? (item as SymptomData).pain_level * 10 : undefined,
        }));

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

            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold">{t('trackProgress')}</h1>
                    <p className="text-sm text-muted-foreground">{language === 'th' ? 'ติดตามผลวิเคราะห์และบันทึกร่างกาย' : 'Monitor results and physical logs'}</p>
                </div>

                {/* Progress Chart */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {t('progressChart')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {chartData.length > 0 ? (
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `${val}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', fontSize: '10px' }}
                                            labelStyle={{ fontWeight: 'bold' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                                        <Line
                                            name={t('riskScoreTrend') as string}
                                            type="monotone"
                                            dataKey="risk"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                                            activeDot={{ r: 6 }}
                                            connectNulls
                                        />
                                        <Line
                                            name={t('painTrend') as string}
                                            type="monotone"
                                            dataKey="pain"
                                            stroke="hsl(var(--destructive))"
                                            strokeWidth={2}
                                            dot={{ r: 4, fill: 'hsl(var(--destructive))' }}
                                            activeDot={{ r: 6 }}
                                            connectNulls
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground space-y-2">
                                <Activity className="h-8 w-8 opacity-20" />
                                <p className="text-xs">{t('noData')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Symptom Log Form */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3 border-b border-border/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            {t('symptomLog')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-semibold">{t('painLevel')}</Label>
                                    <span className={`text-sm font-bold ${painLevel[0] > 7 ? 'text-destructive' : painLevel[0] > 3 ? 'text-orange-500' : 'text-green-500'}`}>
                                        {painLevel[0]} / 10
                                    </span>
                                </div>
                                <Slider
                                    value={painLevel}
                                    onValueChange={setPainLevel}
                                    max={10}
                                    step={1}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>{t('painLevel0')}</span>
                                    <span>{t('painLevel5')}</span>
                                    <span>{t('painLevel10')}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-sm font-semibold">{t('location')}</Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder={language === 'th' ? 'เช่น หลังส่วนล่าง, บ่าซ้าย' : 'e.g., Lower back, Left shoulder'}
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-semibold">{t('notes')}</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={language === 'th' ? 'ระบุรายละเอียดเพิ่มเติม' : 'Add details about your symptoms'}
                                    className="min-h-[80px]"
                                />
                            </div>

                            <Button
                                onClick={handleSaveSymptom}
                                className="w-full h-11 text-sm font-bold"
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {t('saveLog')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent History */}
                {(screenings.length > 0 || symptoms.length > 0) && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-sm flex items-center gap-2 px-1 text-muted-foreground">
                            <History className="h-4 w-4" />
                            {t('history')}
                        </h3>
                        <div className="space-y-2">
                            {[...screenings.map(s => ({ ...s, type: 'screening' })), ...symptoms.map(s => ({ ...s, type: 'symptom' }))]
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .slice(0, 5)
                                .map((item: any, i) => (
                                    <Card key={i} className="border-border/50 bg-card overflow-hidden">
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'screening' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                                                        {item.type === 'screening' ? <Scan className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold leading-none">
                                                            {item.type === 'screening'
                                                                ? (language === 'th' ? `ผลคัดกรอง: ${item.risk_score}%` : `Screening: ${item.risk_score}%`)
                                                                : (language === 'th' ? `บันทึกอาการ: ปวดระดับ ${item.pain_level}` : `Symptom: Pain Level ${item.pain_level}`)
                                                            }
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground mt-1">
                                                            {format(new Date(item.created_at), 'PPPp', { locale: language === 'th' ? th : enUS })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {item.type === 'symptom' && item.location && (
                                                    <span className="text-[10px] bg-accent px-2 py-0.5 rounded-full text-accent-foreground">
                                                        {item.location}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProgressPage;
