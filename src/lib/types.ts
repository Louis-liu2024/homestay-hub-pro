export type Channel = '携程' | '美团' | 'Booking' | '飞猪' | '去哪儿' | 'Agoda' | '途家' | '小红书';

export type HotelTag = '精品' | '连锁' | '民宿' | '度假' | '商务' | '亲子' | '网红' | '温泉';

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  channel: Channel;
  roomCount: number;
  vacancyRate7d: number; // 近7天空房率 0-1
  tags: HotelTag[];
  city: string;
  address: string;
  brand: string;
  totalOrders: number;
  avgPrice: number;
  contactPhone: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  price: number;
  area: number; // 平方米
  bedType: string;
  breakfast: '含早' | '不含早' | '可选早';
  maxGuests: number;
  floor: string;
  wifi: boolean;
  published: boolean;
  subscribedPrice: boolean;
}

export interface PriceRule {
  id: string;
  tag: HotelTag | '全部';
  brand: string;
  startDate: string;
  endDate: string;
  markupPercent: number; // 涨幅百分比
}

export type OrderStatus = '待领取' | '已领取' | '已完成';

export interface Order {
  id: string;
  orderNo: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  status: OrderStatus;
  claimedBy?: string;
  otaPlatform?: string;
  otaOrderNo?: string;
  contactInfo?: string;
  remark?: string;
  createdAt: string;
  amount: number;
}
