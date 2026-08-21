import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore.js';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white mx-auto flex items-center justify-center mb-6 shadow-sm">
            <Brain className="w-6 h-6 text-white dark:text-gray-900" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in to ResearchAI</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Or <Link to="/register" className="font-medium text-gray-900 dark:text-white hover:underline transition-all">create an account</Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-5 bg-white dark:bg-[#111111] p-8 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
              <input
                type="email" required
                className="w-full bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-sm"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password" required
                className="w-full bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow text-sm"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
          
          <button
            type="submit" disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
