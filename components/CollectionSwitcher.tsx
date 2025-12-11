import React from 'react';
import { Collection, CollectionType } from '../types';
import { Gamepad2, Disc, Package, Archive, Plus, ChevronRight, Check } from 'lucide-react';

interface CollectionSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

const getIconForType = (type: CollectionType) => {
  switch (type) {
    case CollectionType.CONSOLES: return <Gamepad2 size={18} />;
    case CollectionType.GAMES: return <Disc size={18} />;
    case CollectionType.ACCESSORIES: return <Package size={18} />;
    default: return <Archive size={18} />;
  }
};

const CollectionSwitcher: React.FC<CollectionSwitcherProps> = ({ 
  isOpen, onClose, collections, activeId, onSelect, onAddNew 
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">Minhas Coleções</h2>
            <p className="text-slate-500 text-sm mt-1">Gerencie seu inventário</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {collections.map(col => (
              <button
                key={col.id}
                onClick={() => {
                  onSelect(col.id);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group
                  ${activeId === col.id 
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' 
                    : 'bg-slate-800/50 border-transparent hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeId === col.id ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'}`}>
                    {getIconForType(col.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{col.name}</h3>
                    <p className="text-xs opacity-70">{col.items.length} itens • {col.type}</p>
                  </div>
                </div>
                {activeId === col.id && <Check size={16} />}
              </button>
            ))}

            {collections.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Nenhuma coleção encontrada.
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <button
              onClick={() => {
                onAddNew();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl border border-slate-700 transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              Criar Nova Coleção
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionSwitcher;
