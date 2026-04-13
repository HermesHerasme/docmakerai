
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DocumentPaperProps {
  contentHtml: string;
  styles?: string;
  className?: string;
  planName?: string;
  maxPages?: number;
  hasWatermark?: boolean;
  isEditable?: boolean;
  viewMode?: 'paginated' | 'vertical';
  onContentUpdate?: (newHtml: string) => void;
}

const A4_WIDTH_PX = 794; 
const A4_HEIGHT_PX = 1123;
const MARGIN_FIXED = 60; 
const CONTENT_WIDTH = A4_WIDTH_PX - (MARGIN_FIXED * 2);
const CONTENT_HEIGHT = A4_HEIGHT_PX - (MARGIN_FIXED * 2);

export const DocumentPaper: React.FC<DocumentPaperProps> = ({ 
  contentHtml, 
  styles = '',
  isEditable = false,
  hasWatermark = false,
  viewMode = 'paginated',
  onContentUpdate
}) => {
  const { t } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [localContent, setLocalContent] = useState(contentHtml);

  useEffect(() => {
    setLocalContent(contentHtml);
    if (!isEditable) {
        setCurrentPage(1);
    }
  }, [contentHtml, isEditable]);

  useLayoutEffect(() => {
    if (contentRef.current && viewMode === 'paginated') {
      const timer = setTimeout(() => {
        const fullWidth = contentRef.current?.scrollWidth || 0;
        const calculatedPages = Math.max(1, Math.ceil((fullWidth - 10) / CONTENT_WIDTH));
        setTotalPages(calculatedPages);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [localContent, viewMode, styles]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage > 1) setCurrentPage(curr => curr - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage < totalPages) setCurrentPage(curr => curr + 1);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (isEditable && onContentUpdate) {
      const newHtml = e.currentTarget.innerHTML;
      setLocalContent(newHtml);
      onContentUpdate(newHtml);
    }
  };

  const isVertical = viewMode === 'vertical';

  return (
    <div className={`flex flex-col items-center gap-8 py-10 print:py-0 print:block no-print:bg-transparent ${isVertical ? 'w-auto' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      {/* Contenedor Único del Papel - Evita el efecto de doble fondo */}
      <div 
        className={`
          relative bg-white text-black shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300 print:shadow-none print:w-full print:overflow-visible
          ${isVertical ? 'h-auto' : 'overflow-hidden'}
        `}
        style={{
          width: `${A4_WIDTH_PX}px`,
          minHeight: isVertical ? '0' : `${A4_HEIGHT_PX}px`,
          height: isVertical ? 'auto' : `${A4_HEIGHT_PX}px`,
          boxSizing: 'border-box'
        }}
      >
        {/* Área de Contenido con Márgenes fijos */}
        <div
          className={`${isVertical ? 'relative' : 'absolute'} print:static print:w-full print:h-auto print:m-0 overflow-visible`}
          style={{
            padding: `${MARGIN_FIXED}px`,
            width: '100%',
            height: isVertical ? 'auto' : '100%',
            boxSizing: 'border-box'
          }}
        >
          <div 
            ref={contentRef}
            className={`
              ${isVertical ? 'block' : 'h-full transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)'}
              print:h-auto print:block print:w-auto
            `}
            style={{
              height: isVertical ? 'auto' : `${CONTENT_HEIGHT}px`,
              width: isVertical ? '100%' : `${CONTENT_WIDTH}px`,
              columnWidth: isVertical ? 'auto' : `${CONTENT_WIDTH}px`,
              columnGap: '0px',
              columnFill: 'auto',
              transform: isVertical ? 'none' : `translateX(-${(currentPage - 1) * CONTENT_WIDTH}px)`,
              boxSizing: 'border-box'
            }}
          >
            <div 
              id="printable-document" 
              contentEditable={isEditable}
              onBlur={handleBlur}
              dangerouslySetInnerHTML={{ __html: localContent }} 
              suppressContentEditableWarning={true}
              className={`
                ai-generated-content-wrapper
                ${isEditable ? 'outline-dashed outline-2 outline-indigo-500/50 cursor-text min-h-full rounded-sm' : ''}
              `}
              style={{
                 width: '100%',
                 outlineOffset: '8px',
                 textAlign: 'left',
                 boxSizing: 'border-box',
                 overflowWrap: 'break-word'
              }}
            />

            {hasWatermark && (
                <div className="hidden print:block fixed bottom-4 left-0 right-0 pointer-events-none z-10 text-center opacity-30">
                  <span style={{ fontSize: '9pt', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                    Generated by DocMaker AI
                  </span>
                </div>
            )}
          </div>
        </div>

        {/* Marca de agua discreta para el papel */}
        {hasWatermark && (
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center pointer-events-none select-none z-10 print:hidden opacity-30">
            <div className="text-[10px] font-bold text-gray-400 border-t border-gray-200 pt-1 tracking-[0.2em] uppercase">
              DocMaker AI • Official Doc
            </div>
          </div>
        )}

        {/* Contador de páginas discreto solo en modo paginado */}
        {!isVertical && totalPages > 1 && (
          <div className="absolute bottom-4 right-6 text-[10px] text-gray-300 print:hidden pointer-events-none font-bold tracking-widest bg-black/5 px-2 py-1 rounded-md uppercase">
            {currentPage} / {totalPages}
          </div>
        )}
      </div>

      {/* Navegación - Eliminada en modo Vertical para mayor limpieza */}
      {!isVertical && totalPages > 1 && (
        <div className="flex items-center gap-6 bg-[#1A1A1A] p-2 rounded-2xl border border-[#2A2A2A] print:hidden sticky bottom-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 animate-in fade-in duration-300">
          <button 
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="p-2 rounded-xl hover:bg-[#2A2A2A] disabled:opacity-20 text-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {currentPage} {t('paper.of')} {totalPages}
          </span>
          <button 
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl hover:bg-[#2A2A2A] disabled:opacity-20 text-white transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
