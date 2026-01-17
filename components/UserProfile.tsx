import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const UserProfile = () => {
  const { user, logOut, loading } = useAuth();

  if (!user) return null;

  return (
    <motion.div 
      className="flex items-center space-x-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <img 
        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=0ea5e9&color=fff`} 
        alt={user.displayName || 'User'} 
        className="w-10 h-10 rounded-full"
      />
      <div className="hidden md:block">
        <p className="text-sm font-medium text-slate-800">{user.displayName}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={logOut}
        disabled={loading}
        className="text-xs"
      >
        Sign Out
      </Button>
    </motion.div>
  );
};