import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const LogoutToggle = () => {
    const { user, signOut } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-muted-foreground hover:text-destructive transition-colors"
            title={language === 'th' ? 'ออกจากระบบ' : 'Log Out'}
        >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-medium uppercase hidden xs:inline">{language === 'th' ? 'OUT' : 'OUT'}</span>
        </Button>
    );
};

export default LogoutToggle;
