import { Collection, ConsoleItem, Achievement, UserLevel, ConsoleType } from '../types';

// Rarity Borders for Game Boy Theme (Patterns/Solid lines)
export const getRarityStyle = (price: number): string => {
  if (price >= 5000) return 'border-4 border-dashed border-gb-red bg-gb-paper'; // Legendary
  if (price >= 1500) return 'border-4 border-double border-gb-blue'; // Epic
  if (price >= 400) return 'border-2 border-gb-ink'; // Rare
  if (price >= 100) return 'border border-gb-ink'; // Uncommon
  return 'border border-gb-ink opacity-80'; // Common
};

export const getRarityName = (price: number): string => {
  if (price >= 5000) return 'LENDÁRIO';
  if (price >= 1500) return 'ÉPICO';
  if (price >= 400) return 'RARO';
  if (price >= 100) return 'INCOMUM';
  return 'COMUM';
};

// Leveling Logic
export const calculateLevel = (items: ConsoleItem[]): UserLevel => {
  const totalValue = items.reduce((acc, item) => acc + (item.valuation?.averagePrice || 0), 0);
  const totalXP = (items.length * 500) + Math.floor(totalValue / 5);

  const level = Math.floor(totalXP / 2500) + 1;
  
  const xpForCurrentLevel = (level - 1) * 2500;
  const xpForNextLevel = level * 2500;
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  
  const progress = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeeded) * 100));

  let title = "NOVATO";
  if (level >= 5) title = "COLECIONADOR";
  if (level >= 10) title = "CAÇADOR";
  if (level >= 20) title = "CURADOR";
  if (level >= 30) title = "HISTORIADOR";
  if (level >= 50) title = "MESTRE 8-BIT";

  return {
    currentLevel: level,
    currentTitle: title,
    xpCurrent: xpInCurrentLevel,
    xpNextLevel: xpNeeded,
    progressPercent: progress
  };
};

// Achievements Logic with Pixel Art Images
export const checkAchievements = (items: ConsoleItem[]): Achievement[] => {
  const totalValue = items.reduce((acc, item) => acc + (item.valuation?.averagePrice || 0), 0);
  const manufacturers = new Set(items.map(i => i.manufacturer?.toLowerCase()).filter(Boolean));
  
  // Using reliable pixel art icons
  const achievements = [
    {
      id: 'start',
      title: 'INSERT COIN',
      description: 'Adicione seu primeiro item.',
      imageUrl: 'https://img.icons8.com/pixel-minecraft/100/egg.png',
      condition: () => items.length >= 1
    },
    {
      id: 'stack',
      title: 'PILHA DE JOGOS',
      description: 'Colecione 5 itens.',
      imageUrl: 'https://img.icons8.com/pixel-minecraft/100/book.png',
      condition: () => items.length >= 5
    },
    {
      id: 'nintendo',
      title: 'SUPER FANBOY',
      description: 'Tenha 3 itens da Nintendo.',
      imageUrl: 'https://img.icons8.com/pixel-minecraft/100/red-mushroom.png',
      condition: () => items.filter(i => i.manufacturer?.toLowerCase().includes('nintendo')).length >= 3
    },
    {
      id: 'sega',
      title: 'BLAST PROCESS',
      description: 'Tenha 3 itens da Sega.',
      imageUrl: 'https://img.icons8.com/pixel-minecraft/100/gold-ring.png',
      condition: () => items.filter(i => i.manufacturer?.toLowerCase().includes('sega')).length >= 3
    },
    {
      id: 'sony',
      title: 'PLAYSTATION',
      description: 'Tenha 3 itens da Sony.',
      imageUrl: 'https://img.icons8.com/pixel-minecraft/100/game-controller.png',
      condition: () => items.filter(i => i.manufacturer?.toLowerCase().includes('sony')).length >= 3
    },
    {
      id: 'rich',
      title: 'HIGH SCORE',
      description: 'Item > R$ 2.000.',
      imageUrl: 'https://img.icons8.com/pixel-minecraft/100/diamond.png',
      condition: () => items.some(i => (i.valuation?.averagePrice || 0) >= 2000)
    },
    {
      id: 'hoarder',
      title: 'MUSEU 8-BIT',
      description: 'Total > R$ 10.000.',
      imageUrl: 'https://img.icons8.com/pixel-minecraft/100/chest.png',
      condition: () => totalValue >= 10000
    },
    {
      id: 'variety',
      title: 'MULTIPLATAFORMA',
      description: '4 fabricantes diferentes.',
      imageUrl: 'https://img.icons8.com/pixel-minecraft/100/compass.png',
      condition: () => manufacturers.size >= 4
    }
  ];

  return achievements.map(ach => ({
    id: ach.id,
    title: ach.title,
    description: ach.description,
    imageUrl: ach.imageUrl,
    isUnlocked: ach.condition()
  }));
};
