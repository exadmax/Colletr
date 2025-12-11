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
      {/* Backdrop with pixels */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gb-ink/80 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Retro Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 bg-gb-paper border-r-4 border-gb-ink z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full font-pixel text-gb-ink">
          <div className="p-6 border-b-4 border-gb-ink bg-gb-ink text-white">
            <h2 className="text-sm font-retro uppercase">CARREGAR JOGO</h2>
            <p className="text-white/70 text-sm mt-1 uppercase">Escolha o arquivo</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {collections.map(col => (
              <button
                key={col.id}
                onClick={() => {
                  onSelect(col.id);
                  onClose();
                }}
                className={`w-full text-left p-3 border-2 transition-all flex items-center justify-between group shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none
                  ${activeId === col.id 
                    ? 'bg-gb-ink border-gb-ink text-white' 
                    : 'bg-white border-gb-ink text-gb-ink hover:bg-gb-paper'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 border-2 border-gb-ink ${activeId === col.id ? 'bg-gb-paper text-gb-ink' : 'bg-gb-paper text-gb-ink'}`}>
                    {getIconForType(col.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none uppercase">{col.name}</h3>
                    <p className="text-sm opacity-80 uppercase">{col.items.length} itens • {col.type}</p>
                  </div>
                </div>
                {activeId === col.id && <Check size={16} />}
              </button>
            ))}

            {collections.length === 0 && (
              <div className="text-center py-8 text-gb-ink/50 text-lg uppercase">
                Sem arquivos salvos.
              </div>
            )}
          </div>

          <div className="p-4 border-t-4 border-gb-ink bg-gb-paper">
            <button
              onClick={() => {
                onAddNew();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gb-blue hover:bg-gb-blue/90 text-white p-4 border-2 border-transparent transition-colors font-retro text-xs shadow-[4px_4px_0px_0px_#202020] active:translate-y-[2px] active:shadow-none"
            >
              <Plus size={16} />
              NOVO SLOT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionSwitcher;
