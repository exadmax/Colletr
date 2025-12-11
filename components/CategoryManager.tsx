import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { CustomCategory } from '../types';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CustomCategory[];
  onAddCategory: (name: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onEditCategory(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gb-ink/90 backdrop-blur-sm p-4">
      <div className="bg-gb-paper w-full max-w-md shadow-[8px_8px_0px_0px_#202020] border-4 border-gb-ink animate-fade-in-up max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b-4 border-gb-ink flex justify-between items-center bg-gb-ink text-white">
          <h2 className="text-sm font-retro flex items-center gap-2 uppercase">
            GERENCIAR CATEGORIAS
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-pixel text-gb-ink flex-1 overflow-y-auto">
          
          {/* Default Categories Info */}
          <div className="bg-gb-blue/10 border-2 border-gb-blue/30 p-3 rounded">
            <p className="text-xs font-retro text-gb-ink/70 uppercase">
              Categorias Padrão: Consoles, Jogos, Acessórios, Misto
            </p>
          </div>

          {/* Add New Category Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">
              Nova Categoria
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 bg-white border-2 border-gb-ink p-2 text-gb-ink focus:border-gb-blue focus:outline-none text-xl uppercase"
                placeholder="DIGITE O NOME..."
              />
              <button 
                type="submit"
                disabled={!newCategoryName.trim()}
                className="bg-gb-blue hover:bg-gb-blue/90 disabled:bg-gb-ink/20 disabled:text-gb-ink/50 text-white px-4 border-2 border-transparent shadow-[4px_4px_0px_0px_#202020] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </form>

          {/* Custom Categories List */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gb-ink uppercase mb-1 font-retro">
              Categorias Personalizadas ({categories.length})
            </label>
            
            {categories.length === 0 ? (
              <div className="text-center py-6 text-gb-ink/50 text-lg uppercase">
                Nenhuma categoria personalizada.
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map(category => (
                  <div 
                    key={category.id}
                    className="flex items-center gap-2 bg-white border-2 border-gb-ink p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  >
                    {editingId === category.id ? (
                      <>
                        <input 
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 bg-white border-2 border-gb-blue p-1 text-gb-ink focus:outline-none text-xl uppercase"
                          autoFocus
                        />
                        <button 
                          onClick={handleSaveEdit}
                          className="text-gb-blue hover:text-gb-blue/80 p-1"
                          title="Salvar"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="text-gb-ink/50 hover:text-gb-ink p-1"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-lg uppercase">{category.name}</span>
                        <button 
                          onClick={() => handleEdit(category.id, category.name)}
                          className="text-gb-blue hover:text-gb-blue/80 p-1"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
                              onDeleteCategory(category.id);
                            }
                          }}
                          className="text-gb-red hover:text-gb-red/80 p-1"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-gb-ink bg-gb-paper">
          <button
            onClick={onClose}
            className="w-full bg-gb-ink text-white font-retro text-xs py-3 border-2 border-transparent shadow-[4px_4px_0px_0px_#202020] active:translate-y-[2px] active:shadow-none transition-all"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
