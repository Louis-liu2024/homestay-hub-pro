import {
  Wifi, Car, Utensils, Dumbbell, Waves, Coffee, Briefcase, Sparkles,
  Plane, Phone, Shirt, Baby, Dog, Building2, Clock, Wine,
} from "lucide-react";
import type { ReactNode } from "react";

const map: Array<{ keys: string[]; icon: ReactNode }> = [
  { keys: ['WiFi', 'Wi-Fi', '网络'], icon: <Wifi className="h-3.5 w-3.5" /> },
  { keys: ['停车'], icon: <Car className="h-3.5 w-3.5" /> },
  { keys: ['餐厅', '中餐', '西餐'], icon: <Utensils className="h-3.5 w-3.5" /> },
  { keys: ['健身'], icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { keys: ['泳池', '游泳'], icon: <Waves className="h-3.5 w-3.5" /> },
  { keys: ['SPA'], icon: <Sparkles className="h-3.5 w-3.5" /> },
  { keys: ['酒廊'], icon: <Wine className="h-3.5 w-3.5" /> },
  { keys: ['会议'], icon: <Briefcase className="h-3.5 w-3.5" /> },
  { keys: ['机场'], icon: <Plane className="h-3.5 w-3.5" /> },
  { keys: ['商务'], icon: <Briefcase className="h-3.5 w-3.5" /> },
  { keys: ['前台'], icon: <Clock className="h-3.5 w-3.5" /> },
  { keys: ['洗衣'], icon: <Shirt className="h-3.5 w-3.5" /> },
  { keys: ['儿童', '亲子'], icon: <Baby className="h-3.5 w-3.5" /> },
  { keys: ['宠物'], icon: <Dog className="h-3.5 w-3.5" /> },
  { keys: ['咖啡'], icon: <Coffee className="h-3.5 w-3.5" /> },
  { keys: ['电话'], icon: <Phone className="h-3.5 w-3.5" /> },
];

export function facilityIcon(name: string): ReactNode {
  const hit = map.find((m) => m.keys.some((k) => name.includes(k)));
  return hit?.icon ?? <Building2 className="h-3.5 w-3.5" />;
}
