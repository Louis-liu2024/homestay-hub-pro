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
  // Extended detail fields (more-info panel)
  hotelExternalId?: string;       // 酒店ID（外部）
  internalId?: string;            // 内部ID
  cityId?: string;                // 城市ID
  provinceId?: string;            // 省份ID
  provinceName?: string;          // 省份名称
  countryId?: string;             // 国家ID
  countryName?: string;           // 国家名称
  countryNameEn?: string;         // 国家名称(英文)
  countryType?: string;           // 国家类型
  regionId?: string;              // 区域ID
  locationAddress?: string;       // 位置地址
  longitude?: string;             // 经度
  latitude?: string;              // 纬度
  starLevel?: number;             // 星级
  ratingDesc?: string;            // 评价描述
  reviewCount?: number;           // 评论数
  totalCount?: number;            // 总数量
  medalType?: number;             // 奖牌类型
  medalName?: string;             // 奖牌名称
  email?: string;                 // 邮箱
  frontDeskHours?: string;        // 前台营业时间
  petPolicy?: string;             // 宠物政策
  destinationName?: string;       // 目的地名称
  destinationNameEn?: string;     // 目的地名称(英文)
  timezoneOffset?: string;        // 时区偏移
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
  // Extended room detail fields (room-detail panel)
  roomExternalId?: string;        // 房型ID（外部）
  subRoomTypeName?: string;       // 子房型名称
  subRoomTypeId?: string;         // 子房型ID
  windowType?: string;            // 窗户类型
  stock?: number;                 // 库存
  minOrderQty?: number;           // 最小订购量
  maxOrderQty?: number;           // 最大订购量
  cancelPolicyName?: string;      // 取消政策
  cancelType?: string;            // 取消类型
  preCancelTime?: string;         // 提前取消时间
  paymentMethod?: string;         // 支付方式
  createdAt?: string;             // 创建时间
  facilityTags?: string[];        // 简易设施标签
  facilityGroups?: RoomFacilityGroup[]; // 详细设施信息
}

export interface RoomFacilityGroup {
  name: string;
  items: string[];
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
  /** 店铺发布状态 */
  published?: boolean;
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
