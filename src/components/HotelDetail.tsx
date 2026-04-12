import { mockHotels } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Upload, Bell, MapPin, Phone, Star } from "lucide-react";
import { toast } from "sonner";

export function HotelDetail({ hotelId }: { hotelId: string }) {
  const hotel = mockHotels.find((h) => h.id === hotelId);

  if (!hotel) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">酒店未找到</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/data-pool">返回列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/data-pool">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{hotel.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              {hotel.rating}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {hotel.address}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {hotel.contactPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="渠道来源" value={hotel.channel} />
        <InfoCard label="品牌" value={hotel.brand} />
        <InfoCard label="房间数" value={String(hotel.roomCount)} />
        <InfoCard
          label="7天空房率"
          value={`${(hotel.vacancyRate7d * 100).toFixed(0)}%`}
        />
        <InfoCard label="总订单" value={String(hotel.totalOrders)} />
        <InfoCard label="均价" value={`¥${hotel.avgPrice}`} />
        <InfoCard label="城市" value={hotel.city} />
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">标签</p>
          <div className="flex gap-1 flex-wrap">
            {hotel.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Room types table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">房型列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>房型名称</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>面积</TableHead>
                <TableHead>床型</TableHead>
                <TableHead>早餐</TableHead>
                <TableHead>最大入住</TableHead>
                <TableHead>楼层</TableHead>
                <TableHead>WiFi</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotel.rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>¥{room.price}</TableCell>
                  <TableCell>{room.area}㎡</TableCell>
                  <TableCell>{room.bedType}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        room.breakfast === "含早" ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {room.breakfast}
                    </Badge>
                  </TableCell>
                  <TableCell>{room.maxGuests}人</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.wifi ? "✓" : "✗"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={room.published ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {room.published ? "已发布" : "未发布"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast.success(`${room.name} 已发布到OTA平台`)
                        }
                      >
                        <Upload className="h-3.5 w-3.5 mr-1" />
                        发布
                      </Button>
                      <Button
                        size="sm"
                        variant={room.subscribedPrice ? "secondary" : "ghost"}
                        onClick={() =>
                          toast.info(
                            room.subscribedPrice
                              ? `已取消订阅 ${room.name} 价格`
                              : `已订阅 ${room.name} 价格变动`
                          )
                        }
                      >
                        <Bell className="h-3.5 w-3.5 mr-1" />
                        {room.subscribedPrice ? "已订阅" : "订阅价格"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
