import React, { useState } from 'react';
import { X, Github } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSocialLogin = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('auth.welcome')}
            </h2>
            <p className="text-gray-400 text-sm">
              {t('auth.subtitle')}
            </p>
          </div>

          <div className="space-y-3">
            {/* Google */}
            <button 
              onClick={handleSocialLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {t('auth.continue_google')}
            </button>

            {/* Apple */}
            <button 
               onClick={handleSocialLogin}
               disabled={loading}
               className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1A1A1A] text-white border border-[#333] font-medium rounded-lg hover:bg-[#252525] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.82 3.8-.82.4 0 2.29.04 3.7 1.69-3.19 1.54-2.68 5.76.54 7.18-.51 1.36-1.15 2.71-2.1 4.14-1.02 1.54-2.17 3.08-3.08 4.14zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.16 2.38-2.11 4.22-3.74 4.25z"/>
              </svg>
              {t('auth.continue_apple')}
            </button>

             {/* Microsoft */}
             <button 
               onClick={handleSocialLogin}
               disabled={loading}
               className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1A1A1A] text-white border border-[#333] font-medium rounded-lg hover:bg-[#252525] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              {t('auth.continue_microsoft')}
            </button>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            {t('auth.terms')} <a href="#" className="underline hover:text-gray-300">{t('auth.terms_link')}</a> & <a href="#" className="underline hover:text-gray-300">{t('auth.privacy_link')}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};