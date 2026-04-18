import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { mockShops } from "@/lib/mock-data";
import type { Hotel, Room } from "@/lib/types";

interface Props {
  hotel: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select these room IDs when opened */
  preselectedRoomIds?: string[];
}

export function PublishDialog({ hotel, open, onOpenChange, preselectedRoomIds }: Props) {
  const [roomIds, setRoomIds] = useState<Set<string>>(new Set());
  const [shopIds, setShopIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && hotel) {
      setRoomIds(new Set(preselectedRoomIds && preselectedRoomIds.length > 0 ? preselectedRoomIds : hotel.rooms.map(r => r.id)));
      setShopIds(new Set());
    }
  }, [open, hotel, preselectedRoomIds]);

  const allRoomsSelected = useMemo(() => hotel ? roomIds.size === hotel.rooms.length : false, [hotel, roomIds]);
  const allShopsSelected = shopIds.size === mockShops.length;

  if (!hotel) return null;

  const toggleRoom = (id: string) => {
    setRoomIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleShop = (id: string) => {
    setShopIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handlePublish = () => {
    if (roomIds.size === 0) return toast.error("请至少选择一个房型");
    if (shopIds.size === 0) return toast.error("请至少选择一个上架店铺");
    toast.success(`已发布 ${roomIds.size} 个房型到 ${shopIds.size} 个店铺`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="px-5 py-3 border-b border-border/50">
          <DialogTitle className="text-[14px] font-semibold flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">发布酒店</span>
            <span className="text-foreground">{hotel.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
          {/* Rooms */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/40">
              <div className="text-[13px] font-semibold text-foreground">选择房型</div>
              <button
                className="text-[12px] text-primary hover:underline"
                onClick={() => setRoomIds(allRoomsSelected ? new Set() : new Set(hotel.rooms.map(r => r.id)))}
              >
                {allRoomsSelected ? "取消全选" : "全选"}
              </button>
            </div>
            <ScrollArea className="h-[340px]">
              <div className="p-2 space-y-1">
                {hotel.rooms.map((room: Room) => {
                  const checked = roomIds.has(room.id);
                  return (
                    <label
                      key={room.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        checked ? "bg-primary/10" : "hover:bg-accent/40"
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleRoom(room.id)} />
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                        {room.image && <img src={room.image} alt={room.name} className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground truncate">{room.name}</div>
                        <div className="text-[11px] text-muted-foreground">{room.bedType} · {room.area}㎡ · {room.breakfast}</div>
                      </div>
                      <div className="text-[13px] font-semibold text-primary shrink-0">¥{room.price}</div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Shops */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/40">
              <div className="text-[13px] font-semibold text-foreground">选择上架店铺</div>
              <button
                className="text-[12px] text-primary hover:underline"
                onClick={() => setShopIds(allShopsSelected ? new Set() : new Set(mockShops.map(s => s.id)))}
              >
                {allShopsSelected ? "取消全选" : "全选"}
              </button>
            </div>
            <ScrollArea className="h-[340px]">
              <div className="p-2 space-y-1">
                {mockShops.map((shop) => {
                  const checked = shopIds.has(shop.id);
                  return (
                    <label
                      key={shop.id}
                      className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        checked ? "bg-primary/10" : "hover:bg-accent/40"
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleShop(shop.id)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground">{shop.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{shop.region} · {shop.city}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {shop.channels.map((ch) => (
                            <Badge key={ch} variant="outline" className="text-[10px] h-4 px-1.5 border-border/60">{ch}</Badge>
                          ))}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border/50 bg-muted/20 flex !justify-between items-center gap-2 sm:flex-row">
          <div className="text-[12px] text-muted-foreground">
            已选 <span className="text-primary font-semibold">{roomIds.size}</span> 个房型 ·{" "}
            <span className="text-primary font-semibold">{shopIds.size}</span> 个店铺
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8" onClick={() => onOpenChange(false)}>取消</Button>
            <Button size="sm" className="h-8" onClick={handlePublish}>
              <Upload className="h-3.5 w-3.5 mr-1" />确认发布
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
