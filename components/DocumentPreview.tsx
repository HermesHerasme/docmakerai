
import React from 'react';
import { X, Printer, ArrowLeft } from 'lucide-react';
import { GeneratedDocument } from '../types';
import { Button } from './Button';
import { DocumentPaper } from './DocumentPaper';
import { useLanguage } from '../contexts/LanguageContext';

interface DocumentPreviewProps {
  document: GeneratedDocument;
  onClose: () => void;
  onDownload: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose, onDownload }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0D0D] flex flex-col h-screen w-screen animate-in fade-in duration-200">
      <div className="h-16 border-b border-[#2A2A2A] flex-none flex items-center justify-between px-4 md:px-6 bg-[#0D0D0D]/80 backdrop-blur no-print">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-full text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-medium truncate max-w-[150px] md:max-w-md text-sm md:text-base">{document.title}</h2>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="primary" onClick={onDownload} className="gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{t('doc.download_pdf')}</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-full text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#111111] p-4 md:p-12 flex justify-start md:justify-center items-start scroll-smooth">
        <div className="inline-block min-w-max pb-20">
          <DocumentPaper 
            contentHtml={document.contentHtml} 
            styles={document.styles}
            viewMode="vertical"
          />
        </div>
      </div>
    </div>
  );
};
