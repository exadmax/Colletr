import React, { useState, useEffect } from 'react';
import { X, Bell, BellRing, TrendingUp, TrendingDown } from 'lucide-react';
import { ConsoleItem, PriceAlert } from '../types';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ConsoleItem | null;
  onSave: (itemId: string, alert: PriceAlert) => void;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ isOpen, onClose, item, onSave }) => {
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    if (item && item.priceAlert) {
      setEnabled(item.priceAlert.enabled);
      setThreshold(item.priceAlert.thresholdPercentage);
    } else {
      setEnabled(false);
      setThreshold(10);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const currentPrice = item.valuation?.averagePrice || 0;

  const handleSave = () => {
    onSave(item.id, {
      enabled,
      thresholdPercentage: threshold,
      lastCheckedPrice: currentPrice
    });
    onClose();
  };

  const upperTrigger = currentPrice * (1 + threshold / 100);
  const lowerTrigger = currentPrice * (1 - threshold / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gb-ink/90 backdrop-blur-sm p-4">
      <div className="bg-gb-paper w-full max-w-sm shadow-[8px_8px_0px_0px_#202020] border-4 border-gb-ink animate-fade-in-up">
        
        <div className="p-4 border-b-4 border-gb-ink flex justify-between items-center bg-gb-ink text-white">
          <h2 className="text-sm font-retro flex items-center gap-2 uppercase">
            <BellRing className="text-white" size={16} />
            ALARTE DE PREÇO
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 font-pixel text-gb-ink">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border-2 border-gb-ink shrink-0 overflow-hidden">
               <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover gb-filter" />
            </div>
            <div>
               <h3 className="font-bold text-xl text-gb-ink leading-none uppercase mb-1">{item.name}</h3>
               <p className="text-gb-ink font-bold font-retro text-xs bg-white inline-block px-1 border border-gb-ink">
                 R$ {currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
               </p>
            </div>
          </div>

          <div className="bg-white p-4 border-2 border-gb-ink shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <label className="text-lg font-bold text-gb-ink uppercase">LIGAR ALARME</label>
              <button 
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 border-2 border-gb-ink transition-colors relative ${enabled ? 'bg-gb-ink' : 'bg-gb-paper'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 border border-gb-ink transition-transform ${enabled ? 'translate-x-6 bg-white' : 'translate-x-0 bg-gb-ink'}`} />
              </button>
            </div>

            {enabled && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm text-gb-ink mb-2 uppercase">
                    Variação maior que <span className="text-gb-ink font-bold">{threshold}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-4 bg-gb-ink appearance-none cursor-pointer border border-gb-ink"
                  />
                  <div className="flex justify-between text-xs text-gb-ink mt-1">
                    <span>1%</span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="text-sm text-gb-ink space-y-1 pt-2 border-t border-gb-ink border-dashed">
                   <div className="flex items-center gap-2">
                     <TrendingUp size={14} className="text-gb-green-dark" />
                     <span>SOBE: <span className="text-gb-ink font-bold">R$ {upperTrigger.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></span>
                   </div>
                   <div className="flex items-center gap-2">
                     <TrendingDown size={14} className="text-gb-red" />
                     <span>DESCE: <span className="text-gb-ink font-bold">R$ {lowerTrigger.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></span>
                   </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-gb-ink hover:bg-gb-ink/90 text-white font-retro text-xs py-4 border-2 border-transparent shadow-[4px_4px_0px_0px_#202020] active:translate-y-[2px] active:shadow-none transition-all"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceAlertModal;
