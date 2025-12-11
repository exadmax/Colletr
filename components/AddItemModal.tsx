import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Loader2, Search, CheckCircle } from 'lucide-react';
import { identifyConsoleFromImage, getMarketValuation } from '../services/geminiService';
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
      const reader = new FileReader();
      
      setLoading(true);
      setLoadingText('Processando imagem...');

      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        
        // Auto-identify
        try {
            setLoadingText('Identificando item via IA...');
            const pureBase64 = base64.split(',')[1];
            const identity = await identifyConsoleFromImage(pureBase64, collectionType);
            setName(identity.name);
            setManufacturer(identity.manufacturer);
            setType(identity.type);
            setStep('DETAILS');
        } catch (error) {
            console.error(error);
            // Allow manual entry if AI fails
            setStep('DETAILS');
        } finally {
            setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setLoadingText('Consultando valor de mercado no eBay e ML...');
    
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
        alert("Erro ao avaliar item. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-cyan-400">Colletr</span> Adicionar
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-cyan-400" size={48} />
              <p className="text-slate-300 animate-pulse text-center">{loadingText}</p>
            </div>
          ) : (
            <>
              {step === 'PHOTO' && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 py-10">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 ring-4 ring-cyan-500/20">
                    <Camera size={40} className="text-cyan-400" />
                  </div>
                  <h3 className="text-white text-lg font-medium text-center">Tire uma foto ou envie da galeria</h3>
                  <p className="text-slate-400 text-sm text-center max-w-xs">
                    Adicionando à coleção: <span className="text-cyan-400 font-bold">{collectionType}</span>
                  </p>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-8 rounded-full shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-transform active:scale-95 w-full max-w-xs justify-center"
                  >
                    <Upload size={20} />
                    Selecionar Imagem
                  </button>

                  <button 
                    onClick={() => setStep('DETAILS')}
                    className="text-slate-400 hover:text-white underline text-sm mt-4"
                  >
                    Inserir manualmente sem foto
                  </button>
                </div>
              )}

              {step === 'DETAILS' && (
                <div className="space-y-4">
                  {image && (
                    <div className="w-full h-48 bg-slate-800 rounded-lg overflow-hidden mb-4 relative">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <CheckCircle size={12} /> IA Identificou
                        </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Nome do Item</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Ex: Super Mario World"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Fabricante</label>
                      <input 
                        type="text" 
                        value={manufacturer} 
                        onChange={(e) => setManufacturer(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        placeholder="Ex: Nintendo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Tipo</label>
                      <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value as ConsoleType)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none"
                      >
                        {Object.values(ConsoleType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Condição</label>
                    <select 
                      value={condition} 
                      onChange={(e) => setCondition(e.target.value as Condition)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none"
                    >
                      {Object.values(Condition).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="pt-4">
                    <button 
                        onClick={handleSave}
                        disabled={!name}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Search size={20} />
                        Avaliar & Salvar
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
