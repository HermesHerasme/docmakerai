import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  es: {
    // App Header & Meta
    'app.title': 'DocMaker AI',
    'header.login': 'Iniciar Sesión',
    'header.plans': 'Planes',
    'header.history': 'Historial',
    'header.logout': 'Cerrar Sesión',
    'header.menu': 'Menú',
    
    // Auth Modal
    'auth.welcome': 'Bienvenido a DocMaker',
    'auth.subtitle': 'Inicia sesión o regístrate automáticamente con tu cuenta favorita para continuar.',
    'auth.continue_google': 'Continuar con Google',
    'auth.continue_apple': 'Continuar con Apple',
    'auth.continue_microsoft': 'Continuar con Microsoft',
    'auth.terms': 'Al continuar, aceptas nuestros',
    'auth.terms_link': 'Términos de Servicio',
    'auth.privacy_link': 'Política de Privacidad',

    // Input Section
    'input.placeholder': 'Escribe aquí la instrucción para tu documento... (Ej: Carta de renuncia formal para mi puesto de diseñador senior)',
    'input.humanize': 'Humanizar',
    'input.humanize_premium': 'Humanizar (Premium)',
    'input.mode_color': 'Color',
    'input.mode_bw': 'B/N',
    'input.pages': 'páginas',
    'input.generated_count': 'generados',
    'input.generate_btn': 'Generar Documento',
    'input.processing': 'Procesando...',
    'input.page_title': 'Cantidad de páginas',

    // Plan Features
    'plan.feature.watermark_yes': 'Marca de agua en pie de página',
    'plan.feature.watermark_no': 'Sin marcas de agua',

    // Plans
    'plan.free.name': 'Inicial',
    'plan.free.label': 'Ideal para probar sin riesgo',
    'plan.free.f1': '3 documentos al mes',
    'plan.free.f2': 'Máx. 3 páginas por documento',
    'plan.free.f3': 'Descarga PDF básica',
    'plan.btn.select': 'Empezar Gratis',
    
    'plan.premium.name': 'Escritor Pro',
    'plan.premium.label': 'El favorito de estudiantes 🔥',
    'plan.premium.f1': '50 documentos al mes',
    'plan.premium.f2': 'Máx. 10 páginas por documento',
    'plan.feature.editor': 'Editor de documentos',
    'plan.premium.f3': 'Humanizar texto con IA',
    'plan.premium.f4': 'Historial completo de docs',
    'plan.premium.f5': 'Generación rápida',
    'plan.btn.upgrade': 'Mejorar Plan',

    'plan.pro.name': 'Power',
    'plan.pro.label': 'Para uso profesional 🚀',
    'plan.pro.f1': '100 documentos al mes',
    'plan.pro.f2': 'Máx. 25 páginas por documento',
    'plan.pro.f4': 'Humanización avanzada',
    'plan.pro.f5': 'Máxima prioridad y velocidad',

    'plan.modal.title': 'Invierte en tu productividad',
    'plan.current': 'Plan Actual',

    // Document & History
    'doc.empty_state': 'Tu documento aparecerá aquí',
    'doc.download_pdf': 'Imprimir / Descargar PDF',
    'doc.history_empty': 'Sin documentos recientes',
    'doc.open': 'Abrir',
    'doc.ready_mobile': 'Documento listo',
    'doc.edit': 'Editar documento',
    'doc.save_edit': 'Terminar edición',

    // Paper Navigation
    'paper.page': 'Página',
    'paper.of': 'de',
    'paper.prev': 'Página anterior',
    'paper.next': 'Página siguiente',

    // Alerts
    'alert.error_gen': 'Error generando documento',
  },
  en: {
    // App Header & Meta
    'app.title': 'DocMaker AI',
    'header.login': 'Log In',
    'header.plans': 'Plans',
    'header.history': 'History',
    'header.logout': 'Log Out',
    'header.menu': 'Menu',

    // Auth Modal
    'auth.welcome': 'Welcome to DocMaker',
    'auth.subtitle': 'Log in or sign up automatically with your favorite account to continue.',
    'auth.continue_google': 'Continue with Google',
    'auth.continue_apple': 'Continue with Apple',
    'auth.continue_microsoft': 'Continue with Microsoft',
    'auth.terms': 'By continuing, you agree to our',
    'auth.terms_link': 'Terms of Service',
    'auth.privacy_link': 'Privacy Policy',

    // Input Section
    'input.placeholder': 'Enter instructions for your document here... (Ex: Formal resignation letter for my senior designer position)',
    'input.humanize': 'Humanize',
    'input.humanize_premium': 'Humanize (Premium)',
    'input.mode_color': 'Color',
    'input.mode_bw': 'B/W',
    'input.pages': 'pages',
    'input.generated_count': 'generated',
    'input.generate_btn': 'Generate Document',
    'input.processing': 'Processing...',
    'input.page_title': 'Page Count',

    // Plan Features
    'plan.feature.watermark_yes': 'Footer watermark included',
    'plan.feature.watermark_no': 'No watermarks',

    // Plans
    'plan.free.name': 'Starter',
    'plan.free.label': 'Perfect for testing risk-free',
    'plan.free.f1': '3 documents per month',
    'plan.free.f2': 'Max 3 pages per document',
    'plan.free.f3': 'Basic PDF Download',
    'plan.btn.select': 'Start for Free',

    'plan.premium.name': 'Pro Writer',
    'plan.premium.label': 'Most Popular Choice 🔥',
    'plan.premium.f1': '50 documents per month',
    'plan.premium.f2': 'Max 10 pages per document',
    'plan.feature.editor': 'Document Editor',
    'plan.premium.f3': 'AI Text Humanization',
    'plan.premium.f4': 'Full History Access',
    'plan.premium.f5': 'Fast Generation',
    'plan.btn.upgrade': 'Upgrade Plan',

    'plan.pro.name': 'Power',
    'plan.pro.label': 'For Agencies & Pros 🚀',
    'plan.pro.f1': '100 documents per month',
    'plan.pro.f2': 'Max 25 pages per document',
    'plan.pro.f4': 'Advanced Humanization',
    'plan.pro.f5': 'Priority Processing',

    'plan.modal.title': 'Choose your productivity boost',
    'plan.current': 'Current',

    // Document & History
    'doc.empty_state': 'Your document will appear here',
    'doc.download_pdf': 'Print / Download PDF',
    'doc.history_empty': 'No recent documents',
    'doc.open': 'Open',
    'doc.ready_mobile': 'Document ready',
    'doc.edit': 'Edit document',
    'doc.save_edit': 'Finish editing',

    // Paper Navigation
    'paper.page': 'Page',
    'paper.of': 'of',
    'paper.prev': 'Previous page',
    'paper.next': 'Next page',

    // Alerts
    'alert.error_gen': 'Error generating document',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    // Simple detection logic
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en') {
      setLanguage('en');
    } else {
      setLanguage('es'); // Default to Spanish for others
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};