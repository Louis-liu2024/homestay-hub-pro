export type Channel = '携程' | '美团' | 'Booking' | '飞猪' | '去哪儿' | 'Agoda' | '途家' | '小红书';

export type HotelTag = '精品' | '连锁' | '民宿' | '度假' | '商务' | '亲子' | '网红' | '温泉';

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  channel: Channel;
  roomCount: number;
  vacancyRate7d: number;
  tags: HotelTag[];
  city: string;
  address: string;
  brand: string;
  totalOrders: number;
  avgPrice: number;
  contactPhone: string;
  rooms: Room[];
  shopId?: string;
  // Rich details
  description?: string;
  images?: string[];
  facilities?: string[];
  openYear?: number;
  decorationYear?: number;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  price: number;
  area: number;
  bedType: string;
  breakfast: '含早' | '不含早' | '可选早';
  maxGuests: number;
  floor: string;
  wifi: boolean;
  published: boolean;
  subscribedPrice: boolean;
  // Extra room details
  image?: string;
  hasWindow?: boolean;
  hasBathroom?: boolean;
  hasVacancy?: boolean;
}

// Price query (查价) result row
export interface PriceQueryResult {
  id: string;
  roomTypeName: string;          // 房型
  productName: string;           // 产品
  cancelPolicy: string;          // 取消政策
  bookingPolicy: string;         // 预定政策
  breakfast: string;             // 早餐：1早 / 2早 / 不含早
  price: number;                 // 价格
  roomsLeft: number;             // 剩余间数
  date: string;                  // 日期
}

export interface PriceRule {
  id: string;
  tag: HotelTag | '全部';
  brand: string;
  startDate: string;
  endDate: string;
  markupPercent: number;
  shopId?: string;
}

export type OrderStatus = '待领取' | '已领取' | '已完成' | '已取消';

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
  claimedAt?: string; // ISO datetime when the task was claimed
  otaPlatform?: string;
  otaOrderNo?: string;
  paymentAmount?: number;
  accountId?: string; // 下单使用的账号
  contactInfo?: string;
  remark?: string;
  createdAt: string;
  amount: number;
  shopId?: string;
  roomNights?: number;
}

export interface Shop {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  channels: Channel[];
  publishTime?: string;
  apiConfigs: ShopApiConfig[];
  createdAt: string;
}

export interface ShopApiConfig {
  id: string;
  channel: Channel;
  apiUrl: string;
  shopAccountId: string;
  apiKey: string;
}

export interface OtaAccount {
  id: string;
  name: string;
  platform: Channel;
  memberLevel: '普通会员' | '银卡' | '金卡' | '钻石' | '黑卡';
  totalOrders: number;
  dailyAvgOrders: number;
  createdAt: string;
  phone: string;
  loginAccount?: string;
  password?: string;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  operatorIds: string[];
}

export interface Operator {
  id: string;
  name: string;
  ordersHandled: number;
  avgProcessingMinutes: number;
  email?: string;
}

export interface DashboardStats {
  todayOrders: number;
  todayOrdersChange: number;
  totalOrders: number;
  totalOrdersChange: number;
  totalRoomNights: number;
  totalRoomNightsChange: number;
  totalUsers: number;
  totalUsersChange: number;
  totalRevenue: number;
  revenueChange: number;
}
