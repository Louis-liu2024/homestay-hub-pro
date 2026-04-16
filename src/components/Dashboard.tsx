import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Treemap, ReferenceDot, Label, BarChart, Bar,
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingCart, Moon, Users, DollarSign, Activity,
  Trophy, Medal, Crown, Star, Zap, ArrowUpRight, MapPin,
} from "lucide-react";
import {
  mockDashboardStats, mockOrderTrend, mockChannelDistribution,
  mockCityDistribution, mockTagDistribution, mockTopHotels,
  mockRoomTypeDistribution, mockBookingTimeDistribution,
  mockRoomNightDistribution, mockOperators, mockChannelAccountUsage, mockShops,
  mockProvinces, cityProvinceMap,
} from "@/lib/mock-data";

const CHART_COLORS = [
  "#4F6EF7", "#22C55E", "#F59E0B", "#A855F7",
  "#EF4444", "#06B6D4", "#EC4899", "#F97316",
];

const GRADIENT_COLORS = {
  blue: { start: "#4F6EF7", end: "#4F6EF720" },
  green: { start: "#22C55E", end: "#22C55E20" },
  purple: { start: "#A855F7", end: "#A855F720" },
  orange: { start: "#F97316", end: "#F9731620" },
};

const chartTooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#1f2937",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    padding: "10px 14px",
  },
};

const axisStyle = { fontSize: 11, fill: "#9ca3af" };

function StatCard({ title, value, change, icon: Icon, gradient }: {
  title: string; value: number | string; change?: number; icon: React.ElementType;
  gradient: string;
}) {
  return (
    <Card className="card-elevated border-border/60 overflow-hidden relative group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground tracking-wide">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {change !== undefined && (
              <div className={`flex items-center text-xs font-semibold gap-1 ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                <div className={`flex items-center justify-center w-4 h-4 rounded-full ${change >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                  {change >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                </div>
                {change >= 0 ? "+" : ""}{change}%
                <span className="text-muted-foreground font-normal">环比</span>
              </div>
            )}
          </div>
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform"
            style={{ background: gradient }}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children, icon: Icon = Activity }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider flex items-center gap-2">
      <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
        <Icon className="h-3 w-3 text-primary" />
      </div>
      {children}
    </h3>
  );
}

const RANK_CONFIG = [
  { icon: Crown, bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", badge: "bg-gradient-to-r from-amber-400 to-amber-500" },
  { icon: Medal, bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", badge: "bg-gradient-to-r from-slate-300 to-slate-400" },
  { icon: Medal, bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200", badge: "bg-gradient-to-r from-orange-300 to-orange-400" },
];

function RankBadge({ index }: { index: number }) {
  if (index < 3) {
    const cfg = RANK_CONFIG[index];
    const RankIcon = cfg.icon;
    return (
      <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${cfg.bg} ${cfg.border} border`}>
        <RankIcon className={`h-3.5 w-3.5 ${cfg.text}`} />
      </div>
    );
  }
  return (
    <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-semibold">
      {index + 1}
    </div>
  );
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 min-w-[140px]">
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.stroke || p.color }} />
            <span className="text-gray-600">{p.name}</span>
          </div>
          <span className="font-semibold text-gray-900 font-mono">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// Full-screen China map with proper SVG outline
const CHINA_PATH = "M512,42 L530,38 548,45 575,40 598,48 620,42 645,55 668,48 690,58 718,52 742,62 768,55 790,68 812,62 835,75 858,68 880,82 902,78 925,90 948,85 970,98 988,92 1005,108 1020,102 1035,118 1048,112 1060,128 1070,125 1078,142 1085,138 1090,155 1095,152 1098,170 1100,168 1100,188 1098,192 1092,210 1088,218 1080,235 1075,242 1065,258 1058,268 1048,282 1040,290 1028,305 1018,312 1005,325 995,332 982,342 972,348 958,355 948,360 935,365 925,368 912,372 905,375 895,380 888,385 878,392 868,398 855,408 845,415 832,425 822,432 808,442 798,448 785,458 778,465 768,475 758,482 748,492 738,498 725,508 715,515 702,522 692,528 678,535 668,540 655,545 642,548 628,552 615,555 602,558 588,560 575,562 562,565 548,568 535,572 522,575 508,578 495,582 482,585 468,588 455,592 442,598 428,605 415,612 402,618 388,625 375,632 362,638 348,642 335,645 322,648 308,652 295,658 282,665 268,672 255,678 242,685 228,690 218,695 208,698 198,702 188,708 178,712 168,718 158,722 148,728 138,735 128,742 118,748 112,752 108,758 105,762 102,768 100,775 98,782 95,790 92,798 90,808 88,818 85,828 82,840 80,850 78,860 75,868 72,878 70,888 68,898 65,908 62,918 60,928 58,935 55,942 52,948 50,952 48,958 45,962 42,968 40,972 38,978 35,985 32,988 30,990 32,995 35,998 40,1000 48,1002 58,1005 68,1008 78,1010 90,1012 102,1015 115,1018 128,1020 142,1022 158,1022 172,1020 185,1018 198,1015 212,1012 225,1008 238,1005 252,1000 265,995 278,992 292,988 305,985 318,982 332,978 345,975 358,972 372,968 385,965 398,962 412,958 425,955 438,952 452,948 465,945 478,942 492,940 505,938 518,935 532,932 545,930 558,928 572,925 585,922 598,920 612,918 625,915 638,912 652,908 665,905 678,900 690,895 702,890 715,882 725,875 735,868 745,860 752,852 758,842 765,832 772,822 778,812 785,802 792,790 798,778 805,768 812,758 818,748 825,738 832,728 838,718 845,708 852,698 858,688 865,678 872,665 878,652 885,638 892,625 898,612 905,598 912,585 918,572 925,558 932,545 938,532 942,518 945,505 948,492 950,478 952,465 955,452 958,438 962,425 965,412 968,398 972,385 975,372 978,358 982,345 985,332 988,318 990,305 992,292 995,278 998,265 1000,252 1002,238 1005,225 1008,212 1010,198 1012,185 1015,172 1018,158 1020,142 1022,128 1022,115 1020,102 1018,90 1015,78 1012,68 1008,58 1005,48 1000,40 995,35 988,32 982,30 975,28 968,25 958,22 948,20 938,18 928,16 918,15 908,14 898,12 888,10 878,8 868,6 858,5 848,4 838,3 828,3 818,3 808,4 798,5 788,6 778,8 768,10 758,12 748,15 738,18 728,22 718,25 708,28 698,32 688,35 678,38 665,42 L652,45 638,48 625,50 612,48 598,45 585,42 575,42 Z";

// City positions on a more realistic China map (viewport 0-1200, 0-1100)
const CITY_MAP_POS: Record<string, { x: number; y: number; province: string }> = {
  '上海': { x: 920, y: 520, province: '上海' },
  '北京': { x: 780, y: 280, province: '北京' },
  '杭州': { x: 890, y: 560, province: '浙江' },
  '成都': { x: 540, y: 560, province: '四川' },
  '深圳': { x: 830, y: 740, province: '广东' },
  '三亚': { x: 720, y: 880, province: '海南' },
  '广州': { x: 800, y: 720, province: '广东' },
  '厦门': { x: 880, y: 670, province: '福建' },
  '大理': { x: 440, y: 650, province: '云南' },
  '丽江': { x: 420, y: 610, province: '云南' },
};

function ChinaMapChart({ data, hoveredCity, setHoveredCity }: {
  data: { city: string; orders: number }[];
  hoveredCity: string | null;
  setHoveredCity: (c: string | null) => void;
}) {
  const maxOrders = Math.max(...data.map(d => d.orders));
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <Card className="card-elevated border-border/60">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          城市分布
        </CardTitle>
        <Badge variant="secondary" className="text-[10px] font-normal">中国地图</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Map area */}
          <div className="flex-1 relative">
            <svg viewBox="0 0 1200 1100" className="w-full h-auto" style={{ maxHeight: 420 }}>
              {/* China outline */}
              <path
                d="M580,60 L620,55 660,65 700,58 740,72 770,65 800,80 830,75 860,92 885,88 910,105 930,100 948,118 960,115 975,132 985,128 992,148 998,145 1002,165 1005,162 1005,185 1002,195 995,215 988,228 978,248 968,262 955,278 942,292 928,308 912,322 895,338 878,352 858,365 838,378 818,392 798,408 778,425 758,438 738,452 718,468 698,482 678,498 658,512 638,525 618,538 598,548 578,558 555,568 532,578 508,585 485,592 462,598 438,608 415,618 392,632 368,648 345,662 322,672 302,678 282,688 262,698 242,712 225,725 208,738 195,748 185,758 178,768 172,778 168,790 165,802 162,818 158,838 155,858 152,878 148,900 145,918 142,935 138,948 135,958 132,965 128,972 125,978 122,982 118,988 115,992 112,995 118,998 128,1000 142,1002 160,1005 182,1008 208,1010 238,1012 272,1010 305,1005 338,998 372,988 405,975 435,962 465,948 495,935 525,925 555,918 585,912 615,908 645,902 672,895 698,888 722,878 742,865 758,852 772,838 785,822 798,805 808,788 818,770 828,752 838,732 848,712 858,692 868,672 878,650 888,628 898,605 908,582 918,558 928,535 935,512 940,488 945,465 948,442 950,418 952,395 955,372 958,348 960,325 962,302 965,278 968,255 970,232 972,208 975,185 978,162 980,142 982,122 985,105 988,90 990,78 992,68 990,58 985,50 978,42 968,35 955,28 940,22 922,18 902,15 882,12 862,10 842,9 822,8 802,8 782,10 762,12 742,16 722,22 702,28 682,35 662,42 642,50 622,55 605,58 Z"
                fill="#e8edf5"
                stroke="#c7d2e6"
                strokeWidth={2}
              />

              {/* Province boundaries hint */}
              <line x1="700" y1="200" x2="700" y2="500" stroke="#d5dce8" strokeWidth={0.5} strokeDasharray="4 4" />
              <line x1="500" y1="400" x2="900" y2="400" stroke="#d5dce8" strokeWidth={0.5} strokeDasharray="4 4" />

              {/* City bubbles */}
              {data.map((d) => {
                const pos = CITY_MAP_POS[d.city];
                if (!pos) return null;
                const r = 12 + (d.orders / maxOrders) * 28;
                const isHovered = hoveredCity === d.city;
                const opacity = 0.4 + (d.orders / maxOrders) * 0.5;
                return (
                  <g
                    key={d.city}
                    onMouseEnter={() => setHoveredCity(d.city)}
                    onMouseLeave={() => setHoveredCity(null)}
                    className="cursor-pointer"
                  >
                    {/* Pulse */}
                    <circle cx={pos.x} cy={pos.y} r={r * 1.6} fill={`rgba(79,110,247,${opacity * 0.15})`}>
                      <animate attributeName="r" from={r * 1.2} to={r * 1.8} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    {/* Main bubble */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isHovered ? r * 1.2 : r}
                      fill={`rgba(79,110,247,${opacity})`}
                      stroke="white"
                      strokeWidth={2}
                      style={{ transition: "r 0.2s" }}
                    />
                    {/* Label */}
                    <text x={pos.x} y={pos.y + r + 16} textAnchor="middle" fill="#6b7280" fontSize={11} fontWeight={500}>
                      {d.city}
                    </text>
                    {/* Hover tooltip */}
                    {isHovered && (
                      <g>
                        <rect x={pos.x - 55} y={pos.y - r - 48} width={110} height={38} rx={8} fill="white" stroke="#e5e7eb" strokeWidth={1} filter="url(#shadow)" />
                        <text x={pos.x} y={pos.y - r - 32} textAnchor="middle" fill="#1f2937" fontSize={12} fontWeight={600}>{d.city}</text>
                        <text x={pos.x} y={pos.y - r - 17} textAnchor="middle" fill="#6b7280" fontSize={10}>{d.orders} 订单 · {((d.orders / totalOrders) * 100).toFixed(1)}%</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Shadow filter */}
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
                </filter>
              </defs>
            </svg>
          </div>

          {/* Legend */}
          <div className="w-44 flex-shrink-0 space-y-2 pt-4">
            <p className="text-xs font-semibold text-foreground mb-3">城市排行</p>
            {[...data].sort((a, b) => b.orders - a.orders).map((d, i) => {
              const pct = ((d.orders / totalOrders) * 100).toFixed(1);
              return (
                <div
                  key={d.city}
                  className={`flex items-center gap-2 text-xs p-1.5 rounded-md transition-colors cursor-pointer ${hoveredCity === d.city ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                  onMouseEnter={() => setHoveredCity(d.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-muted-foreground flex-1">{d.city}</span>
                  <span className="font-semibold font-mono text-foreground">{d.orders}</span>
                  <span className="text-muted-foreground text-[10px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Treemap custom content
function TreemapContent({ x, y, width, height, name, count, index }: any) {
  if (width < 30 || height < 25) return null;
  const color = CHART_COLORS[index % CHART_COLORS.length];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={color} fillOpacity={0.85} stroke="#fff" strokeWidth={2} />
      {width > 45 && height > 35 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={width > 80 ? 13 : 10} fontWeight={600}>{name}</text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={width > 80 ? 11 : 9}>{count}</text>
        </>
      )}
    </g>
  );
}

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [shopFilter, setShopFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const stats = mockDashboardStats;

  // Transform room night data for radial bar
  const radialData = mockRoomNightDistribution.map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Find max/min for trend chart
  const trendExtreme = useMemo(() => {
    const orders = mockOrderTrend.map(d => d.orders);
    const maxVal = Math.max(...orders);
    const minVal = Math.min(...orders);
    const maxItem = mockOrderTrend.find(d => d.orders === maxVal)!;
    const minItem = mockOrderTrend.find(d => d.orders === minVal)!;
    return { maxItem, minItem, maxVal, minVal };
  }, []);

  // Treemap data for tags
  const treemapData = mockTagDistribution.map((d, i) => ({
    name: d.tag, size: d.count, count: d.count, index: i,
  }));

  // Nightingale rose data
  const roseData = mockChannelDistribution.map((d, i) => ({
    ...d, fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Filter city data by province
  const filteredCityData = useMemo(() => {
    if (provinceFilter === "all") return mockCityDistribution;
    return mockCityDistribution.filter(d => cityProvinceMap[d.city] === provinceFilter);
  }, [provinceFilter]);

  return (
    <div className="p-5 md:p-7 space-y-7 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            数据大盘
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              实时
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">全面监控运营核心数据指标</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={shopFilter} onValueChange={setShopFilter}>
            <SelectTrigger className="w-36 h-8 text-xs bg-white border-border/70 shadow-sm">
              <SelectValue placeholder="全部店铺" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部店铺</SelectItem>
              {mockShops.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={provinceFilter} onValueChange={setProvinceFilter}>
            <SelectTrigger className="w-28 h-8 text-xs bg-white border-border/70 shadow-sm">
              <SelectValue placeholder="全部省份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部省份</SelectItem>
              {mockProvinces.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 h-8 text-xs bg-white border-border/70 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今日</SelectItem>
              <SelectItem value="7d">近7天</SelectItem>
              <SelectItem value="30d">近30天</SelectItem>
              <SelectItem value="90d">近90天</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="今日订单" value={stats.todayOrders} change={stats.todayOrdersChange} icon={ShoppingCart} gradient="linear-gradient(135deg, #4F6EF7, #6C8CFF)" />
        <StatCard title="总订单数" value={stats.totalOrders} change={stats.totalOrdersChange} icon={Zap} gradient="linear-gradient(135deg, #06B6D4, #22D3EE)" />
        <StatCard title="总房晚数" value={stats.totalRoomNights} change={stats.totalRoomNightsChange} icon={Moon} gradient="linear-gradient(135deg, #A855F7, #C084FC)" />
        <StatCard title="总用户数" value={stats.totalUsers} change={stats.totalUsersChange} icon={Users} gradient="linear-gradient(135deg, #22C55E, #4ADE80)" />
        <StatCard title="总盈利" value={`¥${(stats.totalRevenue / 10000).toFixed(1)}万`} change={stats.revenueChange} icon={DollarSign} gradient="linear-gradient(135deg, #F59E0B, #FBBF24)" />
      </div>

      {/* Order + Check-in trend */}
      <div className="space-y-3">
        <SectionTitle icon={TrendingUp}>订单趋势</SectionTitle>
        <Card className="card-elevated border-border/60">
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={mockOrderTrend}>
                <defs>
                  <linearGradient id="gradientOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GRADIENT_COLORS.blue.start} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={GRADIENT_COLORS.blue.end} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GRADIENT_COLORS.green.start} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={GRADIENT_COLORS.green.end} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientCheckIns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GRADIENT_COLORS.orange.start} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={GRADIENT_COLORS.orange.end} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<TrendTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="orders" name="订单数" stroke={GRADIENT_COLORS.blue.start} strokeWidth={2.5} fill="url(#gradientOrders)" dot={false} activeDot={{ r: 5, fill: GRADIENT_COLORS.blue.start, stroke: "#fff", strokeWidth: 2 }} />
                <Area yAxisId="left" type="monotone" dataKey="checkIns" name="入住数" stroke={GRADIENT_COLORS.orange.start} strokeWidth={2.5} fill="url(#gradientCheckIns)" dot={false} activeDot={{ r: 5, fill: GRADIENT_COLORS.orange.start, stroke: "#fff", strokeWidth: 2 }} />
                <Area yAxisId="right" type="monotone" dataKey="revenue" name="收入(¥)" stroke={GRADIENT_COLORS.green.start} strokeWidth={2.5} fill="url(#gradientRevenue)" dot={false} activeDot={{ r: 5, fill: GRADIENT_COLORS.green.start, stroke: "#fff", strokeWidth: 2 }} />
                <ReferenceDot yAxisId="left" x={trendExtreme.maxItem.date} y={trendExtreme.maxVal} r={6} fill="#4F6EF7" stroke="#fff" strokeWidth={2}>
                  <Label value={`最高 ${trendExtreme.maxVal}`} position="top" fill="#4F6EF7" fontSize={11} fontWeight={600} offset={10} />
                </ReferenceDot>
                <ReferenceDot yAxisId="left" x={trendExtreme.minItem.date} y={trendExtreme.minVal} r={6} fill="#EF4444" stroke="#fff" strokeWidth={2}>
                  <Label value={`最低 ${trendExtreme.minVal}`} position="bottom" fill="#EF4444" fontSize={11} fontWeight={600} offset={10} />
                </ReferenceDot>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribution charts — ORDER: 渠道、房型、房晚、下单时间、标签、城市 */}
      <div className="space-y-3">
        <SectionTitle icon={Star}>数据分布</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* 1. 渠道分布 — Nightingale Rose */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">渠道分布</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">南丁格尔玫瑰图</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={roseData} dataKey="orders" nameKey="channel" cx="50%" cy="50%" innerRadius={30} outerRadius={120} paddingAngle={2} cornerRadius={4} label={({ channel, percentage }) => `${channel} ${percentage}%`} labelLine={{ stroke: "#d1d5db", strokeWidth: 1 }}>
                    {roseData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 2. 房型分布 */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">房型分布</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRoomTypeDistribution.map((d, i) => {
                  const maxCount = Math.max(...mockRoomTypeDistribution.map(r => r.count));
                  const pct = Math.round((d.count / maxCount) * 100);
                  const color = CHART_COLORS[i % CHART_COLORS.length];
                  return (
                    <div key={d.roomType} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{d.roomType}</span>
                        <span className="font-semibold font-mono text-gray-800">{d.count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}90, ${color})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 3. 房晚分布 — Radial bar */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">房晚分布</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ResponsiveContainer width="55%" height={260}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" data={radialData} startAngle={180} endAngle={-180}>
                    <RadialBar background={{ fill: "#f3f4f6" }} dataKey="count" cornerRadius={6} />
                    <Tooltip {...chartTooltipStyle} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 pl-2">
                  {mockRoomNightDistribution.map((d, i) => (
                    <div key={d.nights} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-muted-foreground flex-1">{d.nights}</span>
                      <span className="font-semibold font-mono text-foreground">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. 下单时间段分析 */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">下单时间段分析</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={mockBookingTimeDistribution}>
                  <defs>
                    <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ ...axisStyle, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<TrendTooltip />} />
                  <Area type="monotone" dataKey="count" name="订单数" stroke="#A855F7" strokeWidth={2.5} fill="url(#timeGrad)" dot={false} activeDot={{ r: 5, fill: "#A855F7", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 5. 标签分布 — Treemap */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">标签分布</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">矩形树图</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <Treemap data={treemapData} dataKey="size" nameKey="name" aspectRatio={4 / 3} content={<TreemapContent />}>
                  <Tooltip
                    content={({ payload }: any) => {
                      if (!payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3">
                          <p className="text-xs font-semibold text-gray-800">{d?.name}</p>
                          <p className="text-[10px] text-gray-500">数量: {d?.count}</p>
                        </div>
                      );
                    }}
                  />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 6. 城市分布 — Full-width China map */}
        <ChinaMapChart data={filteredCityData} hoveredCity={hoveredCity} setHoveredCity={setHoveredCity} />
      </div>

      {/* Rankings */}
      <div className="space-y-3">
        <SectionTitle icon={Trophy}>排行榜</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Hotels */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Top 酒店</CardTitle>
                <p className="text-[10px] text-muted-foreground">按订单量排名</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {mockTopHotels.map((h, i) => (
                <div key={h.name} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${i < 3 ? "bg-muted/50" : "hover:bg-muted/30"}`}>
                  <RankBadge index={i} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-foreground">{h.name}</p>
                    <p className="text-[10px] text-muted-foreground">{h.orders} 订单</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold font-mono text-foreground">¥{h.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 justify-end">
                      <ArrowUpRight className="h-2.5 w-2.5" />
                      <span>12%</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Operators */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">运营人员排名</CardTitle>
                <p className="text-[10px] text-muted-foreground">按处理效率排名</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {mockOperators.map((op, i) => (
                <div key={op.id} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${i < 3 ? "bg-muted/50" : "hover:bg-muted/30"}`}>
                  <RankBadge index={i} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{op.name}</p>
                    <p className="text-[10px] text-muted-foreground">处理 {op.ordersHandled} 单</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold font-mono text-foreground">{op.avgProcessingMinutes}min</p>
                    <p className="text-[10px] text-muted-foreground">平均用时</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Channel account usage */}
      <Card className="card-elevated border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center">
            <Activity className="h-4 w-4 text-cyan-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">渠道账号使用量</CardTitle>
            <p className="text-[10px] text-muted-foreground">各渠道账号的配额使用情况</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockChannelAccountUsage.map((a) => {
              const pct = Math.round((a.orders / a.quota) * 100);
              const barColor = pct > 80 ? "#EF4444" : pct > 50 ? "#F59E0B" : "#22C55E";
              return (
                <div key={a.account} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-[120px]">
                    <p className="font-mono text-[11px] font-medium text-foreground truncate">{a.account}</p>
                    <Badge variant="secondary" className="text-[9px] h-4 mt-0.5">{a.channel}</Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">{a.orders} / {a.quota}</span>
                      <span className="text-[10px] font-semibold font-mono" style={{ color: barColor }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}80, ${barColor})` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
