import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Treemap, ReferenceDot, Label,
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
} from "@/lib/mock-data";

const CHART_COLORS = [
  "#4F6EF7", "#22C55E", "#F59E0B", "#A855F7",
  "#EF4444", "#06B6D4", "#EC4899", "#F97316",
];

const GRADIENT_COLORS = {
  blue: { start: "#4F6EF7", end: "#4F6EF720" },
  green: { start: "#22C55E", end: "#22C55E20" },
  purple: { start: "#A855F7", end: "#A855F720" },
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

// City map positions (approximate China map positions as percentages)
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  '上海': { x: 82, y: 48 },
  '北京': { x: 72, y: 28 },
  '杭州': { x: 80, y: 52 },
  '成都': { x: 52, y: 55 },
  '深圳': { x: 76, y: 72 },
  '三亚': { x: 68, y: 88 },
  '广州': { x: 74, y: 70 },
  '厦门': { x: 80, y: 64 },
  '大理': { x: 44, y: 65 },
  '丽江': { x: 42, y: 60 },
};

function CityMapChart({ data }: { data: { city: string; orders: number }[] }) {
  const maxOrders = Math.max(...data.map(d => d.orders));
  return (
    <div className="relative w-full h-[300px] bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-xl overflow-hidden border border-blue-100/50">
      {/* Simplified China outline shape */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="xMidYMid meet">
        <path d="M30,15 L45,10 L60,12 L75,15 L85,20 L88,30 L90,40 L88,50 L85,55 L90,60 L88,65 L82,70 L78,75 L72,80 L68,85 L65,90 L60,88 L55,82 L50,78 L45,75 L40,72 L35,68 L30,65 L28,58 L25,50 L22,45 L20,38 L22,30 L25,22 Z" fill="#4F6EF7" />
      </svg>
      
      {data.map((d) => {
        const pos = CITY_POSITIONS[d.city];
        if (!pos) return null;
        const size = 16 + (d.orders / maxOrders) * 40;
        const opacity = 0.3 + (d.orders / maxOrders) * 0.5;
        return (
          <div
            key={d.city}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Pulse ring */}
            <div
              className="absolute rounded-full animate-ping"
              style={{
                width: size * 0.7,
                height: size * 0.7,
                left: `calc(50% - ${size * 0.35}px)`,
                top: `calc(50% - ${size * 0.35}px)`,
                background: `rgba(79, 110, 247, ${opacity * 0.3})`,
              }}
            />
            {/* Bubble */}
            <div
              className="rounded-full flex items-center justify-center relative z-10 shadow-lg transition-transform group-hover:scale-125"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 35% 35%, rgba(79, 110, 247, ${opacity + 0.2}), rgba(79, 110, 247, ${opacity}))`,
                boxShadow: `0 0 ${size * 0.5}px rgba(79, 110, 247, ${opacity * 0.5})`,
              }}
            >
              <span className="text-[8px] font-bold text-white drop-shadow-sm">{d.orders}</span>
            </div>
            {/* Label */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
              <span className="text-[10px] font-semibold text-gray-600 bg-white/80 px-1.5 py-0.5 rounded-md shadow-sm">{d.city}</span>
            </div>
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
              <div className="bg-white rounded-lg shadow-xl border border-gray-100 px-3 py-2 whitespace-nowrap">
                <p className="text-xs font-semibold text-gray-800">{d.city}</p>
                <p className="text-[10px] text-gray-500">{d.orders} 订单</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Treemap custom content
function TreemapContent({ x, y, width, height, name, count, index }: any) {
  if (width < 30 || height < 25) return null;
  const color = CHART_COLORS[index % CHART_COLORS.length];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={color}
        fillOpacity={0.85}
        stroke="#fff"
        strokeWidth={2}
      />
      {width > 45 && height > 35 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={width > 80 ? 13 : 10}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="rgba(255,255,255,0.8)"
            fontSize={width > 80 ? 11 : 9}
          >
            {count}
          </text>
        </>
      )}
    </g>
  );
}

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [shopFilter, setShopFilter] = useState("all");
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
    name: d.tag,
    size: d.count,
    count: d.count,
    index: i,
  }));

  // Nightingale rose: need outerRadius per item — use Pie with varying outerRadius via custom shape
  const roseData = mockChannelDistribution.map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

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
        <div className="flex items-center gap-2">
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

      {/* Stat cards — ALL with 环比 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="今日订单" value={stats.todayOrders} change={stats.todayOrdersChange} icon={ShoppingCart} gradient="linear-gradient(135deg, #4F6EF7, #6C8CFF)" />
        <StatCard title="总订单数" value={stats.totalOrders} change={stats.totalOrdersChange} icon={Zap} gradient="linear-gradient(135deg, #06B6D4, #22D3EE)" />
        <StatCard title="总房晚数" value={stats.totalRoomNights} change={stats.totalRoomNightsChange} icon={Moon} gradient="linear-gradient(135deg, #A855F7, #C084FC)" />
        <StatCard title="总用户数" value={stats.totalUsers} change={stats.totalUsersChange} icon={Users} gradient="linear-gradient(135deg, #22C55E, #4ADE80)" />
        <StatCard title="总盈利" value={`¥${(stats.totalRevenue / 10000).toFixed(1)}万`} change={stats.revenueChange} icon={DollarSign} gradient="linear-gradient(135deg, #F59E0B, #FBBF24)" />
      </div>

      {/* Order trend — Area chart with gradient + max/min labels */}
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<TrendTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="orders" name="订单数" stroke={GRADIENT_COLORS.blue.start} strokeWidth={2.5} fill="url(#gradientOrders)" dot={false} activeDot={{ r: 5, fill: GRADIENT_COLORS.blue.start, stroke: "#fff", strokeWidth: 2 }} />
                <Area yAxisId="right" type="monotone" dataKey="revenue" name="收入(¥)" stroke={GRADIENT_COLORS.green.start} strokeWidth={2.5} fill="url(#gradientRevenue)" dot={false} activeDot={{ r: 5, fill: GRADIENT_COLORS.green.start, stroke: "#fff", strokeWidth: 2 }} />
                {/* Max value marker */}
                <ReferenceDot yAxisId="left" x={trendExtreme.maxItem.date} y={trendExtreme.maxVal} r={6} fill="#4F6EF7" stroke="#fff" strokeWidth={2}>
                  <Label value={`最高 ${trendExtreme.maxVal}`} position="top" fill="#4F6EF7" fontSize={11} fontWeight={600} offset={10} />
                </ReferenceDot>
                {/* Min value marker */}
                <ReferenceDot yAxisId="left" x={trendExtreme.minItem.date} y={trendExtreme.minVal} r={6} fill="#EF4444" stroke="#fff" strokeWidth={2}>
                  <Label value={`最低 ${trendExtreme.minVal}`} position="bottom" fill="#EF4444" fontSize={11} fontWeight={600} offset={10} />
                </ReferenceDot>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribution charts */}
      <div className="space-y-3">
        <SectionTitle icon={Star}>数据分布</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Channel distribution — Nightingale Rose */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">渠道分布</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">南丁格尔玫瑰图</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roseData}
                    dataKey="orders"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={120}
                    paddingAngle={2}
                    cornerRadius={4}
                    label={({ channel, percentage }) => `${channel} ${percentage}%`}
                    labelLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                  >
                    {roseData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tag distribution — Treemap */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">标签分布</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">矩形树图</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  nameKey="name"
                  aspectRatio={4 / 3}
                  content={<TreemapContent />}
                >
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

          {/* City distribution — Map */}
          <Card className="card-elevated border-border/60">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                城市分布
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">地图模式</Badge>
            </CardHeader>
            <CardContent>
              <CityMapChart data={mockCityDistribution} />
            </CardContent>
          </Card>

          {/* Room type distribution */}
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
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color}90, ${color})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Room nights — Radial bar */}
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

        {/* Booking time — Area with gradient */}
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
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}80, ${barColor})` }}
                      />
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
