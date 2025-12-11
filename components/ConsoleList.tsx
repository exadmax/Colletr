import React, { useState, useMemo } from 'react';
import { ConsoleItem, ConsoleType, Condition } from '../types';
import { Tag, TrendingUp, ExternalLink, Search, Filter, X, Bell, BellRing } from 'lucide-react';

interface ConsoleListProps {
  items: ConsoleItem[];
  onConfigureAlert: (item: ConsoleItem) => void;
}

const ConsoleList: React.FC<ConsoleListProps> = ({ items, onConfigureAlert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCondition, setFilterCondition] = useState<string>('ALL');
  const [filterManufacturer, setFilterManufacturer] = useState<string>('ALL');

  // Derive unique manufacturers from current items for the dropdown
  const manufacturers = useMemo(() => {
    const manus = new Set(items.map(i => i.manufacturer).filter(Boolean));
    return Array.from(manus).sort();
  }, [items]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'ALL' || item.type === filterType;
      const matchesCondition = filterCondition === 'ALL' || item.condition === filterCondition;
      const matchesManufacturer = filterManufacturer === 'ALL' || item.manufacturer === filterManufacturer;

      return matchesSearch && matchesType && matchesCondition && matchesManufacturer;
    });
  }, [items, searchQuery, filterType, filterCondition, filterManufacturer]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('ALL');
    setFilterCondition('ALL');
    setFilterManufacturer('ALL');
    setShowFilters(false);
  };

  const hasActiveFilters = filterType !== 'ALL' || filterCondition !== 'ALL' || filterManufacturer !== 'ALL';

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <div className="text-6xl mb-4">👾</div>
        <p className="text-lg">Sua coleção está vazia.</p>
        <p className="text-sm">Toque no + para começar.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-4 px-4">
      
      {/* Search and Filter Header */}
      <div className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur-sm -mx-4 px-4 py-2 border-b border-slate-800 space-y-3 shadow-md">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar item..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 rounded-xl border flex items-center justify-center transition-colors ${
              showFilters || hasActiveFilters 
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fade-in pb-2">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 text-white text-xs p-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none"
            >
              <option value="ALL">Todos Tipos</option>
              {Object.values(ConsoleType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select 
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="bg-slate-800 text-white text-xs p-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none"
            >
              <option value="ALL">Qualquer Condição</option>
              {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={filterManufacturer}
              onChange={(e) => setFilterManufacturer(e.target.value)}
              className="bg-slate-800 text-white text-xs p-2 rounded-lg border border-slate-700 focus:border-cyan-500 outline-none col-span-2 sm:col-span-1"
            >
              <option value="ALL">Todos Fabricantes</option>
              {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
        
        {/* Active Filters Summary (if panel is closed but filters are active) */}
        {!showFilters && hasActiveFilters && (
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {filterType !== 'ALL' && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 whitespace-nowrap">{filterType}</span>}
              {filterCondition !== 'ALL' && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 whitespace-nowrap">{filterCondition}</span>}
              {filterManufacturer !== 'ALL' && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 whitespace-nowrap">{filterManufacturer}</span>}
              <button onClick={clearFilters} className="text-[10px] text-red-400 underline whitespace-nowrap">Limpar</button>
           </div>
        )}
      </div>

      {/* Results List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <p>Nenhum item encontrado com estes filtros.</p>
          <button onClick={clearFilters} className="mt-2 text-cyan-400 text-sm hover:underline">Limpar filtros</button>
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col sm:flex-row animate-fade-in-up relative group">
            <div className="h-48 sm:h-auto sm:w-48 bg-slate-900 shrink-0 relative">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                {item.type}
              </div>
            </div>
            
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <div className="flex justify-between items-start pr-8">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
                    <p className="text-slate-400 text-sm">{item.manufacturer}</p>
                  </div>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 whitespace-nowrap">
                    {item.condition}
                  </span>
                </div>
                
                <div className="mt-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <TrendingUp size={16} />
                    <span className="font-bold">
                      R$ {item.valuation?.averagePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {item.valuation?.reasoning}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                 {item.valuation?.sources.map((source, idx) => (
                   <a 
                     key={idx} 
                     href={source} 
                     target="_blank" 
                     rel="noreferrer"
                     className="text-[10px] bg-slate-700 hover:bg-slate-600 text-cyan-400 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                   >
                     <ExternalLink size={10} /> Link {idx + 1}
                   </a>
                 ))}
              </div>
            </div>

            {/* Alert Button */}
            <button
               onClick={() => onConfigureAlert(item)}
               className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md border shadow-lg transition-colors z-10
                 ${item.priceAlert?.enabled 
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                    : 'bg-black/30 border-white/10 text-slate-400 hover:bg-black/50 hover:text-white'
                 }`}
            >
               {item.priceAlert?.enabled ? <BellRing size={16} /> : <Bell size={16} />}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ConsoleList;
