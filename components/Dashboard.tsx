import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ConsoleItem } from '../types';
import { calculateLevel, checkAchievements } from '../services/gamificationUtils';

interface DashboardProps {
  items: ConsoleItem[];
}

const PIE_COLORS = ['#a2153f', '#1d338f', '#202020', '#5c5d63'];

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const totalValue = items.reduce((acc, item) => acc + (item.valuation?.averagePrice || 0), 0);
  
  // Calculate Manufacturer Stats
  const manufacturerStats = items.reduce((acc, item) => {
    const manu = item.manufacturer || 'Outro';
    acc[manu] = (acc[manu] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(manufacturerStats).map(([name, value]) => ({ name, value }));

  // Gamification Stats
  const levelStats = useMemo(() => calculateLevel(items), [items]);
  const achievements = useMemo(() => checkAchievements(items), [items]);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="p-4 space-y-8 animate-fade-in pb-24">
      
      {/* Level Card - SIMULATED GREEN LCD SCREEN */}
      <div className="bg-gb-bezel p-4 rounded-tl-lg rounded-tr-lg rounded-br-3xl rounded-bl-lg shadow-lg relative">
         <div className="flex justify-between items-center mb-1 px-1">
            <div className="flex gap-1">
               <div className="w-2 h-2 bg-gb-red rounded-full animate-pulse"></div>
               <span className="text-[8px] text-white/50 font-retro">BATTERY</span>
            </div>
            <span className="text-[10px] text-gb-blue font-bold italic font-retro">DOT MATRIX WITH STEREO SOUND</span>
         </div>
         
         <div className="bg-gb-lcd-bg border-4 border-gb-lcd-fg/20 p-4 shadow-inner relative overflow-hidden rounded-sm">
            <div className="absolute top-2 right-2 flex flex-col items-end opacity-20 pointer-events-none">
               <span className="font-retro text-4xl text-gb-lcd-fg">LVL</span>
               <span className="font-retro text-6xl text-gb-lcd-fg">{levelStats.currentLevel}</span>
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4 border-b-2 border-gb-lcd-fg pb-2">
                <div>
                   <p className="text-gb-lcd-fg/80 font-bold uppercase text-xs tracking-wider">RANK ATUAL</p>
                   <h2 className="text-2xl font-retro text-gb-lcd-fg leading-none mt-2">{levelStats.currentTitle}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-pixel text-gb-lcd-fg">{Math.floor(levelStats.xpCurrent)}</span>
                  <span className="text-sm text-gb-lcd-fg/80 font-pixel"> / {levelStats.xpNextLevel} XP</span>
                </div>
              </div>
              
              <div className="w-full h-6 bg-gb-lcd-bg border-2 border-gb-lcd-fg p-0.5">
                 <div 
                   className="h-full bg-gb-lcd-fg transition-all duration-1000 ease-in-out"
                   style={{ width: `${levelStats.progressPercent}%` }}
                 />
                 {/* Scanlines */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(15,56,15,0.1)_1px,transparent_1px)] bg-[length:100%_2px] pointer-events-none" />
              </div>
            </div>
         </div>
      </div>

      {/* Value Card - Clean Grey Card */}
      <div className="bg-white border-2 border-gb-ink p-1 rounded-sm shadow-[4px_4px_0px_0px_#202020]">
        <div className="p-4 flex flex-col items-center justify-center relative">
          <span className="text-[10px] text-gb-ink/60 font-bold uppercase tracking-widest">Valor Estimado</span>
          <div className="flex items-baseline gap-2 mt-2">
             <span className="text-4xl font-retro text-gb-ink">R$</span>
             <span className="text-4xl font-pixel text-gb-ink tracking-widest">{totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
          </div>
          <div className="w-full border-t-2 border-dotted border-gb-ink/20 mt-4 pt-2 flex justify-center gap-4 text-xs font-bold text-gb-ink/60 uppercase">
            <span>{items.length} Itens</span>
            <span>•</span>
            <span>BRL Currency</span>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-lg font-retro text-gb-blue mb-4 flex items-center gap-2 border-b-4 border-gb-blue pb-2 inline-block">
          TROFÉUS ({unlockedCount}/{achievements.length})
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <div 
              key={ach.id}
              className={`p-3 border-2 ${ach.isUnlocked ? 'bg-white border-gb-ink' : 'bg-gb-paper border-gb-ink/30'} flex flex-col items-center text-center gap-2 transition-all relative group shadow-sm`}
            >
              {!ach.isUnlocked && (
                  <div className="absolute inset-0 bg-gb-paper/60 z-10 flex items-center justify-center">
                      <span className="font-retro text-2xl text-gb-ink opacity-30">?</span>
                  </div>
              )}

              <div className={`w-16 h-16 flex items-center justify-center mt-2 ${!ach.isUnlocked && 'grayscale opacity-50'}`}>
                <img 
                   src={ach.imageUrl} 
                   alt={ach.title} 
                   className="w-full h-full object-contain image-pixelated" 
                />
              </div>
              
              <div className="w-full">
                <h4 className={`font-bold text-xs font-retro truncate px-1 ${ach.isUnlocked ? 'text-gb-ink' : 'text-gb-ink/50'}`}>
                  {ach.title}
                </h4>
                <p className="text-[12px] font-pixel text-gb-ink/70 leading-tight mt-1 px-1 h-8 overflow-hidden">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Chart */}
      <div className="bg-white border-2 border-gb-ink p-4 shadow-[4px_4px_0px_0px_#202020]">
        <h3 className="text-sm font-retro text-gb-ink mb-4 text-center">DISTRIBUIÇÃO</h3>
        <div className="h-64 w-full font-pixel text-lg">
          {items.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#202020', color: '#202020', fontFamily: '"VT323"', fontSize: '18px' }}
                  itemStyle={{ color: '#202020' }}
                />
                <Legend iconType="circle" formatter={(value) => <span style={{ color: '#202020' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gb-ink/50">
              SEM DADOS
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
