import { useMemo, useState } from "react";
import { mockHotels } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Upload, Bell, MapPin, Phone, Star, Tag,
  Wifi, Bath, Sun, Coffee, Users, Maximize, Building2, Calendar, Clock,
  LayoutGrid, List as ListIcon, Info, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { PriceQueryDialog } from "@/components/PriceQueryDialog";
import { PublishDialog } from "@/components/PublishDialog";
import { facilityIcon } from "@/lib/facility-icons";
import type { Hotel, Room } from "@/lib/types";

type RoomView = "card" | "list";

export function HotelDetail({ hotelId }: { hotelId: string }) {
  const hotel = mockHotels.find((h) => h.id === hotelId);
  const [priceOpen, setPriceOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [roomView, setRoomView] = useState<RoomView>("card");
  const [priceQueryRoomIds, setPriceQueryRoomIds] = useState<string[] | undefined>(undefined);
  const [publishRoomIds, setPublishRoomIds] = useState<string[] | undefined>(undefined);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  if (!hotel) {
    return (
      <div className="p-7 text-center">
        <p className="text-muted-foreground">酒店未找到</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/data-pool">返回列表</Link>
        </Button>
      </div>
    );
  }

  const images = hotel.images ?? [];

  const openPriceQuery = (roomIds?: string[]) => {
    setPriceQueryRoomIds(roomIds);
    setPriceOpen(true);
  };

  const openPublish = (roomIds?: string[]) => {
    setPublishRoomIds(roomIds);
    setPublishOpen(true);
  };

  return (
    <div className="p-5 md:p-7 space-y-5 text-[13px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Link to="/data-pool">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-foreground truncate">{hotel.name}</h2>
            <div className="flex items-center gap-3 mt-0.5 text-[12px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-warning" />{hotel.rating}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />{hotel.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />{hotel.contactPhone}
              </span>
              <Badge variant="outline" className="text-[11px] h-5 border-border/60">{hotel.channel}</Badge>
              {hotel.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[11px] h-5 bg-primary/10 text-primary border-0">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8" onClick={() => openPriceQuery()}>
            <Tag className="h-3.5 w-3.5 mr-1" />查价
          </Button>
          <Button size="sm" className="h-8" onClick={() => openPublish()}>
            <Upload className="h-3.5 w-3.5 mr-1" />发布
          </Button>
        </div>
      </div>

      {/* Gallery (smaller) + Info+Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border/50">
            {images[activeImage] ? (
              <img src={images[activeImage]} alt={hotel.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">暂无图片</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((src, idx) => (
                <button
                  key={src + idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                    idx === activeImage ? "border-primary" : "border-border/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card className="border-border/60 bg-card h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[13px] font-semibold">酒店信息</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[12px] text-primary hover:text-primary"
                onClick={() => setMoreInfoOpen(true)}
              >
                <Info className="h-3.5 w-3.5 mr-1" />更多信息
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <InfoLine icon={<Building2 className="h-3.5 w-3.5" />} label="品牌" value={hotel.brand} />
                <InfoLine icon={<Star className="h-3.5 w-3.5" />} label="评分" value={String(hotel.rating)} />
                <InfoLine icon={<Calendar className="h-3.5 w-3.5" />} label="开业年份" value={String(hotel.openYear ?? "—")} />
                <InfoLine icon={<Clock className="h-3.5 w-3.5" />} label="入住 / 离店" value={`${hotel.checkInTime ?? "—"} / ${hotel.checkOutTime ?? "—"}`} />
                <InfoLine icon={<Users className="h-3.5 w-3.5" />} label="房间数" value={String(hotel.roomCount)} />
                <InfoLine
                  icon={<Tag className="h-3.5 w-3.5" />}
                  label="7天空房率"
                  value={`${(hotel.vacancyRate7d * 100).toFixed(0)}%`}
                  highlight={hotel.vacancyRate7d > 0.5}
                />
              </div>

              {hotel.description && (
                <div className="pt-3 border-t border-border/40">
                  <div className="text-[12px] text-muted-foreground mb-1.5">酒店简介</div>
                  <p className="text-[12.5px] text-foreground leading-relaxed">{hotel.description}</p>
                </div>
              )}

              {hotel.facilities && hotel.facilities.length > 0 && (
                <div className="pt-3 border-t border-border/40">
                  <div className="text-[12px] text-muted-foreground mb-2">基础设施</div>
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.facilities.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 text-[12px] h-6 px-2 rounded border border-border/60 bg-muted/30 text-foreground"
                      >
                        {facilityIcon(f)}
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rooms with view toggle */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-[13px] font-semibold">房型列表</CardTitle>
          <ToggleGroup type="single" value={roomView} onValueChange={(v) => v && setRoomView(v as RoomView)} className="bg-muted/40 rounded-md p-0.5">
            <ToggleGroupItem value="card" className="h-7 px-2 text-[12px] data-[state=on]:bg-card data-[state=on]:text-primary">
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />卡片
            </ToggleGroupItem>
            <ToggleGroupItem value="list" className="h-7 px-2 text-[12px] data-[state=on]:bg-card data-[state=on]:text-primary">
              <ListIcon className="h-3.5 w-3.5 mr-1" />列表
            </ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent>
          {roomView === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {hotel.rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onOpenDetail={() => setActiveRoom(room)}
                  onQueryPrice={() => openPriceQuery([room.id])}
                  onPublish={() => openPublish([room.id])}
                />
              ))}
            </div>
          ) : (
            <RoomTable
              rooms={hotel.rooms}
              onOpenDetail={(room) => setActiveRoom(room)}
              onQueryPrice={(id) => openPriceQuery([id])}
              onPublish={(id) => openPublish([id])}
            />
          )}
        </CardContent>
      </Card>

      <PriceQueryDialog
        hotel={hotel}
        open={priceOpen}
        onOpenChange={setPriceOpen}
        roomFilterIds={priceQueryRoomIds}
      />
      <PublishDialog
        hotel={hotel}
        open={publishOpen}
        onOpenChange={setPublishOpen}
        preselectedRoomIds={publishRoomIds}
      />
      <MoreInfoSheet hotel={hotel} open={moreInfoOpen} onOpenChange={setMoreInfoOpen} />
      <RoomDetailSheet
        hotel={hotel}
        room={activeRoom}
        open={!!activeRoom}
        onOpenChange={(o) => !o && setActiveRoom(null)}
      />
    </div>
  );
}

function MoreInfoSheet({ hotel, open, onOpenChange }: { hotel: Hotel; open: boolean; onOpenChange: (o: boolean) => void }) {
  const fields: Array<{ label: string; value: React.ReactNode }> = [
    { label: "酒店ID", value: hotel.hotelExternalId ?? "—" },
    { label: "内部ID", value: hotel.internalId ?? "—" },
    { label: "酒店名称", value: hotel.name },
    { label: "城市", value: hotel.city },
    { label: "城市ID", value: hotel.cityId ?? "—" },
    { label: "省份ID", value: hotel.provinceId ?? "—" },
    { label: "省份名称", value: hotel.provinceName ?? "—" },
    { label: "国家ID", value: hotel.countryId ?? "—" },
    { label: "国家名称", value: hotel.countryName ?? "—" },
    { label: "国家名称(英文)", value: hotel.countryNameEn ?? "—" },
    { label: "国家类型", value: hotel.countryType ?? "—" },
    { label: "区域ID", value: hotel.regionId ?? "—" },
    { label: "地址", value: hotel.address },
    { label: "位置地址", value: hotel.locationAddress ?? "—" },
    { label: "经度", value: hotel.longitude ?? "—" },
    { label: "纬度", value: hotel.latitude ?? "—" },
    {
      label: "星级",
      value: (
        <span className="inline-flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < (hotel.starLevel ?? 0) ? "text-warning fill-warning" : "text-muted-foreground/40"}`} />
          ))}
          <span className="text-muted-foreground ml-1">{hotel.starLevel ?? 0}</span>
        </span>
      ),
    },
    { label: "评分", value: <span className="text-destructive font-semibold">{hotel.rating}</span> },
    {
      label: "评价描述",
      value: hotel.ratingDesc ? (
        <Badge variant="secondary" className="text-[11px] h-5 bg-primary/10 text-primary border-0">{hotel.ratingDesc}</Badge>
      ) : "—",
    },
    { label: "评论数", value: hotel.reviewCount?.toLocaleString() ?? "—" },
    { label: "总数量", value: hotel.totalCount?.toLocaleString() ?? "—" },
    { label: "奖牌类型", value: hotel.medalType ?? "—" },
    {
      label: "奖牌名称",
      value: hotel.medalName ? (
        <Badge variant="outline" className="text-[11px] h-5 border-border/60 bg-muted/40">{hotel.medalName}</Badge>
      ) : "—",
    },
    { label: "电话", value: hotel.contactPhone },
    { label: "邮箱", value: hotel.email ?? "—" },
    { label: "前台营业时间", value: hotel.frontDeskHours ?? "—" },
    { label: "入住退房时间", value: `入住时间：${hotel.checkInTime ?? "—"}后 -> 退房时间：${hotel.checkOutTime ?? "—"}前` },
    { label: "宠物政策", value: hotel.petPolicy ?? "—" },
    { label: "开业年份", value: hotel.openYear ? `${hotel.openYear}年` : "—" },
    { label: "房间总数", value: `${hotel.roomCount}间` },
    { label: "目的地名称", value: hotel.destinationName ?? "—" },
    { label: "目的地名称(英文)", value: hotel.destinationNameEn ?? "—" },
    { label: "时区偏移", value: hotel.timezoneOffset ?? "—" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border/60">
          <SheetTitle className="text-[14px] font-semibold">更多信息 — {hotel.name}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 border-t border-border/40">
            {fields.map((f, idx) => (
              <div
                key={f.label}
                className={`flex items-start border-b border-border/40 ${idx % 2 === 0 ? "border-r border-border/40" : ""}`}
              >
                <div className="w-[110px] shrink-0 px-3 py-2.5 bg-muted/30 text-[12px] text-muted-foreground">
                  {f.label}
                </div>
                <div className="flex-1 px-3 py-2.5 text-[13px] text-foreground break-all">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RoomDetailSheet({
  hotel,
  room,
  open,
  onOpenChange,
}: {
  hotel: Hotel;
  room: Room | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!room) return null;

  const basicFields: Array<{ label: string; value: React.ReactNode }> = [
    { label: "酒店ID", value: hotel.hotelExternalId ?? "—" },
    { label: "房型ID", value: room.roomExternalId ?? "—" },
    { label: "房型名称", value: room.name },
    { label: "子房型名称", value: room.subRoomTypeName ?? "—" },
    { label: "子房型ID", value: room.subRoomTypeId ?? "—" },
    { label: "床型", value: room.bedType },
    { label: "房间面积", value: `${room.area}㎡` },
    { label: "楼层", value: room.floor },
    { label: "窗户", value: room.hasWindow ? "有窗" : "无窗" },
    { label: "窗户类型", value: room.windowType ?? "—" },
    { label: "可入住人数", value: `${room.maxGuests}人` },
    {
      label: "早餐",
      value: (
        <Badge variant="secondary" className="text-[11px] h-5 bg-success/10 text-success border-0">
          {room.breakfast === "含早" ? "含早2份" : room.breakfast}
        </Badge>
      ),
    },
    { label: "价格", value: room.price > 0 ? `¥${room.price}` : "—" },
    {
      label: "库存",
      value: (
        <Badge variant="secondary" className="text-[11px] h-5 bg-success/10 text-success border-0">
          {room.stock ?? "—"}
        </Badge>
      ),
    },
    { label: "最小订购量", value: room.minOrderQty ?? 1 },
    { label: "最大订购量", value: room.maxOrderQty ?? "—" },
    {
      label: "取消政策",
      value: room.cancelPolicyName ? (
        <Badge variant="secondary" className="text-[11px] h-5 bg-warning/15 text-warning border-0">{room.cancelPolicyName}</Badge>
      ) : "—",
    },
    { label: "取消类型", value: room.cancelType ?? "—" },
    { label: "提前取消时间", value: room.preCancelTime ?? "—" },
    {
      label: "支付方式",
      value: room.paymentMethod ? (
        <Badge variant="secondary" className="text-[11px] h-5 bg-success/10 text-success border-0">{room.paymentMethod}</Badge>
      ) : "—",
    },
    { label: "创建时间", value: room.createdAt ?? "—" },
    {
      label: "设施标签",
      value: (
        <div className="flex flex-wrap gap-1.5">
          {(room.facilityTags ?? []).map((t) => (
            <Badge key={t} variant="secondary" className="text-[11px] h-5 bg-primary/10 text-primary border-0">{t}</Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border/60">
          <SheetTitle className="text-[14px] font-semibold">房型详情 — {room.name}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="basic" className="w-full">
            <div className="px-5 pt-3">
              <TabsList>
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="facilities">基础设施</TabsTrigger>
                <TabsTrigger value="calendar">价格日历</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="basic" className="mt-3 px-0">
              <div className="grid grid-cols-2 border-t border-border/40">
                {basicFields.map((f, idx) => (
                  <div
                    key={f.label}
                    className={`flex items-start border-b border-border/40 ${idx % 2 === 0 ? "border-r border-border/40" : ""} ${
                      f.label === "设施标签" ? "col-span-2 border-r-0" : ""
                    }`}
                  >
                    <div className="w-[110px] shrink-0 px-3 py-2.5 bg-muted/30 text-[12px] text-muted-foreground text-left">
                      {f.label}
                    </div>
                    <div className="flex-1 px-3 py-2.5 text-[13px] text-foreground break-all text-left">
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="facilities" className="mt-3 px-5 pb-6">
              <div className="space-y-5 text-left">
                {(room.facilityGroups ?? []).map((group) => (
                  <div key={group.name}>
                    <div className="text-[13px] font-semibold text-primary border-b border-border/40 pb-1.5 mb-2.5 text-left">
                      {group.name}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1 text-[12px] h-6 px-2 rounded border border-border/60 bg-muted/30 text-foreground"
                        >
                          {facilityIcon(item)}
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {(!room.facilityGroups || room.facilityGroups.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">暂无设施信息</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-3 px-5 pb-6">
              <PriceCalendar room={room} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PriceCalendar({ room }: { room: Room }) {
  const { days, monthLabel } = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const totalDays = last.getDate();

    const cells: Array<{ date?: number; price?: number; stock?: number; isToday?: boolean } | null> = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      // Pseudo-stable values based on date+room id
      const seed = (d * 17 + room.id.length * 31) % 100;
      const price = room.price > 0 ? room.price + (seed - 50) * 4 : 580 + seed * 3;
      const stock = (seed % 30) + 1;
      cells.push({
        date: d,
        price: Math.max(99, price),
        stock,
        isToday: d === today.getDate(),
      });
    }
    return {
      days: cells,
      monthLabel: `${year}年${month + 1}月`,
    };
  }, [room]);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold text-foreground">{monthLabel}</div>
        <div className="text-[11px] text-muted-foreground">价格 / 库存</div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[11px] text-muted-foreground py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, idx) => (
          <div
            key={idx}
            className={`min-h-[60px] rounded-md border p-1.5 ${
              !cell
                ? "border-transparent"
                : cell.isToday
                ? "border-primary bg-primary/5"
                : "border-border/40 bg-card hover:bg-accent/40"
            }`}
          >
            {cell && (
              <div className="flex flex-col h-full">
                <div className={`text-[11px] ${cell.isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {cell.date}
                </div>
                <div className="mt-auto">
                  <div className="text-[12px] font-semibold text-destructive">¥{cell.price}</div>
                  <div className="text-[10px] text-muted-foreground">余{cell.stock}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomCard({
  room,
  onOpenDetail,
  onQueryPrice,
  onPublish,
}: {
  room: Room;
  onOpenDetail: () => void;
  onQueryPrice: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all">
      <button onClick={onOpenDetail} className="block w-full text-left">
        <div className="aspect-[16/10] bg-muted overflow-hidden">
          {room.image ? (
            <img src={room.image} alt={room.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[12px]">暂无图片</div>
          )}
        </div>
      </button>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <button onClick={onOpenDetail} className="min-w-0 text-left group flex-1">
            <h4 className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
              {room.name}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{room.bedType} · {room.floor}</p>
          </button>
          <Badge variant={room.published ? "default" : "secondary"} className="text-[11px] h-5 shrink-0">
            {room.published ? "已发布" : "未发布"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <FeatureChip icon={<Coffee className="h-3 w-3" />} label={room.breakfast} active={room.breakfast === "含早"} />
          <FeatureChip icon={<Sun className="h-3 w-3" />} label={room.hasWindow ? "有窗" : "无窗"} active={!!room.hasWindow} />
          <FeatureChip icon={<Bath className="h-3 w-3" />} label={room.hasBathroom ? "有卫" : "公卫"} active={!!room.hasBathroom} />
          <FeatureChip icon={<Wifi className="h-3 w-3" />} label={room.wifi ? "有网" : "无网"} active={room.wifi} />
          <FeatureChip icon={<Maximize className="h-3 w-3" />} label={`${room.area}㎡`} active />
          <FeatureChip icon={<Users className="h-3 w-3" />} label={`${room.maxGuests}人`} active />
        </div>

        <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/30">
          <Button size="sm" variant="ghost" className="h-7 text-[12px]" onClick={onQueryPrice}>
            <Tag className="h-3 w-3 mr-1" />查价
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[12px]" onClick={onPublish}>
            <Upload className="h-3 w-3 mr-1" />发布
          </Button>
          <Button
            size="sm"
            variant={room.subscribedPrice ? "secondary" : "ghost"}
            className="h-7 text-[12px]"
            onClick={() => toast.info(room.subscribedPrice ? `已取消订阅 ${room.name} 价格` : `已订阅 ${room.name} 价格变动`)}
          >
            <Bell className="h-3 w-3 mr-1" />{room.subscribedPrice ? "已订阅" : "订阅"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RoomTable({
  rooms,
  onOpenDetail,
  onQueryPrice,
  onPublish,
}: {
  rooms: Room[];
  onOpenDetail: (room: Room) => void;
  onQueryPrice: (id: string) => void;
  onPublish: (id: string) => void;
}) {
  return (
    <div className="border border-border/40 rounded-md overflow-hidden">
      <table className="w-full text-[13px]">
        <thead className="bg-muted/40">
          <tr className="border-b border-border/40">
            <th className="text-left font-semibold text-muted-foreground px-3 py-2 w-[60px]">图片</th>
            <th className="text-left font-semibold text-muted-foreground px-3 py-2">房型</th>
            <th className="text-left font-semibold text-muted-foreground px-3 py-2 w-[100px]">床型</th>
            <th className="text-center font-semibold text-muted-foreground px-3 py-2 w-[70px]">面积</th>
            <th className="text-center font-semibold text-muted-foreground px-3 py-2 w-[70px]">早餐</th>
            <th className="text-center font-semibold text-muted-foreground px-3 py-2 w-[60px]">窗</th>
            <th className="text-center font-semibold text-muted-foreground px-3 py-2 w-[60px]">卫</th>
            <th className="text-center font-semibold text-muted-foreground px-3 py-2 w-[60px]">网</th>
            <th className="text-center font-semibold text-muted-foreground px-3 py-2 w-[80px]">状态</th>
            <th className="text-right font-semibold text-muted-foreground px-3 py-2 w-[160px]">操作</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, idx) => (
            <tr
              key={room.id}
              className={`border-b border-border/30 cursor-pointer ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"} hover:bg-accent/40`}
              onClick={() => onOpenDetail(room)}
            >
              <td className="px-3 py-2">
                <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                  {room.image && <img src={room.image} alt={room.name} className="w-full h-full object-cover" loading="lazy" />}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="font-medium text-foreground hover:text-primary flex items-center gap-1">
                  {room.name}
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="text-[11px] text-muted-foreground">{room.floor} · 容纳{room.maxGuests}人</div>
              </td>
              <td className="px-3 py-2 text-foreground">{room.bedType}</td>
              <td className="px-3 py-2 text-center text-foreground">{room.area}㎡</td>
              <td className="px-3 py-2 text-center text-foreground">{room.breakfast}</td>
              <td className="px-3 py-2 text-center">{room.hasWindow ? "✓" : "—"}</td>
              <td className="px-3 py-2 text-center">{room.hasBathroom ? "✓" : "—"}</td>
              <td className="px-3 py-2 text-center">{room.wifi ? "✓" : "—"}</td>
              <td className="px-3 py-2 text-center">
                <Badge variant={room.published ? "default" : "secondary"} className="text-[11px] h-5">
                  {room.published ? "已发布" : "未发布"}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[12px]" onClick={() => onQueryPrice(room.id)}>
                    <Tag className="h-3 w-3 mr-1" />查价
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[12px]" onClick={() => onPublish(room.id)}>
                    <Upload className="h-3 w-3 mr-1" />发布
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoLine({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground text-[12px]">
        {icon}{label}
      </span>
      <span className={`text-[13px] font-medium ${highlight ? "text-destructive" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function FeatureChip({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border ${
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border/50 bg-muted/40 text-muted-foreground line-through"
      }`}
    >
      {icon}{label}
    </span>
  );
}
