import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { Collection, CollectionType } from '../types';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (collection: Collection) => void;
}

const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CollectionType>(CollectionType.CONSOLES);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      description,
      type,
      items: [],
      createdAt: new Date().toISOString()
    };
    onCreate(newCollection);
    setName('');
    setDescription('');
    setType(CollectionType.CONSOLES);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gb-ink/90 backdrop-blur-sm p-4">
      <div className="bg-gb-paper w-full max-w-md shadow-[8px_8px_0px_0px_#202020] border-4 border-gb-ink animate-fade-in-up">
        
        <div className="p-4 border-b-4 border-gb-ink flex justify-between items-center bg-gb-ink text-white">
          <h2 className="text-sm font-retro flex items-center gap-2 uppercase">
            <FolderPlus className="text-white" size={20} />
            NOVO SAVE
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-pixel text-lg text-gb-ink">
          <div>
            <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">Nome</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border-2 border-gb-ink p-2 text-gb-ink focus:border-gb-blue focus:outline-none uppercase"
              placeholder="MINHA COLEÇÃO..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">Categoria</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as CollectionType)}
              className="w-full bg-white border-2 border-gb-ink p-2 text-gb-ink focus:border-gb-blue focus:outline-none uppercase"
            >
              {Object.values(CollectionType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">Detalhes (Opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border-2 border-gb-ink p-2 text-gb-ink focus:border-gb-blue focus:outline-none h-24 resize-none uppercase"
              placeholder="DESCRIÇÃO..."
            />
          </div>

          <button 
            type="submit"
            disabled={!name}
            className="w-full bg-gb-blue hover:bg-gb-blue/90 text-white font-retro text-xs py-4 mt-2 border-2 border-transparent shadow-[4px_4px_0px_0px_#202020] active:translate-y-[2px] active:shadow-none transition-all"
          >
            CRIAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCollectionModal;
