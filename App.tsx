
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  History, 
  Menu,
  X,
  LogOut,
  Crown,
  ChevronDown,
  Lock,
  Palette,
  DropletOff,
  Pencil,
  Check,
  FileText,
  Eye
} from 'lucide-react';
import { getPlans } from './constants';
import { User, PlanType, GeneratedDocument } from './types';
import { generateDocumentContent } from './services/geminiService';
import { AuthModal } from './components/AuthModal';
import { Button } from './components/Button';
import { DocumentPaper } from './components/DocumentPaper';
import { DocumentPreview } from './components/DocumentPreview';
import { PlanCard } from './components/PlanCard';
import { Logo } from './components/Logo';
import { useLanguage } from './contexts/LanguageContext';

const PAGE_OPTIONS = [1, 3, 5, 10, 15, 20, 25];

function App() {
  const { t, language } = useLanguage();

  const [user, setUser] = useState<User | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [humanizeEnabled, setHumanizeEnabled] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(false); 
  const [targetPages, setTargetPages] = useState<number>(3);
  const [showPageSelector, setShowPageSelector] = useState(false);

  const [activeTabs, setActiveTabs] = useState<GeneratedDocument[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const pageSelectorRef = useRef<HTMLDivElement>(null);

  const plans = getPlans(t);
  const activeDoc = activeTabs.find(d => d.id === activeTabId) || null;
  const currentPlan = user ? plans[user.plan] : plans[PlanType.FREE];

  const getPlanBadgeStyles = (planId: PlanType) => {
    switch (planId) {
      case PlanType.FREE:
        return 'border-green-500/30 text-green-400 bg-green-500/10';
      case PlanType.PREMIUM:
        return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
      case PlanType.PRO:
        return 'border-purple-500/30 text-purple-400 bg-purple-500/10';
      default:
        return 'border-[#2A2A2A] text-gray-400';
    }
  };

  const getPageLabel = (count: number) => {
    return count === 1 ? t('paper.page').toLowerCase() : t('input.pages');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pageSelectorRef.current && !pageSelectorRef.current.contains(event.target as Node)) {
        setShowPageSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const max = currentPlan.maxPages;
    if (targetPages > max) {
        setTargetPages(max);
    }
  }, [user, currentPlan, targetPages]);

  useEffect(() => {
    setIsEditing(false);
  }, [activeTabId]);

  const openDocumentInTab = (doc: GeneratedDocument) => {
    const exists = activeTabs.find(d => d.id === doc.id);
    if (exists) {
      setActiveTabId(doc.id);
      return;
    }

    let newTabs = [...activeTabs, doc];
    if (newTabs.length > 3) {
      newTabs = newTabs.slice(1);
    }
    
    setActiveTabs(newTabs);
    setActiveTabId(doc.id);
  };

  const handleLogin = () => {
    setUser({
      id: 'user_123',
      name: 'Usuario Demo',
      email: 'demo@docmaker.ai',
      plan: PlanType.FREE,
      generationsUsedToday: 0,
      generationsUsedMonth: 0
    });
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowMobileMenu(false);
    setShowHistory(false);
    setShowPlans(false);
    setActiveTabs([]);
    setActiveTabId(null);
    setHumanizeEnabled(false);
    setTargetPages(3);
    setIsGrayscale(false);
    setIsEditing(false);
  };

  const checkAuth = () => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!checkAuth()) return;
    if (!prompt.trim()) return;

    if (user) {
      const plan = plans[user.plan];
      if (plan.maxDaily && user.generationsUsedToday >= plan.maxDaily) {
        setShowPlans(true);
        return;
      }
      if (plan.maxMonthly && user.generationsUsedMonth >= plan.maxMonthly) {
        setShowPlans(true);
        return;
      }
    }

    setIsGenerating(true);
    try {
      const result = await generateDocumentContent(
        prompt, 
        humanizeEnabled, 
        user?.plan || PlanType.FREE, 
        targetPages,
        language,
        isGrayscale
      );
      
      const newDoc: GeneratedDocument = {
        id: crypto.randomUUID(),
        title: result.title,
        contentHtml: result.html,
        styles: result.styles,
        createdAt: new Date().toISOString(),
        prompt: prompt,
        isHumanized: humanizeEnabled
      };

      if (user && plans[user.plan].canAccessHistory) {
        setDocuments(prev => [newDoc, ...prev]);
      }
      
      openDocumentInTab(newDoc);
      
      if (user) {
        setUser({
            ...user,
            generationsUsedToday: user.generationsUsedToday + 1,
            generationsUsedMonth: user.generationsUsedMonth + 1
        });
      }

    } catch (error) {
      console.error(error);
      alert(t('alert.error_gen'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!checkAuth() || !activeDoc) return;
    setIsEditing(false);

    // Use html2pdf if available
    if (typeof (window as any).html2pdf !== 'undefined') {
      const tempContainer = document.createElement('div');
      
      // We must make the container visible enough for the renderer but off-screen for the user
      Object.assign(tempContainer.style, {
        position: 'absolute',
        top: '0',
        left: '-10000px',
        width: '210mm', // standard A4 width
        backgroundColor: 'white',
        zIndex: '-1000',
        visibility: 'visible',
        display: 'block'
      });
      
      // Professional cleaning styles for PDF output
      const pdfStyles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          ${activeDoc.styles}
          
          .pdf-wrapper {
            background-color: white !important;
            color: black !important;
            width: 100% !important;
            padding: 20mm !important;
            box-sizing: border-box !important;
            font-family: 'Inter', sans-serif !important;
            min-height: 297mm;
          }
          
          .ai-generated-content {
            display: block !important;
            width: 100% !important;
            background: transparent !important;
            color: black !important;
            column-count: 1 !important;
            column-width: auto !important;
            transform: none !important;
            overflow: visible !important;
          }
          
          /* Force all text to be black for visibility on white paper */
          .ai-generated-content h1, 
          .ai-generated-content h2, 
          .ai-generated-content h3, 
          .ai-generated-content p, 
          .ai-generated-content li, 
          .ai-generated-content span,
          .ai-generated-content div { 
            color: black !important; 
          }
          
          .ai-generated-content * {
            max-width: 100% !important;
            break-inside: auto !important;
          }
        </style>
      `;

      tempContainer.innerHTML = `
        ${pdfStyles}
        <div class="pdf-wrapper">
          ${activeDoc.contentHtml}
        </div>
      `;
      
      document.body.appendChild(tempContainer);

      const opt = {
        margin: 0, 
        filename: `${activeDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false,
          scrollY: 0,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      try {
        // Give time for any external assets or fonts to render
        await new Promise(resolve => setTimeout(resolve, 1000));
        await (window as any).html2pdf().set(opt).from(tempContainer).save();
      } catch (err) {
        console.error("PDF Export Error:", err);
        window.print(); // ultimate fallback
      } finally {
        if (tempContainer.parentNode) {
          document.body.removeChild(tempContainer);
        }
      }
    } else {
      window.print();
    }
  };

  const handleEditToggle = () => {
    if (!checkAuth()) return;
    if (user?.plan === PlanType.FREE) {
        setShowPlans(true);
        return;
    }
    setIsEditing(!isEditing);
  };

  const handleContentUpdate = (newHtml: string) => {
    if (!activeTabId) return;
    setActiveTabs(prev => prev.map(doc => 
        doc.id === activeTabId ? { ...doc, contentHtml: newHtml } : doc
    ));
    setDocuments(prev => prev.map(doc => 
        doc.id === activeTabId ? { ...doc, contentHtml: newHtml } : doc
    ));
  };

  const handleHistoryClick = (doc: GeneratedDocument) => {
    openDocumentInTab(doc);
    if (window.innerWidth < 768) {
        setShowHistory(false);
    }
  };

  const handlePlanSelect = (plan: any) => {
    if (user) {
      setUser({ ...user, plan: plan.id });
    }
  };

  const toggleHumanize = () => {
    if (!checkAuth()) return;
    if (user && !plans[user.plan].canHumanize) {
      setShowPlans(true);
      return;
    }
    setHumanizeEnabled(!humanizeEnabled);
  };

  const getPageOptionStatus = (pages: number) => {
     const max = currentPlan.maxPages;
     if (pages <= max) return { locked: false, label: null };
     if (pages <= 10) return { locked: true, label: 'Premium' };
     return { locked: true, label: 'Pro' };
  };

  const used = user ? user.generationsUsedMonth : 0;
  const maxGen = currentPlan.maxMonthly;
  const usageText = maxGen ? `${used}/${maxGen}` : `${used}`;

  return (
    <div className="h-[100dvh] w-screen bg-[#0D0D0D] text-gray-300 font-sans overflow-hidden flex flex-col">
      <header className="h-16 flex-none border-b border-[#2A2A2A] flex items-center justify-between px-4 md:px-8 bg-[#0D0D0D]/90 backdrop-blur z-40 no-print">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-white" />
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#B45309]">
            {t('app.title')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <span className={`text-xs font-medium px-2 py-1 rounded border ${getPlanBadgeStyles(currentPlan.id)}`}>
                  {currentPlan.name.toUpperCase()}
                </span>
                
                <button 
                  onClick={() => {
                    if (currentPlan.canAccessHistory) {
                      setShowHistory(!showHistory);
                    } else {
                      setShowPlans(true);
                    }
                  }}
                  className={`p-2 rounded-lg transition-all relative ${
                    showHistory 
                      ? 'bg-[#2A2A2A] text-white' 
                      : !currentPlan.canAccessHistory 
                        ? 'text-yellow-500 hover:scale-110' 
                        : 'hover:bg-[#1A1A1A] text-gray-400'
                  }`}
                  title={t('header.history')}
                >
                  <History className="w-5 h-5" />
                  {!currentPlan.canAccessHistory && (
                    <Lock className="absolute -top-1 -right-1 w-3 h-3 text-yellow-600" />
                  )}
                </button>

                <button 
                   onClick={() => setShowPlans(true)}
                   className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('header.plans')}
                </button>

                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                    {user.name}
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2A2A2A] first:rounded-t-lg last:rounded-b-lg flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> {t('header.logout')}
                    </button>
                  </div>
                </div>
              </div>
              <button className="md:hidden p-2 text-white" onClick={() => setShowMobileMenu(true)}>
                <Menu className="w-6 h-6" />
              </button>
            </>
          ) : (
             <Button variant="secondary" onClick={() => setShowAuthModal(true)} className="px-6 py-2 h-auto text-sm">
               {t('header.login')}
             </Button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className={`
          w-full md:w-1/2 flex flex-col p-4 md:p-8 border-r border-[#2A2A2A] transition-all duration-500 ease-in-out z-10 bg-[#0D0D0D] no-print
          ${showHistory ? 'md:w-1/3' : ''} 
        `}>
          <div className="flex-1 min-h-0 relative bg-[#111111] rounded-2xl border border-[#2A2A2A] hover:border-[#3A3A3A] focus-within:border-white focus-within:ring-1 focus-within:ring-white transition-all overflow-hidden flex flex-col mb-4">
            <textarea
              ref={textAreaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('input.placeholder')}
              className="w-full h-full bg-transparent text-white p-6 resize-none focus:outline-none placeholder-gray-600 text-lg leading-relaxed"
            />
            <div className="flex-none p-3 md:p-4 border-t border-[#2A2A2A] flex items-center justify-between md:justify-start bg-[#151515] flex-nowrap gap-2 md:gap-4 overflow-visible">
                {(user && currentPlan.canHumanize) ? (
                  <button 
                    onClick={toggleHumanize}
                    className={`shrink-0 flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium border transition-all whitespace-nowrap ${humanizeEnabled ? 'bg-gradient-to-r from-amber-200 to-yellow-500 text-black border-none animate-premium' : 'bg-transparent border-[#3A3A3A] text-gray-500 hover:text-gray-300'}`}
                  >
                    <Sparkles className={`w-3 h-3 ${humanizeEnabled ? 'text-black' : ''}`} />
                    <span>{t('input.humanize')}</span>
                  </button>
                ) : (
                  <button 
                    onClick={toggleHumanize}
                    className="shrink-0 flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold bg-gradient-to-r from-amber-200 to-yellow-500 text-black hover:brightness-110 transition-all shadow-[0_0_10px_rgba(251,191,36,0.3)] whitespace-nowrap animate-premium"
                  >
                    <Crown className="w-3 h-3" strokeWidth={3} /> 
                    <span>
                      {t('input.humanize')} <span className="hidden sm:inline">(Premium)</span>
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setIsGrayscale(!isGrayscale)}
                  className={`
                    shrink-0 flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium border transition-all whitespace-nowrap
                    ${!isGrayscale 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 animate-green-glow font-semibold' 
                      : 'bg-[#2A2A2A] border-[#3A3A3A] text-gray-400 hover:text-gray-200'}
                  `}
                  title={isGrayscale ? "Activar Color" : "Activar B/N"}
                >
                  {isGrayscale ? <DropletOff className="w-3 h-3" /> : <Palette className="w-3 h-3" />}
                  <span className="md:inline">{!isGrayscale ? t('input.mode_color') : t('input.mode_bw')}</span>
                </button>

                <div className="relative shrink-0" ref={pageSelectorRef}>
                    <button
                        onClick={() => setShowPageSelector(!showPageSelector)}
                        className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-[#3A3A3A] bg-transparent text-gray-300 hover:text-white hover:border-gray-500 transition-all whitespace-nowrap"
                    >
                        <span className="hidden md:inline">{targetPages} {getPageLabel(targetPages)}</span>
                        <span className="md:hidden">{targetPages} pgs</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>

                    {showPageSelector && (
                        <div className="absolute bottom-[115%] left-0 w-36 md:w-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl overflow-hidden z-50">
                            <div className="py-1">
                                <div className="px-3 py-2 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[#2A2A2A] mb-1">
                                    {t('input.page_title')}
                                </div>
                                {PAGE_OPTIONS.map(pages => {
                                    const status = getPageOptionStatus(pages);
                                    return (
                                        <button
                                            key={pages}
                                            onClick={() => {
                                                if (status.locked) {
                                                  setShowPlans(true);
                                                  setShowPageSelector(false);
                                                  return;
                                                }
                                                setTargetPages(pages);
                                                setShowPageSelector(false);
                                            }}
                                            className={`
                                                w-full text-left px-3 py-2 text-xs md:text-sm flex items-center justify-between group transition-colors
                                                ${targetPages === pages ? 'bg-[#2A2A2A] text-white' : ''}
                                                ${status.locked 
                                                  ? 'opacity-80 text-gray-500 hover:bg-[#222] hover:text-gray-300 cursor-pointer' 
                                                  : 'hover:bg-[#2A2A2A] text-gray-300 hover:text-white'
                                                }
                                            `}
                                        >
                                            <span className="hidden md:inline">{pages} {getPageLabel(pages)}</span>
                                            <span className="md:hidden">{pages} pgs</span>
                                            {status.locked ? (
                                                <div className="flex items-center gap-1.5">
                                                  <Lock className="w-3 h-3 opacity-70" />
                                                  <span className={`text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded border ${status.label === 'Premium' ? 'border-yellow-500/30 text-yellow-500' : 'border-purple-500/30 text-purple-500'}`}>
                                                      {status.label}
                                                  </span>
                                                </div>
                                            ) : (
                                              targetPages === pages && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
              <span className="ml-auto md:ml-auto text-[10px] md:text-xs text-gray-500 font-medium bg-[#0D0D0D] px-2 py-1 rounded border border-[#2A2A2A] whitespace-nowrap">
                 {usageText} <span className="hidden md:inline">{t('input.generated_count')}</span>
              </span>
            </div>
          </div>

          <Button 
            variant="primary"
            onClick={handleGenerate} 
            disabled={!prompt.trim() || isGenerating}
            loading={isGenerating}
            fullWidth
            className="flex-none text-lg py-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {isGenerating ? t('input.processing') : t('input.generate_btn')}
          </Button>
        </div>

        {/* Right Preview Panel - Set to Vertical for continuous scroll */}
        <div className="hidden md:flex w-1/2 bg-[#0A0A0A] flex-col relative overflow-hidden h-full">
           {activeTabs.length > 0 && (
             <div className="flex-none flex items-center bg-[#0D0D0D] border-b border-[#2A2A2A] no-print h-12 shadow-md z-10">
               <div className="flex-1 flex items-center overflow-x-auto h-full scrollbar-hide">
                 {activeTabs.map(doc => (
                   <div 
                     key={doc.id}
                     onClick={() => setActiveTabId(doc.id)}
                     className={`
                       group relative flex items-center gap-3 px-6 h-full border-r border-[#2A2A2A] cursor-pointer min-w-[160px] max-w-[280px] transition-all
                       ${activeTabId === doc.id ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:bg-[#111111] hover:text-gray-300'}
                     `}
                   >
                      {activeTabId === doc.id && (
                        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>
                      )}
                      <span className="truncate text-[13px] font-semibold uppercase tracking-wider">{doc.title}</span>
                   </div>
                 ))}
               </div>

               <div className="flex-none px-4 h-full flex items-center bg-[#0D0D0D] border-l border-[#2A2A2A] gap-2">
                  <button 
                    onClick={handleEditToggle}
                    className={`
                      p-2 rounded-xl transition-all flex items-center gap-2 border
                      ${isEditing ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-transparent border-transparent hover:border-[#333] text-gray-400 hover:text-white'}
                      ${user?.plan === PlanType.FREE && !isEditing ? 'text-yellow-400' : ''}
                    `}
                    title={isEditing ? t('doc.save_edit') : t('doc.edit')}
                  >
                    {isEditing ? <Check className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="p-2 text-gray-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-[#333] bg-transparent"
                    title={t('doc.download_pdf')}
                  >
                    <Download className="w-5 h-5" />
                  </button>
               </div>
             </div>
           )}

           <div className="flex-1 relative bg-[#0D0D0D] overflow-auto scrollbar-thin">
              {activeDoc ? (
                 <div className="w-full flex justify-center items-start min-h-full">
                    <DocumentPaper 
                      contentHtml={activeDoc.contentHtml} 
                      styles={activeDoc.styles}
                      planName={currentPlan.name}
                      maxPages={currentPlan.maxPages}
                      hasWatermark={currentPlan.hasWatermark}
                      isEditable={isEditing}
                      viewMode="vertical"
                      onContentUpdate={handleContentUpdate}
                    />
                 </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 select-none">
                  <div className="w-24 h-24 bg-[#1A1A1A] rounded-[2rem] mx-auto flex items-center justify-center border border-[#2A2A2A] shadow-inner">
                    <FileText className="w-12 h-12 text-gray-600" />
                  </div>
                  <div className="max-w-xs space-y-2">
                    <p className="text-xl font-bold text-gray-400 uppercase tracking-[0.2em]">{t('doc.empty_state')}</p>
                    <p className="text-sm text-gray-600 font-medium">Instantly transform instructions into formal documents.</p>
                  </div>
                </div>
              )}
           </div>
        </div>

        {showHistory && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setShowHistory(false)}
          />
        )}

        {user && (
          <div className={`
             fixed md:relative inset-y-0 right-0 w-80 max-w-[85vw] bg-[#111111] border-l border-[#2A2A2A] z-50 transform transition-transform duration-300 ease-in-out no-print flex flex-col h-full
             ${showHistory ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:hidden'}
          `}>
            <div className="p-6 h-full flex flex-col">
              <div className="flex-none flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">{t('header.history')}</h3>
                <button onClick={() => setShowHistory(false)} className="md:hidden p-2 text-gray-400"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                {documents.length === 0 && (
                   <div className="text-center mt-12 space-y-4 opacity-50">
                     <History className="w-10 h-10 mx-auto text-gray-600" />
                     <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">{t('doc.history_empty')}</p>
                   </div>
                )}
                {documents.map(doc => (
                  <div 
                    key={doc.id} 
                    className={`p-4 rounded-xl border border-[#2A2A2A] group cursor-pointer transition-all active:scale-[0.98]
                      ${activeTabId === doc.id ? 'bg-[#2A2A2A] border-amber-500/30 ring-1 ring-amber-500/20' : 'bg-[#1A1A1A] hover:bg-[#222] hover:border-[#333]'}
                    `}
                    onClick={() => handleHistoryClick(doc)}
                  >
                    <h4 className="text-white text-sm font-bold mb-1 truncate">{doc.title}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{t('doc.open')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleLogin} 
      />

      {showMobilePreview && activeDoc && (
        <DocumentPreview 
          document={activeDoc}
          onClose={() => setShowMobilePreview(false)}
          onDownload={handleDownload}
        />
      )}

      {showPlans && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="max-w-6xl w-full my-12 relative">
              <div className="flex justify-between items-center mb-10 sticky top-0 py-4 z-10 bg-black/0 backdrop-blur-sm">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{t('plan.modal.title')}</h2>
                  <div className="h-1 w-20 bg-amber-500 rounded-full"></div>
                </div>
                <button onClick={() => setShowPlans(false)} className="p-3 bg-[#1A1A1A] text-white rounded-full border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-all"><X className="w-6 h-6"/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                {Object.values(plans).map(plan => (
                  <PlanCard 
                    key={plan.id}
                    plan={plan}
                    isActive={user?.plan === plan.id}
                    onSelect={handlePlanSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D] flex flex-col p-6 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-12">
             <div className="flex items-center gap-2">
                <Logo className="w-6 h-6 text-white"/>
                <h2 className="text-lg font-black text-white uppercase tracking-widest italic">{t('header.menu')}</h2>
             </div>
            <button onClick={() => setShowMobileMenu(false)} className="p-2 text-white"><X className="w-8 h-8"/></button>
          </div>
          <div className="space-y-6">
            <button onClick={() => { setShowPlans(true); setShowMobileMenu(false); }} className="w-full text-left text-2xl font-black italic uppercase text-white py-4 border-b border-[#2A2A2A]">
              {t('header.plans')}
            </button>
            {user && (
              <>
                <button 
                  onClick={() => { 
                    if (currentPlan.canAccessHistory) {
                      setShowHistory(true); 
                      setShowMobileMenu(false);
                    } else {
                      setShowPlans(true);
                      setShowMobileMenu(false);
                    }
                  }} 
                  className={`w-full text-left text-2xl font-black italic uppercase py-4 border-b border-[#2A2A2A] flex items-center justify-between ${!currentPlan.canAccessHistory ? 'text-amber-500' : 'text-white'}`}
                >
                  {t('header.history')}
                  {!currentPlan.canAccessHistory && <Crown className="w-6 h-6" />}
                </button>
                <div className="pt-10">
                  <button onClick={handleLogout} className="w-full text-left text-xl font-bold text-red-500 py-3 flex items-center gap-3">
                    <LogOut className="w-6 h-6" /> {t('header.logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!showMobilePreview && activeDoc && (
        <div className="md:hidden fixed bottom-6 left-6 right-6 bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 p-4 z-30 shadow-2xl rounded-3xl animate-in slide-in-from-bottom-8 duration-500">
           <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0" onClick={() => setShowMobilePreview(true)}>
                <h4 className="text-white font-bold text-sm truncate uppercase tracking-wider">{activeDoc.title}</h4>
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">{t('doc.ready_mobile')}</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setShowMobilePreview(true)} className="bg-[#2A2A2A] text-white p-3 rounded-2xl border border-white/5"><Eye className="w-5 h-5"/></button>
                 <button onClick={handleDownload} className="bg-white text-black p-3 rounded-2xl shadow-lg active:scale-95 transition-transform"><Download className="w-5 h-5"/></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;
