import React, { useState, useMemo } from 'react';
import { ConsoleItem, ConsoleType, Condition } from '../types';
import { TrendingUp, ExternalLink, Search, Filter, X, Bell, BellRing } from 'lucide-react';
import { getRarityStyle, getRarityName } from '../services/gamificationUtils';

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

  const manufacturers = useMemo(() => {
    const manus = new Set(items.map(i => i.manufacturer).filter(Boolean));
    return Array.from(manus).sort();
  }, [items]);

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
      <div className="flex flex-col items-center justify-center py-20 opacity-50 text-gb-ink">
        <div className="text-6xl mb-4 font-retro text-gb-ink/30">?</div>
        <p className="text-2xl font-pixel">MOCHILA VAZIA</p>
        <p className="text-lg font-pixel text-gb-ink/60">PRESSIONE A (+)</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-4 px-4">
      
      {/* Retro Search Header */}
      <div className="sticky top-16 z-30 bg-gb-paper -mx-4 px-4 py-3 border-b-2 border-gb-ink/10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gb-ink/50" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="BUSCAR..."
              className="w-full bg-white border-2 border-gb-ink rounded-lg pl-10 pr-4 py-2 font-pixel text-xl text-gb-ink placeholder-gb-ink/40 focus:outline-none focus:border-gb-blue transition-colors uppercase shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gb-ink hover:text-gb-red"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 border-2 rounded-lg flex items-center justify-center transition-colors ${
              showFilters || hasActiveFilters 
                ? 'bg-gb-ink text-white border-gb-ink' 
                : 'bg-white text-gb-ink border-gb-ink hover:bg-gb-paper'
            }`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Retro Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fade-in mt-2">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white text-gb-ink font-pixel text-lg p-1 border-2 border-gb-ink rounded outline-none uppercase"
            >
              <option value="ALL">TODOS TIPOS</option>
              {Object.values(ConsoleType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select 
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="bg-white text-gb-ink font-pixel text-lg p-1 border-2 border-gb-ink rounded outline-none uppercase"
            >
              <option value="ALL">QUALQUER ESTADO</option>
              {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={filterManufacturer}
              onChange={(e) => setFilterManufacturer(e.target.value)}
              className="bg-white text-gb-ink font-pixel text-lg p-1 border-2 border-gb-ink rounded outline-none col-span-2 sm:col-span-1 uppercase"
            >
              <option value="ALL">TODOS FABRICANTES</option>
              {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Results List - Retro Cards */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-10 text-gb-ink/60 font-pixel text-xl">
          <p>NADA ENCONTRADO.</p>
          <button onClick={clearFilters} className="mt-2 text-gb-blue underline">RESETAR</button>
        </div>
      ) : (
        filteredItems.map((item) => {
          const price = item.valuation?.averagePrice || 0;
          const rarityClass = getRarityStyle(price);
          const rarityName = getRarityName(price);

          return (
          <div 
            key={item.id} 
            className={`bg-white ${rarityClass} flex flex-row animate-fade-in-up relative group h-36 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 rounded-sm`}
          >
            
            {/* Filtered Thumbnail */}
            <div className="w-32 bg-gb-ink/10 shrink-0 relative border-r-2 border-gb-ink/20 overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover gb-filter" 
              />
              <div className="absolute top-0 left-0 bg-gb-ink text-white font-retro text-[8px] px-2 py-1 rounded-br-sm">
                {item.type.toUpperCase()}
              </div>
            </div>
            
            <div className="p-3 flex flex-col justify-between flex-1 overflow-hidden relative">
              <div className="pr-8">
                <h3 className="text-sm font-retro text-gb-ink leading-tight truncate w-full mb-1">{item.name}</h3>
                <div className="flex flex-wrap items-center gap-x-2 text-sm font-pixel text-gb-ink/60 uppercase">
                   <span className="font-bold">{item.manufacturer}</span>
                   <span>•</span>
                   <span>{item.condition}</span>
                </div>
                {price >= 1500 && (
                   <span className="inline-block mt-1 text-[10px] font-retro bg-gb-blue text-white px-2 py-0.5 rounded-full">
                     ★ {rarityName}
                   </span>
                )}
              </div>

              <div className="flex items-end justify-between mt-1">
                <div className="bg-gb-paper px-2 py-0 border border-gb-ink/20 rounded">
                  <div className="flex items-center gap-1.5 text-gb-ink">
                    <TrendingUp size={14} className="text-gb-red" />
                    <span className="font-retro text-xs pt-1">
                      R${price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                   {item.valuation?.sources.slice(0, 1).map((source, idx) => (
                     <a 
                       key={idx} 
                       href={source} 
                       target="_blank" 
                       rel="noreferrer"
                       className="bg-white text-gb-blue w-8 h-8 flex items-center justify-center border border-gb-blue hover:bg-gb-blue hover:text-white rounded-full transition-colors"
                     >
                       <ExternalLink size={14} />
                     </a>
                   ))}
                </div>
              </div>
            </div>

            {/* Retro Alert Button */}
            <button
               onClick={() => onConfigureAlert(item)}
               className={`absolute top-2 right-2 p-1.5 rounded-full border transition-colors z-10
                 ${item.priceAlert?.enabled 
                    ? 'bg-gb-red text-white border-gb-red' 
                    : 'bg-transparent text-gb-ink/30 border-transparent hover:text-gb-blue'
                 }`}
            >
               {item.priceAlert?.enabled ? <BellRing size={14} /> : <Bell size={14} />}
            </button>
          </div>
        )
      })
      )}
    </div>
  );
};

export default ConsoleList;
