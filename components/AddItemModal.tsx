import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Loader2, Search, CheckCircle } from 'lucide-react';
import { identifyConsoleFromImage, getMarketValuation } from '../services/geminiService';
import { resizeImage } from '../services/imageUtils';
import { Condition, ConsoleItem, ConsoleType, CollectionType } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: ConsoleItem) => void;
  collectionType: CollectionType;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd, collectionType }) => {
  const [step, setStep] = useState<'PHOTO' | 'DETAILS' | 'VALUATION'>('PHOTO');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [type, setType] = useState<ConsoleType>(ConsoleType.HOME);
  const [condition, setCondition] = useState<Condition>(Condition.LOOSE);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set default type based on collection type when modal opens
    if (collectionType === CollectionType.GAMES) setType(ConsoleType.GAME);
    else if (collectionType === CollectionType.ACCESSORIES) setType(ConsoleType.ACCESSORY);
    else if (collectionType === CollectionType.CONSOLES) setType(ConsoleType.HOME);
    else setType(ConsoleType.OTHER);
  }, [collectionType, isOpen]);

  const reset = () => {
    setStep('PHOTO');
    setImage(null);
    setName('');
    setManufacturer('');
    setCondition(Condition.LOOSE);
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setLoading(true);
      setLoadingText('RENDERIZANDO SPRITES...');

      try {
        const compressedBase64 = await resizeImage(file, 600, 0.8);
        setImage(compressedBase64);

        setLoadingText('PROCESSANDO IA...');
        
        const pureBase64 = compressedBase64.split(',')[1];
        const identity = await identifyConsoleFromImage(pureBase64, collectionType);
        
        setName(identity.name);
        setManufacturer(identity.manufacturer);
        setType(identity.type);
        setStep('DETAILS');

      } catch (error) {
        console.error("Erro no processamento:", error);
        setStep('DETAILS');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setLoadingText('CONSULTANDO MERCADO...');
    
    try {
        const valuation = await getMarketValuation(name, condition);
        
        const newItem: ConsoleItem = {
            id: crypto.randomUUID(),
            name,
            manufacturer,
            type,
            condition,
            imageUrl: image || 'https://picsum.photos/400/300',
            addedAt: new Date().toISOString(),
            valuation: {
                currency: 'BRL',
                minPrice: valuation.min,
                maxPrice: valuation.max,
                averagePrice: valuation.avg,
                lastUpdated: new Date().toISOString(),
                reasoning: valuation.reasoning,
                sources: valuation.sources
            }
        };

        onAdd(newItem);
        reset();
        onClose();
    } catch (error) {
        console.error("Failed to save", error);
        alert("GAME OVER. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gb-ink/80 backdrop-blur-sm p-4">
      <div className="bg-gb-paper w-full max-w-lg overflow-hidden shadow-[8px_8px_0px_0px_#202020] border-4 border-gb-ink flex flex-col max-h-[90vh]">
        
        {/* Retro Header */}
        <div className="p-4 border-b-4 border-gb-ink flex justify-between items-center bg-gb-ink text-white">
          <h2 className="text-sm font-retro flex items-center gap-2 uppercase">
            NOVO ITEM
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 font-pixel text-lg text-gb-ink">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-gb-blue" size={48} />
              <p className="text-gb-ink animate-pulse text-center font-retro text-xs">{loadingText}</p>
            </div>
          ) : (
            <>
              {step === 'PHOTO' && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 py-10">
                  <div className="w-24 h-24 bg-white border-4 border-gb-ink flex items-center justify-center mb-4 rounded-full">
                    <Camera size={40} className="text-gb-ink" />
                  </div>
                  <h3 className="text-gb-ink font-retro text-center text-xs leading-loose">TIRE UMA FOTO OU<br/>ESCOLHA DA GALERIA</h3>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gb-blue text-white font-retro text-xs py-4 px-8 shadow-[4px_4px_0px_0px_#202020] flex items-center gap-2 transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none w-full max-w-xs justify-center hover:bg-gb-blue/90"
                  >
                    <Upload size={16} />
                    SELECIONAR
                  </button>

                  <button 
                    onClick={() => setStep('DETAILS')}
                    className="text-gb-ink/50 hover:text-gb-ink underline text-sm mt-4 uppercase"
                  >
                    Pular Foto
                  </button>
                </div>
              )}

              {step === 'DETAILS' && (
                <div className="space-y-4">
                  {image && (
                    <div className="w-full h-48 bg-gb-ink border-2 border-gb-ink mb-4 relative">
                        <img src={image} alt="Preview" className="w-full h-full object-cover gb-filter" />
                        <div className="absolute bottom-2 right-2 bg-white text-gb-ink text-xs font-bold px-2 py-1 border border-gb-ink flex items-center gap-1 shadow-sm">
                            <CheckCircle size={12} className="text-gb-blue" /> SCAN COMPLETE
                        </div>
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
                        className="w-full bg-gb-red hover:bg-gb-red/90 disabled:bg-gb-ink/20 disabled:text-gb-ink/50 text-white font-retro text-xs py-4 border-2 border-transparent shadow-[4px_4px_0px_0px_#202020] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        <Search size={16} />
                        SALVAR
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
