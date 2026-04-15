import type { Hotel, Room, PriceRule, Order, Channel, HotelTag, Shop, ShopApiConfig, Operator, DashboardStats } from './types';

const channels: Channel[] = ['携程', '美团', 'Booking', '飞猪', '去哪儿', 'Agoda', '途家', '小红书'];
const tags: HotelTag[][] = [
  ['精品', '商务'], ['连锁', '商务'], ['民宿', '网红'], ['度假', '温泉'],
  ['精品', '亲子'], ['连锁'], ['民宿', '度假'], ['商务'],
  ['网红', '精品'], ['度假', '亲子'], ['温泉', '度假'], ['连锁', '商务'],
  ['民宿'], ['精品', '网红'], ['商务', '连锁'], ['度假'],
  ['亲子', '民宿'], ['温泉'], ['网红'], ['精品', '度假'],
  ['连锁', '亲子'], ['商务', '精品'], ['民宿', '温泉'], ['度假', '网红'],
];
const brands = ['如家', '汉庭', '全季', '亚朵', '希尔顿', '万豪', '独立品牌', '洲际', '凯悦', '锦江之星'];
const cities = ['上海', '北京', '杭州', '成都', '深圳', '广州', '三亚', '大理', '丽江', '厦门'];
const bedTypes = ['大床', '双床', '家庭房', '榻榻米', '圆床', '上下铺'];

function makeRooms(hotelId: string, count: number): Room[] {
  const roomNames = ['标准大床房', '豪华双床房', '商务套房', '家庭亲子房', '景观大床房', '行政套房', '经济单人房', '蜜月圆床房'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${hotelId}-r${i + 1}`,
    hotelId,
    name: roomNames[i % roomNames.length],
    price: Math.round(200 + Math.random() * 1800),
    area: Math.round(20 + Math.random() * 60),
    bedType: bedTypes[i % bedTypes.length],
    breakfast: (['含早', '不含早', '可选早'] as const)[i % 3],
    maxGuests: Math.floor(1 + Math.random() * 4),
    floor: `${Math.floor(2 + Math.random() * 28)}F`,
    wifi: Math.random() > 0.1,
    published: Math.random() > 0.5,
    subscribedPrice: Math.random() > 0.7,
  }));
}

// ---- Shops ----
export const mockShops: Shop[] = [
  {
    id: 'shop1', name: '华东旗舰店', region: '华东', city: '上海',
    address: '上海市黄浦区南京东路100号',
    channels: ['携程', '美团', '飞猪'],
    publishTime: '2025-01-15',
    apiConfigs: [
      { id: 'ac1', channel: '携程', apiUrl: 'https://api.ctrip.com/v2', shopAccountId: 'CT_SHOP_001', apiKey: 'sk-ct-xxxx' },
      { id: 'ac2', channel: '美团', apiUrl: 'https://api.meituan.com/hotel/v1', shopAccountId: 'MT_SHOP_001', apiKey: 'sk-mt-xxxx' },
    ],
    createdAt: '2025-01-10',
  },
  {
    id: 'shop2', name: '华南精品店', region: '华南', city: '深圳',
    address: '深圳市南山区科技园路200号',
    channels: ['Booking', 'Agoda', '去哪儿'],
    publishTime: '2025-02-20',
    apiConfigs: [
      { id: 'ac3', channel: 'Booking', apiUrl: 'https://api.booking.com/v3', shopAccountId: 'BK_SHOP_002', apiKey: 'sk-bk-xxxx' },
    ],
    createdAt: '2025-02-15',
  },
  {
    id: 'shop3', name: '西南度假店', region: '西南', city: '成都',
    address: '成都市锦江区春熙路88号',
    channels: ['携程', '途家', '小红书'],
    publishTime: '2025-03-10',
    apiConfigs: [
      { id: 'ac4', channel: '途家', apiUrl: 'https://api.tujia.com/v1', shopAccountId: 'TJ_SHOP_003', apiKey: 'sk-tj-xxxx' },
    ],
    createdAt: '2025-03-05',
  },
  {
    id: 'shop4', name: '华北商务店', region: '华北', city: '北京',
    address: '北京市朝阳区国贸大厦A座',
    channels: ['美团', '飞猪', '去哪儿'],
    publishTime: '2025-04-01',
    apiConfigs: [],
    createdAt: '2025-03-28',
  },
];

const hotelNames = [
  '上海外滩璞丽酒店', '北京瑰丽酒店', '杭州西湖柏悦', '成都博舍', '深圳湾万豪',
  '广州文华东方', '三亚亚特兰蒂斯', '大理洱海天域', '丽江古城花间堂', '厦门鼓浪屿别墅',
  '上海安缦养云', '北京王府半岛', '杭州湖滨28', '成都太古里亚朵', '深圳前海华侨城',
  '广州W酒店', '三亚海棠湾仁恒', '大理苍山隐居', '丽江束河悦榕庄', '厦门海沧温泉',
  '上海静安香格里拉', '北京三里屯通盈', '杭州灵隐安缦', '成都春熙路全季',
];

const shopIds = ['shop1', 'shop2', 'shop3', 'shop4'];

export const mockHotels: Hotel[] = hotelNames.map((name, i) => {
  const roomCount = 3 + Math.floor(Math.random() * 6);
  const id = `h${i + 1}`;
  return {
    id,
    name,
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    channel: channels[i % channels.length],
    roomCount,
    vacancyRate7d: Math.round(Math.random() * 100) / 100,
    tags: tags[i % tags.length],
    city: cities[i % cities.length],
    address: `${cities[i % cities.length]}市${name.includes('外滩') ? '黄浦区' : '中心区'}某路${100 + i * 17}号`,
    brand: brands[i % brands.length],
    totalOrders: Math.floor(50 + Math.random() * 500),
    avgPrice: Math.round(300 + Math.random() * 2000),
    contactPhone: `1${3 + Math.floor(Math.random() * 7)}${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`,
    rooms: makeRooms(id, roomCount),
    shopId: shopIds[i % shopIds.length],
  };
});

export const mockPriceRules: PriceRule[] = [
  { id: 'pr1', tag: '精品', brand: '全部', startDate: '2026-04-01', endDate: '2026-04-30', markupPercent: 15, shopId: 'shop1' },
  { id: 'pr2', tag: '度假', brand: '全部', startDate: '2026-07-01', endDate: '2026-08-31', markupPercent: 30, shopId: 'shop3' },
  { id: 'pr3', tag: '全部', brand: '亚朵', startDate: '2026-05-01', endDate: '2026-05-05', markupPercent: 20, shopId: 'shop1' },
  { id: 'pr4', tag: '商务', brand: '如家', startDate: '2026-04-15', endDate: '2026-06-15', markupPercent: 10, shopId: 'shop4' },
  { id: 'pr5', tag: '温泉', brand: '全部', startDate: '2026-12-01', endDate: '2027-02-28', markupPercent: 25, shopId: 'shop2' },
];

// Generate more orders with dates spread across last 30 days
function generateOrders(): Order[] {
  const baseOrders: Order[] = [
    { id: 'o1', orderNo: 'ORD20260401001', hotelName: '上海外滩璞丽酒店', roomType: '豪华双床房', checkInDate: '2026-04-15', checkOutDate: '2026-04-17', guestName: '张三', status: '待领取', createdAt: '2026-04-01', amount: 2580, shopId: 'shop1', roomNights: 2 },
    { id: 'o2', orderNo: 'ORD20260401002', hotelName: '杭州西湖柏悦', roomType: '景观大床房', checkInDate: '2026-04-20', checkOutDate: '2026-04-22', guestName: '李四', status: '待领取', createdAt: '2026-04-02', amount: 3200, shopId: 'shop1', roomNights: 2 },
    { id: 'o3', orderNo: 'ORD20260402003', hotelName: '三亚亚特兰蒂斯', roomType: '家庭亲子房', checkInDate: '2026-05-01', checkOutDate: '2026-05-04', guestName: '王五', status: '已领取', claimedBy: 'op1', otaPlatform: '携程', otaOrderNo: 'CT20260402X1', contactInfo: '13800001111', createdAt: '2026-04-02', amount: 8900, shopId: 'shop2', roomNights: 3 },
    { id: 'o4', orderNo: 'ORD20260403004', hotelName: '成都博舍', roomType: '商务套房', checkInDate: '2026-04-18', checkOutDate: '2026-04-19', guestName: '赵六', status: '已完成', claimedBy: 'op2', otaPlatform: '美团', otaOrderNo: 'MT20260403Y2', contactInfo: '13900002222', remark: '客人要求高楼层', createdAt: '2026-04-03', amount: 1680, shopId: 'shop3', roomNights: 1 },
    { id: 'o5', orderNo: 'ORD20260404005', hotelName: '深圳湾万豪', roomType: '标准大床房', checkInDate: '2026-04-25', checkOutDate: '2026-04-27', guestName: '钱七', status: '待领取', createdAt: '2026-04-04', amount: 1990, shopId: 'shop2', roomNights: 2 },
    { id: 'o6', orderNo: 'ORD20260405006', hotelName: '大理洱海天域', roomType: '景观大床房', checkInDate: '2026-05-10', checkOutDate: '2026-05-13', guestName: '孙八', status: '待领取', createdAt: '2026-04-05', amount: 4500, shopId: 'shop3', roomNights: 3 },
    { id: 'o7', orderNo: 'ORD20260406007', hotelName: '北京瑰丽酒店', roomType: '行政套房', checkInDate: '2026-04-22', checkOutDate: '2026-04-24', guestName: '周九', status: '已领取', claimedBy: 'op1', createdAt: '2026-04-06', amount: 5600, shopId: 'shop4', roomNights: 2 },
    { id: 'o8', orderNo: 'ORD20260407008', hotelName: '厦门鼓浪屿别墅', roomType: '蜜月圆床房', checkInDate: '2026-05-20', checkOutDate: '2026-05-22', guestName: '吴十', status: '已完成', claimedBy: 'op2', otaPlatform: 'Booking', otaOrderNo: 'BK20260407Z3', contactInfo: '13700003333', remark: '蜜月旅行', createdAt: '2026-04-07', amount: 3800, shopId: 'shop1', roomNights: 2 },
    { id: 'o9', orderNo: 'ORD20260408009', hotelName: '丽江古城花间堂', roomType: '标准大床房', checkInDate: '2026-04-28', checkOutDate: '2026-04-30', guestName: '郑十一', status: '待领取', createdAt: '2026-04-08', amount: 1280, shopId: 'shop3', roomNights: 2 },
    { id: 'o10', orderNo: 'ORD20260409010', hotelName: '广州文华东方', roomType: '豪华双床房', checkInDate: '2026-05-05', checkOutDate: '2026-05-07', guestName: '冯十二', status: '待领取', createdAt: '2026-04-09', amount: 4200, shopId: 'shop2', roomNights: 2 },
    { id: 'o11', orderNo: 'ORD20260410011', hotelName: '上海安缦养云', roomType: '景观大床房', checkInDate: '2026-05-15', checkOutDate: '2026-05-18', guestName: '陈十三', status: '已领取', claimedBy: 'op1', otaPlatform: '飞猪', otaOrderNo: 'FZ20260410A1', contactInfo: '13600004444', createdAt: '2026-04-10', amount: 12000, shopId: 'shop1', roomNights: 3 },
    { id: 'o12', orderNo: 'ORD20260411012', hotelName: '杭州灵隐安缦', roomType: '商务套房', checkInDate: '2026-06-01', checkOutDate: '2026-06-03', guestName: '林十四', status: '待领取', createdAt: '2026-04-11', amount: 7800, shopId: 'shop1', roomNights: 2 },
    { id: 'o13', orderNo: 'ORD20260412013', hotelName: '成都太古里亚朵', roomType: '标准大床房', checkInDate: '2026-04-20', checkOutDate: '2026-04-21', guestName: '何十五', status: '已完成', claimedBy: 'op3', otaPlatform: '携程', otaOrderNo: 'CT20260412B1', contactInfo: '13500005555', createdAt: '2026-04-12', amount: 680, shopId: 'shop3', roomNights: 1 },
    { id: 'o14', orderNo: 'ORD20260413014', hotelName: '深圳前海华侨城', roomType: '豪华双床房', checkInDate: '2026-04-25', checkOutDate: '2026-04-28', guestName: '吕十六', status: '已领取', claimedBy: 'op2', otaPlatform: '美团', otaOrderNo: 'MT20260413C2', contactInfo: '13400006666', createdAt: '2026-04-13', amount: 5400, shopId: 'shop2', roomNights: 3 },
    { id: 'o15', orderNo: 'ORD20260413015', hotelName: '北京王府半岛', roomType: '行政套房', checkInDate: '2026-05-01', checkOutDate: '2026-05-03', guestName: '施十七', status: '待领取', createdAt: '2026-04-13', amount: 9200, shopId: 'shop4', roomNights: 2 },
  ];
  return baseOrders;
}

export const mockOrders: Order[] = generateOrders();

// ---- Operators ----
export const mockOperators: Operator[] = [
  { id: 'op1', name: '王运营', ordersHandled: 45, avgProcessingMinutes: 12 },
  { id: 'op2', name: '李运营', ordersHandled: 38, avgProcessingMinutes: 15 },
  { id: 'op3', name: '张运营', ordersHandled: 29, avgProcessingMinutes: 18 },
  { id: 'op4', name: '赵运营', ordersHandled: 22, avgProcessingMinutes: 22 },
];

// ---- Dashboard Stats ----
export const mockDashboardStats: DashboardStats = {
  todayOrders: 18,
  todayOrdersChange: 12.5,
  totalOrders: 1256,
  totalOrdersChange: 6.2,
  totalRoomNights: 3842,
  totalRoomNightsChange: 9.1,
  totalUsers: 892,
  totalUsersChange: 3.8,
  totalRevenue: 2856000,
  revenueChange: 8.3,
};

// ---- Order trend data (last 14 days) ----
export const mockOrderTrend = [
  { date: '03-30', orders: 12, revenue: 18600 },
  { date: '03-31', orders: 15, revenue: 22400 },
  { date: '04-01', orders: 18, revenue: 28900 },
  { date: '04-02', orders: 14, revenue: 21200 },
  { date: '04-03', orders: 22, revenue: 35600 },
  { date: '04-04', orders: 19, revenue: 30100 },
  { date: '04-05', orders: 16, revenue: 24800 },
  { date: '04-06', orders: 25, revenue: 42000 },
  { date: '04-07', orders: 21, revenue: 33500 },
  { date: '04-08', orders: 17, revenue: 26700 },
  { date: '04-09', orders: 28, revenue: 45200 },
  { date: '04-10', orders: 20, revenue: 31800 },
  { date: '04-11', orders: 24, revenue: 38400 },
  { date: '04-12', orders: 19, revenue: 29600 },
];

// ---- Channel distribution ----
export const mockChannelDistribution = [
  { channel: '携程', orders: 320, percentage: 25.5 },
  { channel: '美团', orders: 280, percentage: 22.3 },
  { channel: 'Booking', orders: 180, percentage: 14.3 },
  { channel: '飞猪', orders: 160, percentage: 12.7 },
  { channel: '去哪儿', orders: 120, percentage: 9.6 },
  { channel: 'Agoda', orders: 96, percentage: 7.6 },
  { channel: '途家', orders: 60, percentage: 4.8 },
  { channel: '小红书', orders: 40, percentage: 3.2 },
];

// ---- City distribution ----
export const mockCityDistribution = [
  { city: '上海', orders: 280 },
  { city: '北京', orders: 240 },
  { city: '杭州', orders: 180 },
  { city: '成都', orders: 160 },
  { city: '深圳', orders: 140 },
  { city: '三亚', orders: 120 },
  { city: '广州', orders: 80 },
  { city: '厦门', orders: 56 },
];

// ---- Tag distribution ----
export const mockTagDistribution = [
  { tag: '商务', count: 380 },
  { tag: '精品', count: 280 },
  { tag: '度假', count: 220 },
  { tag: '连锁', count: 180 },
  { tag: '民宿', count: 96 },
  { tag: '网红', count: 52 },
  { tag: '亲子', count: 28 },
  { tag: '温泉', count: 20 },
];

// ---- Top hotels ----
export const mockTopHotels = [
  { name: '上海外滩璞丽酒店', orders: 86, revenue: 221880 },
  { name: '三亚亚特兰蒂斯', orders: 72, revenue: 640800 },
  { name: '杭州西湖柏悦', orders: 65, revenue: 208000 },
  { name: '北京瑰丽酒店', orders: 58, revenue: 324800 },
  { name: '上海安缦养云', orders: 45, revenue: 540000 },
];

// ---- Room type distribution ----
export const mockRoomTypeDistribution = [
  { roomType: '标准大床房', count: 420 },
  { roomType: '豪华双床房', count: 310 },
  { roomType: '商务套房', count: 220 },
  { roomType: '景观大床房', count: 160 },
  { roomType: '家庭亲子房', count: 86 },
  { roomType: '行政套房', count: 60 },
];

// ---- Booking time distribution ----
export const mockBookingTimeDistribution = [
  { hour: '00-02', count: 12 },
  { hour: '02-04', count: 5 },
  { hour: '04-06', count: 3 },
  { hour: '06-08', count: 18 },
  { hour: '08-10', count: 45 },
  { hour: '10-12', count: 82 },
  { hour: '12-14', count: 96 },
  { hour: '14-16', count: 78 },
  { hour: '16-18', count: 65 },
  { hour: '18-20', count: 88 },
  { hour: '20-22', count: 110 },
  { hour: '22-24', count: 54 },
];

// ---- Room night distribution ----
export const mockRoomNightDistribution = [
  { nights: '1晚', count: 380 },
  { nights: '2晚', count: 520 },
  { nights: '3晚', count: 240 },
  { nights: '4晚', count: 72 },
  { nights: '5晚+', count: 44 },
];

// ---- Channel account usage ----
export const mockChannelAccountUsage = [
  { account: 'CT_SHOP_001', channel: '携程', orders: 186, quota: 500 },
  { account: 'MT_SHOP_001', channel: '美团', orders: 142, quota: 400 },
  { account: 'BK_SHOP_002', channel: 'Booking', orders: 98, quota: 300 },
  { account: 'TJ_SHOP_003', channel: '途家', orders: 45, quota: 200 },
  { account: 'FZ_SHOP_001', channel: '飞猪', orders: 76, quota: 300 },
];
