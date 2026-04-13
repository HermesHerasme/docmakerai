import React from 'react';
import { Check } from 'lucide-react';
import { PlanConfig, PlanType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PlanCardProps {
  plan: PlanConfig;
  isActive: boolean;
  onSelect: (plan: PlanConfig) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, isActive, onSelect }) => {
  const { t } = useLanguage();
  
  const getTitleColor = (type: PlanType) => {
    switch(type) {
      case PlanType.FREE: return 'text-green-400';
      case PlanType.PREMIUM: return 'text-yellow-400';
      case PlanType.PRO: return 'text-purple-400';
      default: return 'text-white';
    }
  };

  return (
    <div 
      className={`
        relative p-6 rounded-xl border transition-all cursor-pointer flex flex-col h-full
        ${isActive 
          ? 'bg-[#1A1A1A] border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
          : 'bg-[#111111] border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#151515]'
        }
      `}
      onClick={() => onSelect(plan)}
    >
      {isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {t('plan.current')}
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xl font-semibold ${getTitleColor(plan.id)}`}>{plan.name}</h3>
          <p className="text-gray-400 text-sm mt-1">{plan.generationsLabel}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-white whitespace-nowrap">{plan.price}</p>
        </div>
      </div>

      {/* Features - Flex Grow to push button down */}
      <div className="space-y-3 mb-6 flex-1">
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Bottom Action */}
      {!isActive && (
        <div className="mt-auto w-full">
            <button className="w-full py-2 text-sm font-medium text-white bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors">
            {plan.id === PlanType.FREE ? t('plan.btn.select') : t('plan.btn.upgrade')}
            </button>
        </div>
      )}
    </div>
  );
};