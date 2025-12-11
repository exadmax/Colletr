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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700 animate-fade-in-up">
        
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderPlus className="text-cyan-400" size={24} />
            Nova Coleção
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Nome da Coleção</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="Ex: Meus GameBoys"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Tipo de Item</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as CollectionType)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none"
            >
              {Object.values(CollectionType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Descrição (Opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none h-24 resize-none"
              placeholder="Ex: Coleção focada em portáteis da Nintendo..."
            />
          </div>

          <button 
            type="submit"
            disabled={!name}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3 rounded-xl transition-colors mt-2"
          >
            Criar Coleção
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCollectionModal;
