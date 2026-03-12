import { useLanguage } from '@/contexts/LanguageContext';
import type { QualityIssue } from '@/hooks/useQualityChecks';

interface QualityWarningsProps {
  issues: QualityIssue[];
}

const ICONS: Record<string, string> = {
  dark: '🌑',
  bright: '☀️',
  backlit: '🔆',
  tilt: '📐',
  blur: '📷',
  multi: '👥',
  twist: '🔄',
  obstruct: '🚫',
};

const QualityWarnings = ({ issues }: QualityWarningsProps) => {
  const { t } = useLanguage();

  if (issues.length === 0) return null;

  return (
    <div className="absolute bottom-32 left-3 right-3 z-30 space-y-1.5">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md text-sm font-bold animate-in slide-in-from-bottom-2 duration-300 ${
            issue.severity === 'error'
              ? 'bg-red-600/90 text-white border border-red-400/50'
              : 'bg-yellow-500/90 text-black border border-yellow-400/50'
          }`}
        >
          <span className="text-base">{ICONS[issue.id] || '⚠️'}</span>
          <span>{t(issue.messageKey as any) as string}</span>
        </div>
      ))}
    </div>
  );
};

export default QualityWarnings;
