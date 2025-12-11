import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Condition, ConsoleItem, ConsoleType } from '../types';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ConsoleItem) => void;
  item: ConsoleItem | null;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [type, setType] = useState<ConsoleType>(ConsoleType.HOME);
  const [condition, setCondition] = useState<Condition>(Condition.LOOSE);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setManufacturer(item.manufacturer);
      setType(item.type);
      setCondition(item.condition);
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;
    
    const updatedItem: ConsoleItem = {
      ...item,
      name,
      manufacturer,
      type,
      condition
    };

    onSave(updatedItem);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gb-ink/80 backdrop-blur-sm p-4">
      <div className="bg-gb-paper w-full max-w-lg overflow-hidden shadow-[8px_8px_0px_0px_#202020] border-4 border-gb-ink flex flex-col max-h-[90vh]">
        
        {/* Retro Header */}
        <div className="p-4 border-b-4 border-gb-ink flex justify-between items-center bg-gb-ink text-white">
          <h2 className="text-sm font-retro flex items-center gap-2 uppercase">
            EDITAR ITEM
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 font-pixel text-lg text-gb-ink">
          <div className="space-y-4">
            {item.imageUrl && (
              <div className="w-full h-48 bg-gb-ink border-2 border-gb-ink mb-4 relative">
                <img src={item.imageUrl} alt="Preview" className="w-full h-full object-cover gb-filter" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">Nome do Item</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-2 border-gb-ink p-2 text-gb-ink focus:border-gb-blue focus:outline-none font-pixel text-xl uppercase"
                placeholder="SUPER MARIO..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">Fabricante</label>
                <input 
                  type="text" 
                  value={manufacturer} 
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full bg-white border-2 border-gb-ink p-2 text-gb-ink focus:border-gb-blue focus:outline-none font-pixel text-xl uppercase"
                  placeholder="NINTENDO..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">Tipo</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as ConsoleType)}
                  className="w-full bg-white border-2 border-gb-ink p-2 text-gb-ink focus:border-gb-blue focus:outline-none font-pixel text-xl uppercase appearance-none"
                >
                  {Object.values(ConsoleType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">Condição</label>
              <select 
                value={condition} 
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full bg-white border-2 border-gb-ink p-2 text-gb-ink focus:border-gb-blue focus:outline-none font-pixel text-xl uppercase appearance-none"
              >
                {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSave}
                disabled={!name}
                className="w-full bg-gb-blue hover:bg-gb-blue/90 disabled:bg-gb-ink/20 disabled:text-gb-ink/50 text-white font-retro text-xs py-4 border-2 border-transparent shadow-[4px_4px_0px_0px_#202020] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                SALVAR ALTERAÇÕES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
