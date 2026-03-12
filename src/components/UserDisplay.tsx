import { useAuth } from '@/contexts/AuthContext';
import { User, Sparkles } from 'lucide-react';

const UserDisplay = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/30 rounded-full border border-border/50 backdrop-blur-sm animate-fade-in">
                {user.username ? (
                    <>
                        <User className="h-3 w-3 text-primary" />
                        <span className="text-[11px] font-bold text-foreground truncate max-w-[100px]">
                            {user.username}
                        </span>
                    </>
                ) : (
                    <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-warning animate-pulse" />
                        <span className="text-[10px] items-center text-muted-foreground font-medium">
                            ✨ Cute User
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDisplay;
