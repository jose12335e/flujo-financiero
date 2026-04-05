import type { LucideIcon } from 'lucide-react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BriefcaseBusiness,
  Car,
  Gift,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  House,
  Popcorn,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Wifi,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  BriefcaseBusiness,
  TrendingUp,
  Gift,
  Sparkles,
  House,
  UtensilsCrossed,
  Car,
  HeartPulse,
  GraduationCap,
  Popcorn,
  Wifi,
  ShoppingBag,
  ReceiptText,
  ArrowUpCircle,
  ArrowDownCircle,
}

export function getIcon(iconName: string) {
  return iconMap[iconName] ?? HelpCircle
}
