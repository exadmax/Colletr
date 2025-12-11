import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, PieChart as PieIcon, Menu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddItemModal from './components/AddItemModal';
import ConsoleList from './components/ConsoleList';
import CollectionSwitcher from './components/CollectionSwitcher';
import CreateCollectionModal from './components/CreateCollectionModal';
import PriceAlertModal from './components/PriceAlertModal';
import { ConsoleItem, Collection, CollectionType, PriceAlert } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'COLLECTION' | 'STATS'>('COLLECTION');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Alert Modal State
  const [alertModalItem, setAlertModalItem] = useState<ConsoleItem | null>(null);
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  // Migration and Load logic
  useEffect(() => {
    const savedCollections = localStorage.getItem('colletr_collections');
    const legacyItems = localStorage.getItem('colletr_items');

    if (savedCollections) {
      const parsed = JSON.parse(savedCollections);
      setCollections(parsed);
      if (parsed.length > 0) {
        setActiveCollectionId(parsed[0].id);
      } else {
        setIsCreateModalOpen(true);
      }
    } else if (legacyItems) {
      // Migrate legacy data
      const oldItems = JSON.parse(legacyItems);
      const defaultCollection: Collection = {
        id: crypto.randomUUID(),
        name: 'Minha Coleção',
        description: 'Coleção importada',
        type: CollectionType.CONSOLES,
        items: oldItems,
        createdAt: new Date().toISOString()
      };
      setCollections([defaultCollection]);
      setActiveCollectionId(defaultCollection.id);
      localStorage.removeItem('colletr_items');
    } else {
      // First time user
      setIsCreateModalOpen(true);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (collections.length > 0) {
      localStorage.setItem('colletr_collections', JSON.stringify(collections));
    }
  }, [collections]);

  const activeCollection = collections.find(c => c.id === activeCollectionId);

  const handleCreateCollection = (newCollection: Collection) => {
    setCollections(prev => [...prev, newCollection]);
    setActiveCollectionId(newCollection.id);
  };

  const handleAddItem = (newItem: ConsoleItem) => {
    if (!activeCollectionId) return;

    setCollections(prev => prev.map(col => {
      if (col.id === activeCollectionId) {
        return { ...col, items: [newItem, ...col.items] };
      }
      return col;
    }));
  };

  const handleSaveAlert = (itemId: string, alert: PriceAlert) => {
    if (!activeCollectionId) return;

    setCollections(prev => prev.map(col => {
      if (col.id === activeCollectionId) {
        const updatedItems = col.items.map(item => {
          if (item.id === itemId) {
            return { ...item, priceAlert: alert };
          }
          return item;
        });
        return { ...col, items: updatedItems };
      }
      return col;
    }));
  };

  const items = activeCollection?.items || [];
  const currentCollectionType = activeCollection?.type || CollectionType.CONSOLES;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-40 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
             <Menu size={24} className="text-slate-300" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">
              {activeCollection ? activeCollection.name : 'Colletr'}
            </h1>
            {activeCollection && (
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wide">
                {activeCollection.type}
              </span>
            )}
          </div>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          C
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 max-w-3xl mx-auto min-h-screen pb-32">
        {!activeCollection ? (
          <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center space-y-6">
             <p className="text-slate-400">Crie uma coleção para começar a catalogar seus itens.</p>
             <button 
               onClick={() => setIsCreateModalOpen(true)}
               className="bg-cyan-500 text-black font-bold py-3 px-6 rounded-xl hover:bg-cyan-400 transition-colors"
             >
               Criar Primeira Coleção
             </button>
          </div>
        ) : (
          <>
            {activeTab === 'COLLECTION' && (
               <ConsoleList 
                 items={items} 
                 onConfigureAlert={(item) => setAlertModalItem(item)}
               />
            )}
            {activeTab === 'STATS' && (
               <Dashboard items={items} />
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      {activeCollection && (
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full shadow-lg shadow-cyan-500/40 flex items-center justify-center z-40 transition-transform hover:scale-105 active:scale-95"
          aria-label="Adicionar Item"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      )}

      {/* Bottom Navigation */}
      {activeCollection && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900 border-t border-slate-800 z-40 flex items-center justify-around px-2 pb-2 safe-area-pb">
          <button 
            onClick={() => setActiveTab('COLLECTION')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors w-24 ${activeTab === 'COLLECTION' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutGrid size={24} />
            <span className="text-xs font-medium">Itens</span>
          </button>

          <button 
            onClick={() => setActiveTab('STATS')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors w-24 ${activeTab === 'STATS' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <PieIcon size={24} />
            <span className="text-xs font-medium">Análise</span>
          </button>
        </nav>
      )}

      {/* Modals & Drawers */}
      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddItem}
        collectionType={currentCollectionType}
      />

      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCollection}
      />

      <CollectionSwitcher 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        collections={collections}
        activeId={activeCollectionId}
        onSelect={setActiveCollectionId}
        onAddNew={() => setIsCreateModalOpen(true)}
      />

      <PriceAlertModal
        isOpen={!!alertModalItem}
        onClose={() => setAlertModalItem(null)}
        item={alertModalItem}
        onSave={handleSaveAlert}
      />

    </div>
  );
}

export default App;
