export enum ConsoleType {
  HOME = 'Mesa',
  HANDHELD = 'Portátil',
  GAME = 'Jogo',
  ACCESSORY = 'Acessório',
  OTHER = 'Outro'
}

export enum CollectionType {
  CONSOLES = 'Consoles',
  GAMES = 'Jogos',
  ACCESSORIES = 'Acessórios',
  MIXED = 'Misto'
}

export enum Condition {
  NEW = 'Novo/Lacrado',
  CIB = 'Completo na Caixa',
  LOOSE = 'Item Solto',
  BROKEN = 'Para Peças/Quebrado'
}

export interface ValuationData {
  currency: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  lastUpdated: string; // ISO Date
  sources: string[];
  reasoning: string;
}

export interface PriceAlert {
  enabled: boolean;
  thresholdPercentage: number; // e.g. 10 for 10% change
  lastCheckedPrice: number;
}

export interface ConsoleItem {
  id: string;
  name: string;
  manufacturer: string;
  type: ConsoleType;
  condition: Condition;
  imageUrl: string; // Base64 or placeholder
  valuation: ValuationData | null;
  priceAlert?: PriceAlert;
  addedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  type: CollectionType;
  items: ConsoleItem[];
  createdAt: string;
}

export interface CollectionStats {
  totalItems: number;
  totalValue: number;
  byManufacturer: { name: string; value: number }[];
  byType: { name: string; value: number }[];
}

// Gamification Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // URL for pixel art
  isUnlocked: boolean;
}

export interface UserLevel {
  currentLevel: number;
  currentTitle: string;
  xpCurrent: number;
  xpNextLevel: number;
  progressPercent: number;
}
