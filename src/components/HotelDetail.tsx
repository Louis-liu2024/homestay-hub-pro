import { useState } from "react";
import { mockHotels } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowLeft, Upload, Bell, MapPin, Phone, Star, Tag,
  Wifi, Bath, Sun, Coffee, Users, Maximize, Building2, Calendar, Clock,
  LayoutGrid, List as ListIcon, Info,
} from "lucide-react";
import { toast } from "sonner";
import { PriceQueryDialog } from "@/components/PriceQueryDialog";
import { PublishDialog } from "@/components/PublishDialog";
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

      {/* Gallery + Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-muted border border-border/50">
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
                  className={`w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                    idx === activeImage ? "border-primary" : "border-border/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Card className="border-border/60 bg-card">
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
            <CardContent className="space-y-2 text-[13px]">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {hotel.description && (
        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] font-semibold">酒店简介</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{hotel.description}</p>
          </CardContent>
        </Card>
      )}

      {hotel.facilities && hotel.facilities.length > 0 && (
        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] font-semibold">基础设施</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hotel.facilities.map((f) => (
                <Badge key={f} variant="outline" className="text-[12px] h-6 px-2.5 border-border/60 bg-muted/30">
                  {f}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                  onQueryPrice={() => openPriceQuery([room.id])}
                  onPublish={() => openPublish([room.id])}
                />
              ))}
            </div>
          ) : (
            <RoomTable
              rooms={hotel.rooms}
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
    </div>
  );
}

function RoomCard({ room, onQueryPrice, onPublish }: { room: Room; onQueryPrice: () => void; onPublish: () => void }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all">
      <div className="aspect-[16/10] bg-muted overflow-hidden">
        {room.image ? (
          <img src={room.image} alt={room.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[12px]">暂无图片</div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-foreground truncate">{room.name}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{room.bedType} · {room.floor}</p>
          </div>
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

function RoomTable({ rooms, onQueryPrice, onPublish }: { rooms: Room[]; onQueryPrice: (id: string) => void; onPublish: (id: string) => void }) {
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
            <tr key={room.id} className={`border-b border-border/30 ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"} hover:bg-accent/40`}>
              <td className="px-3 py-2">
                <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                  {room.image && <img src={room.image} alt={room.name} className="w-full h-full object-cover" loading="lazy" />}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="font-medium text-foreground">{room.name}</div>
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
              <td className="px-3 py-2 text-right">
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
