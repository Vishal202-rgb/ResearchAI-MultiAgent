import { Link } from 'react-router-dom';
import { Brain, LogOut, Sun, Moon } from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import { useTheme } from '../hooks/useTheme.js';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded bg-gray-900 dark:bg-white flex items-center justify-center transition-transform group-hover:scale-105">
            <Brain className="w-4 h-4 text-white dark:text-gray-900" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
            ResearchAI
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/library" 
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Library
          </Link>
          <button 
            onClick={toggleTheme} 
            className="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors rounded-md"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-800"></div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium hidden sm:block">
              {user?.name}
            </span>
            <button 
              onClick={() => logout()} 
              className="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors rounded-md" 
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
