import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { CollectionStats, ConsoleItem } from '../types';

interface DashboardProps {
  items: ConsoleItem[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const totalValue = items.reduce((acc, item) => acc + (item.valuation?.averagePrice || 0), 0);
  
  // Calculate Manufacturer Stats
  const manufacturerStats = items.reduce((acc, item) => {
    const manu = item.manufacturer || 'Outro';
    acc[manu] = (acc[manu] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(manufacturerStats).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-violet-900 to-purple-800 rounded-2xl p-6 shadow-xl text-white">
        <h2 className="text-sm font-medium opacity-80 uppercase tracking-wider">Valor Estimado da Coleção</h2>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="mt-4 text-sm opacity-75 flex justify-between items-center">
          <span>{items.length} Itens catalogados</span>
          <span className="bg-white/20 px-2 py-1 rounded text-xs">Atualizado Hoje</span>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Fabricante</h3>
        <div className="h-64 w-full">
          {items.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
