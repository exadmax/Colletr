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

  // Calculate potential trigger prices for visual feedback
  const upperTrigger = currentPrice * (1 + threshold / 100);
  const lowerTrigger = currentPrice * (1 - threshold / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-slate-700 animate-fade-in-up">
        
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BellRing className="text-cyan-400" size={20} />
            Alerta de Preço
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
               <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div>
               <h3 className="font-bold text-white leading-tight">{item.name}</h3>
               <p className="text-green-400 font-mono mt-1">
                 R$ {currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </p>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-slate-300">Ativar Notificação</label>
              <button 
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {enabled && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">
                    Notificar se o valor variar mais de <span className="text-white font-bold">{threshold}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-700/50">
                   <div className="flex items-center gap-2">
                     <TrendingUp size={14} className="text-green-500" />
                     <span>Acima de: <span className="text-slate-200">R$ {upperTrigger.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></span>
                   </div>
                   <div className="flex items-center gap-2">
                     <TrendingDown size={14} className="text-red-500" />
                     <span>Abaixo de: <span className="text-slate-200">R$ {lowerTrigger.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></span>
                   </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded-xl transition-colors"
          >
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceAlertModal;
