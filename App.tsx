import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, PieChart as PieIcon, Menu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddItemModal from './components/AddItemModal';
import ConsoleList from './components/ConsoleList';
import CollectionSwitcher from './components/CollectionSwitcher';
import CreateCollectionModal from './components/CreateCollectionModal';
import PriceAlertModal from './components/PriceAlertModal';
import CategoryManager from './components/CategoryManager';
import { ConsoleItem, Collection, CollectionType, PriceAlert, CustomCategory } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'COLLECTION' | 'STATS'>('COLLECTION');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  
  // Alert Modal State
  const [alertModalItem, setAlertModalItem] = useState<ConsoleItem | null>(null);
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  // Load custom categories
  useEffect(() => {
    const savedCategories = localStorage.getItem('colletr_custom_categories');
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save custom categories to localStorage
  useEffect(() => {
    if (customCategories.length >= 0) {
      localStorage.setItem('colletr_custom_categories', JSON.stringify(customCategories));
    }
  }, [customCategories]);

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

  // Category management handlers
  const handleAddCategory = (name: string) => {
    const newCategory: CustomCategory = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString()
    };
    setCustomCategories(prev => [...prev, newCategory]);
  };

  const handleEditCategory = (id: string, name: string) => {
    setCustomCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, name } : cat
    ));
    
    // Update collections that use this category
    setCollections(prev => prev.map(col => {
      const oldCategory = customCategories.find(c => c.id === id);
      if (oldCategory && col.type === oldCategory.name) {
        return { ...col, type: name };
      }
      return col;
    }));
  };

  const handleDeleteCategory = (id: string) => {
    const categoryToDelete = customCategories.find(c => c.id === id);
    if (!categoryToDelete) return;

    // Check if any collections use this category
    const collectionsUsingCategory = collections.filter(col => col.type === categoryToDelete.name);
    
    if (collectionsUsingCategory.length > 0) {
      alert(`Não é possível excluir esta categoria pois ${collectionsUsingCategory.length} coleção(ões) a utilizam. Altere as coleções primeiro.`);
      return;
    }

    setCustomCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const items = activeCollection?.items || [];
  const currentCollectionType = activeCollection?.type || CollectionType.CONSOLES;

  return (
    <div className="min-h-screen bg-gb-paper text-gb-ink font-pixel selection:bg-gb-red selection:text-white">
      
      {/* Retro Header (Blue on Grey) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gb-paper border-b-4 border-gb-blue z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 border-2 border-gb-ink bg-gb-paper hover:bg-gb-ink hover:text-white transition-colors shadow-[2px_2px_0px_0px_#202020] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
             <Menu size={20} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-sm font-retro tracking-tighter leading-none italic text-gb-blue font-bold">
              {activeCollection ? activeCollection.name : 'COLLETR'}
            </h1>
            {activeCollection && (
              <span className="text-[10px] text-gb-ink/60 font-pixel uppercase tracking-wide">
                /// {activeCollection.type} ///
              </span>
            )}
          </div>
        </div>
        
        {/* Decorative Battery Indicator */}
        <div className="flex flex-col items-end gap-0.5">
           <div className="text-[8px] font-retro text-gb-ink/40">BATTERY</div>
           <div className="w-6 h-2 bg-gb-red rounded-sm opacity-80 animate-pulse"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 max-w-3xl mx-auto min-h-screen pb-32">
        {!activeCollection ? (
          <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center space-y-6">
             <p className="text-gb-ink text-xl">INSIRA UM CARTUCHO (CRIE UMA COLEÇÃO)</p>
             <button 
               onClick={() => setIsCreateModalOpen(true)}
               className="bg-gb-ink text-white font-retro text-sm py-4 px-6 border-4 border-gb-ink hover:scale-105 transition-transform"
             >
               START GAME
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

      {/* Retro FAB (A Button - Magenta) */}
      {activeCollection && (
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-gb-red text-white rounded-full border-b-4 border-r-4 border-gb-red/50 shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95 active:shadow-none active:border-0"
          aria-label="Adicionar Item"
        >
          <span className="font-retro text-2xl mb-1 ml-0.5 shadow-sm">A</span>
        </button>
      )}

      {/* Bottom Navigation (Select/Start bar area) */}
      {activeCollection && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gb-paper border-t-2 border-gb-ink/20 z-40 flex items-center justify-around px-2 pb-2 safe-area-pb">
          {/* Decorative Start/Select Slanted Pills */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-4 opacity-20 pointer-events-none">
             <div className="w-12 h-3 bg-gb-ink -skew-x-12 rounded-full"></div>
             <div className="w-12 h-3 bg-gb-ink -skew-x-12 rounded-full"></div>
          </div>

          <button 
            onClick={() => setActiveTab('COLLECTION')}
            className={`flex flex-col items-center gap-1 p-2 w-24 rounded-lg transition-all z-10 ${activeTab === 'COLLECTION' ? 'text-gb-blue font-bold' : 'text-gb-ink/50'}`}
          >
            <LayoutGrid size={24} />
            <span className="text-xs font-retro">ITENS</span>
          </button>

          <button 
            onClick={() => setActiveTab('STATS')}
            className={`flex flex-col items-center gap-1 p-2 w-24 rounded-lg transition-all z-10 ${activeTab === 'STATS' ? 'text-gb-blue font-bold' : 'text-gb-ink/50'}`}
          >
            <PieIcon size={24} />
            <span className="text-xs font-retro">STATS</span>
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
        customCategories={customCategories}
      />

      <CollectionSwitcher 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        collections={collections}
        activeId={activeCollectionId}
        onSelect={setActiveCollectionId}
        onAddNew={() => setIsCreateModalOpen(true)}
        onManageCategories={() => setIsCategoryManagerOpen(true)}
      />

      <PriceAlertModal
        isOpen={!!alertModalItem}
        onClose={() => setAlertModalItem(null)}
        item={alertModalItem}
        onSave={handleSaveAlert}
      />

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={customCategories}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />

    </div>
  );
}

export default App;
