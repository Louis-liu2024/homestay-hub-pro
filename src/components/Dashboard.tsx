import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Treemap, ReferenceDot, Label,
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingCart, Moon, Users, DollarSign, Activity,
  Trophy, Medal, Crown, Star, Zap, ArrowUpRight, MapPin,
} from "lucide-react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import chinaGeoData from "@/lib/china-geo.json";
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
  { icon: Crown, bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  { icon: Medal, bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" },
  { icon: Medal, bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200" },
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

// City coordinates for d3-geo projection
type GeoRing = [number, number][];

function getRingSignedArea(ring: GeoRing) {
  let area = 0;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[j];
    const [x2, y2] = ring[i];
    area += (x2 - x1) * (y2 + y1);
  }

  return area;
}

function normalizeGeoGeometryWinding(geometry: any) {
  if (!geometry) return geometry;

  const normalizePolygon = (polygon: GeoRing[]) => polygon.map((ring, index) => {
    const isClockwise = getRingSignedArea(ring) > 0;
    const shouldBeClockwise = index === 0;
    return isClockwise === shouldBeClockwise ? ring : [...ring].reverse();
  });

  if (geometry.type === "Polygon") {
    return {
      ...geometry,
      coordinates: normalizePolygon(geometry.coordinates),
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon: GeoRing[]) => normalizePolygon(polygon)),
    };
  }

  return geometry;
}

function normalizeFeatureCollectionWinding(collection: FeatureCollection) {
  return {
    ...collection,
    features: collection.features.map((feature) => ({
      ...feature,
      geometry: normalizeGeoGeometryWinding(feature.geometry),
    })),
  } as FeatureCollection;
}

const CITY_COORDS: Record<string, [number, number]> = {
  '上海': [121.47, 31.23],
  '北京': [116.41, 39.90],
  '杭州': [120.15, 30.28],
  '成都': [104.07, 30.57],
  '深圳': [114.07, 22.55],
  '三亚': [109.51, 18.25],
  '广州': [113.26, 23.13],
  '厦门': [118.10, 24.49],
  '大理': [100.23, 25.59],
  '丽江': [100.23, 26.87],
};

function ChinaMapChart({ data, hoveredCity, setHoveredCity }: {
  data: { city: string; orders: number }[];
  hoveredCity: string | null;
  setHoveredCity: (c: string | null) => void;
}) {
  const maxOrders = Math.max(...data.map(d => d.orders));
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  const mapWidth = 900;
  const mapHeight = 680;
  const geo = useMemo(
    () => normalizeFeatureCollectionWinding(chinaGeoData as unknown as FeatureCollection),
    [],
  );

  const projection = useMemo(() => {
    return geoMercator().fitExtent(
      [[28, 24], [mapWidth - 28, mapHeight - 24]],
      geo as any,
    );
  }, [geo]);

  const pathGen = useMemo(() => geoPath().projection(projection), [projection]);

  return (
    <Card className="card-elevated border-border/60">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          城市分布
        </CardTitle>
        <Badge variant="secondary" className="text-[10px] font-normal">中国地图</Badge>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-auto" style={{ maxHeight: 600 }}>
              <defs>
                <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.12" />
                </filter>
                <linearGradient id="mapFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e8edf5" />
                  <stop offset="100%" stopColor="#dce3f0" />
                </linearGradient>
                <radialGradient id="cityGlow">
                  <stop offset="0%" stopColor="#4F6EF7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#4F6EF7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Province paths */}
              {geo.features.map((feature, i) => {
                const d = pathGen(feature);
                if (!d) return null;
                const name = (feature.properties as any)?.name || '';
                return (
                  <path key={i} d={d} fill="url(#mapFill)" stroke="#b8c5db" strokeWidth={0.8}
                    className="transition-colors duration-200 hover:fill-[#d0d9ed]">
                    <title>{name}</title>
                  </path>
                );
              })}

              {/* Province labels */}
              {geo.features.map((feature, i) => {
                const name = (feature.properties as any)?.name || '';
                if (!name) return null;
                const centroid = pathGen.centroid(feature);
                if (!centroid || isNaN(centroid[0])) return null;
                const shortName = name.replace(/(省|市|自治区|壮族|回族|维吾尔|特别行政区)/g, '');
                return (
                  <text key={`lbl-${i}`} x={centroid[0]} y={centroid[1]}
                    textAnchor="middle" fill="#9ca3af" fontSize={9} fontWeight={400} pointerEvents="none">
                    {shortName}
                  </text>
                );
              })}

              {/* City data points */}
              {data.map((d) => {
                const coords = CITY_COORDS[d.city];
                if (!coords) return null;
                const projected = projection(coords);
                if (!projected) return null;
                const [cx, cy] = projected;
                const r = 8 + (d.orders / maxOrders) * 22;
                const isHovered = hoveredCity === d.city;
                const opacity = 0.5 + (d.orders / maxOrders) * 0.5;

                return (
                  <g key={d.city} onMouseEnter={() => setHoveredCity(d.city)} onMouseLeave={() => setHoveredCity(null)} className="cursor-pointer">
                    <circle cx={cx} cy={cy} r={r * 2} fill="url(#cityGlow)" opacity={0.4}>
                      <animate attributeName="r" from={r * 1.3} to={r * 2.2} dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={cx} cy={cy} r={isHovered ? r * 1.15 : r}
                      fill={`rgba(79,110,247,${opacity})`} stroke="rgba(255,255,255,0.9)" strokeWidth={2}
                      filter="url(#mapGlow)" style={{ transition: "all 0.2s ease" }} />
                    <circle cx={cx} cy={cy} r={r * 0.3} fill="white" opacity={0.7} />
                    <text x={cx} y={cy + r + 14} textAnchor="middle" fill="#374151" fontSize={11} fontWeight={600}>
                      {d.city}
                    </text>
                    {isHovered && (
                      <g>
                        <rect x={cx - 65} y={cy - r - 55} width={130} height={45} rx={10}
                          fill="white" stroke="#e5e7eb" strokeWidth={1} filter="url(#tooltipShadow)" />
                        <text x={cx} y={cy - r - 36} textAnchor="middle" fill="#1f2937" fontSize={13} fontWeight={700}>
                          {d.city}
                        </text>
                        <text x={cx} y={cy - r - 19} textAnchor="middle" fill="#6b7280" fontSize={11}>
                          {d.orders.toLocaleString()} 订单 · {((d.orders / totalOrders) * 100).toFixed(1)}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="w-48 flex-shrink-0 space-y-2 pt-4">
            <p className="text-xs font-semibold text-foreground mb-3">城市排行</p>
            {[...data].sort((a, b) => b.orders - a.orders).map((d, i) => {
              const pct = ((d.orders / totalOrders) * 100).toFixed(1);
              return (
                <div key={d.city}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg transition-colors cursor-pointer ${hoveredCity === d.city ? 'bg-primary/10 shadow-sm' : 'hover:bg-muted/50'}`}
                  onMouseEnter={() => setHoveredCity(d.city)}
                  onMouseLeave={() => setHoveredCity(null)}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: i < 3 ? CHART_COLORS[i] : '#94a3b8' }}>
                    {i + 1}
                  </div>
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

  const radialData = mockRoomNightDistribution.map((d, i) => ({
    ...d, fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const trendExtreme = useMemo(() => {
    const orders = mockOrderTrend.map(d => d.orders);
    const maxVal = Math.max(...orders);
    const minVal = Math.min(...orders);
    const maxItem = mockOrderTrend.find(d => d.orders === maxVal)!;
    const minItem = mockOrderTrend.find(d => d.orders === minVal)!;
    return { maxItem, minItem, maxVal, minVal };
  }, []);

  const treemapData = mockTagDistribution.map((d, i) => ({
    name: d.tag, size: d.count, count: d.count, index: i,
  }));

  const roseData = mockChannelDistribution.map((d, i) => ({
    ...d, fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const filteredCityData = useMemo(() => {
    if (provinceFilter === "all") return mockCityDistribution;
    return mockCityDistribution.filter(d => cityProvinceMap[d.city] === provinceFilter);
  }, [provinceFilter]);

  return (
    <div className="p-5 md:p-7 space-y-6 max-w-[1600px] mx-auto text-[13px]">
      {/* Filter bar */}
      <Card className="border-border/60 bg-card">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={shopFilter} onValueChange={setShopFilter}>
              <SelectTrigger className="w-36 h-8 text-[13px]">
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
              <SelectTrigger className="w-32 h-8 text-[13px]">
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
              <SelectTrigger className="w-28 h-8 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">今日</SelectItem>
                <SelectItem value="7d">近7天</SelectItem>
                <SelectItem value="30d">近30天</SelectItem>
                <SelectItem value="90d">近90天</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              实时数据
            </span>
          </div>
        </CardContent>
      </Card>

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

      {/* Distribution charts — ORDER: 渠道、房型、房晚、标签、下单时间段(full)、城市(full) */}
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

          {/* 4. 标签分布 — Treemap (swapped with 下单时间段) */}
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

        {/* 5. 下单时间段分析 — Full width */}
        <Card className="card-elevated border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">下单时间段分析</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
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
