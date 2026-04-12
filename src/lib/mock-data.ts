import type { Hotel, Room, PriceRule, Order, Channel, HotelTag } from './types';

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

const hotelNames = [
  '上海外滩璞丽酒店', '北京瑰丽酒店', '杭州西湖柏悦', '成都博舍', '深圳湾万豪',
  '广州文华东方', '三亚亚特兰蒂斯', '大理洱海天域', '丽江古城花间堂', '厦门鼓浪屿别墅',
  '上海安缦养云', '北京王府半岛', '杭州湖滨28', '成都太古里亚朵', '深圳前海华侨城',
  '广州W酒店', '三亚海棠湾仁恒', '大理苍山隐居', '丽江束河悦榕庄', '厦门海沧温泉',
  '上海静安香格里拉', '北京三里屯通盈', '杭州灵隐安缦', '成都春熙路全季',
];

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
  };
});

export const mockPriceRules: PriceRule[] = [
  { id: 'pr1', tag: '精品', brand: '全部', startDate: '2026-04-01', endDate: '2026-04-30', markupPercent: 15 },
  { id: 'pr2', tag: '度假', brand: '全部', startDate: '2026-07-01', endDate: '2026-08-31', markupPercent: 30 },
  { id: 'pr3', tag: '全部', brand: '亚朵', startDate: '2026-05-01', endDate: '2026-05-05', markupPercent: 20 },
  { id: 'pr4', tag: '商务', brand: '如家', startDate: '2026-04-15', endDate: '2026-06-15', markupPercent: 10 },
  { id: 'pr5', tag: '温泉', brand: '全部', startDate: '2026-12-01', endDate: '2027-02-28', markupPercent: 25 },
];

export const mockOrders: Order[] = [
  { id: 'o1', orderNo: 'ORD20260401001', hotelName: '上海外滩璞丽酒店', roomType: '豪华双床房', checkInDate: '2026-04-15', checkOutDate: '2026-04-17', guestName: '张三', status: '待领取', createdAt: '2026-04-01', amount: 2580 },
  { id: 'o2', orderNo: 'ORD20260401002', hotelName: '杭州西湖柏悦', roomType: '景观大床房', checkInDate: '2026-04-20', checkOutDate: '2026-04-22', guestName: '李四', status: '待领取', createdAt: '2026-04-02', amount: 3200 },
  { id: 'o3', orderNo: 'ORD20260402003', hotelName: '三亚亚特兰蒂斯', roomType: '家庭亲子房', checkInDate: '2026-05-01', checkOutDate: '2026-05-04', guestName: '王五', status: '已领取', claimedBy: 'operator1', otaPlatform: '携程', otaOrderNo: 'CT20260402X1', contactInfo: '13800001111', createdAt: '2026-04-02', amount: 8900 },
  { id: 'o4', orderNo: 'ORD20260403004', hotelName: '成都博舍', roomType: '商务套房', checkInDate: '2026-04-18', checkOutDate: '2026-04-19', guestName: '赵六', status: '已完成', claimedBy: 'operator2', otaPlatform: '美团', otaOrderNo: 'MT20260403Y2', contactInfo: '13900002222', remark: '客人要求高楼层', createdAt: '2026-04-03', amount: 1680 },
  { id: 'o5', orderNo: 'ORD20260404005', hotelName: '深圳湾万豪', roomType: '标准大床房', checkInDate: '2026-04-25', checkOutDate: '2026-04-27', guestName: '钱七', status: '待领取', createdAt: '2026-04-04', amount: 1990 },
  { id: 'o6', orderNo: 'ORD20260405006', hotelName: '大理洱海天域', roomType: '景观大床房', checkInDate: '2026-05-10', checkOutDate: '2026-05-13', guestName: '孙八', status: '待领取', createdAt: '2026-04-05', amount: 4500 },
  { id: 'o7', orderNo: 'ORD20260406007', hotelName: '北京瑰丽酒店', roomType: '行政套房', checkInDate: '2026-04-22', checkOutDate: '2026-04-24', guestName: '周九', status: '已领取', claimedBy: 'operator1', createdAt: '2026-04-06', amount: 5600 },
  { id: 'o8', orderNo: 'ORD20260407008', hotelName: '厦门鼓浪屿别墅', roomType: '蜜月圆床房', checkInDate: '2026-05-20', checkOutDate: '2026-05-22', guestName: '吴十', status: '已完成', claimedBy: 'operator2', otaPlatform: 'Booking', otaOrderNo: 'BK20260407Z3', contactInfo: '13700003333', remark: '蜜月旅行', createdAt: '2026-04-07', amount: 3800 },
  { id: 'o9', orderNo: 'ORD20260408009', hotelName: '丽江古城花间堂', roomType: '标准大床房', checkInDate: '2026-04-28', checkOutDate: '2026-04-30', guestName: '郑十一', status: '待领取', createdAt: '2026-04-08', amount: 1280 },
  { id: 'o10', orderNo: 'ORD20260409010', hotelName: '广州文华东方', roomType: '豪华双床房', checkInDate: '2026-05-05', checkOutDate: '2026-05-07', guestName: '冯十二', status: '待领取', createdAt: '2026-04-09', amount: 4200 },
  { id: 'o11', orderNo: 'ORD20260410011', hotelName: '上海安缦养云', roomType: '景观大床房', checkInDate: '2026-05-15', checkOutDate: '2026-05-18', guestName: '陈十三', status: '已领取', claimedBy: 'operator1', otaPlatform: '飞猪', otaOrderNo: 'FZ20260410A1', contactInfo: '13600004444', createdAt: '2026-04-10', amount: 12000 },
  { id: 'o12', orderNo: 'ORD20260411012', hotelName: '杭州灵隐安缦', roomType: '商务套房', checkInDate: '2026-06-01', checkOutDate: '2026-06-03', guestName: '林十四', status: '待领取', createdAt: '2026-04-11', amount: 7800 },
];
