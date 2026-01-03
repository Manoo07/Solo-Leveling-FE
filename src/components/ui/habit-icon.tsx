import {
  Activity,
  Book,
  Brain,
  Briefcase,
  Coffee,
  Dumbbell,
  Heart,
  Leaf,
  Moon,
  Music,
  Palette,
  PenTool,
  Target,
  Timer,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  Sun,
  Droplets,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'activity': Activity,
  'book': Book,
  'brain': Brain,
  'briefcase': Briefcase,
  'coffee': Coffee,
  'dumbbell': Dumbbell,
  'heart': Heart,
  'leaf': Leaf,
  'moon': Moon,
  'music': Music,
  'palette': Palette,
  'pen-tool': PenTool,
  'target': Target,
  'timer': Timer,
  'trending-up': TrendingUp,
  'utensils': Utensils,
  'wallet': Wallet,
  'zap': Zap,
  'sun': Sun,
  'droplets': Droplets,
};

interface HabitIconProps {
  iconName?: string;
  className?: string;
}

export const HabitIcon = ({ iconName, className = "w-4 h-4" }: HabitIconProps) => {
  const IconComponent = iconName ? iconMap[iconName] || iconMap['target'] : iconMap['target'];
  return <IconComponent className={className} />;
};
