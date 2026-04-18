import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Check, ChevronRight, ArrowLeft } from "lucide-react";
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

type VacancyFilter = "all" | "yes" | "no";
type PublishFilter = "all" | "unpublished" | "published";

export function PublishDialog({ hotel, open, onOpenChange, preselectedRoomIds }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [roomIds, setRoomIds] = useState<Set<string>>(new Set());
  const [shopIds, setShopIds] = useState<Set<string>>(new Set());
  const [vacancyFilter, setVacancyFilter] = useState<VacancyFilter>("all");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");

  useEffect(() => {
    if (open && hotel) {
      setStep(1);
      const selectable = hotel.rooms.filter(r => !r.published).map(r => r.id);
      setRoomIds(new Set(
        preselectedRoomIds && preselectedRoomIds.length > 0
          ? preselectedRoomIds.filter(id => selectable.includes(id))
          : selectable
      ));
      setShopIds(new Set());
      setVacancyFilter("all");
      setPublishFilter("all");
    }
  }, [open, hotel, preselectedRoomIds]);

  const filteredRooms = useMemo(() => {
    if (!hotel) return [];
    return hotel.rooms.filter(r => {
      if (vacancyFilter === "yes" && !r.hasVacancy) return false;
      if (vacancyFilter === "no" && r.hasVacancy) return false;
      if (publishFilter === "unpublished" && r.published) return false;
      if (publishFilter === "published" && !r.published) return false;
      return true;
    });
  }, [hotel, vacancyFilter, publishFilter]);

  const selectableFilteredIds = useMemo(
    () => filteredRooms.filter(r => !r.published).map(r => r.id),
    [filteredRooms]
  );
  const allFilteredSelected = selectableFilteredIds.length > 0 && selectableFilteredIds.every(id => roomIds.has(id));
  const allShopsSelected = shopIds.size === mockShops.length;

  if (!hotel) return null;

  const toggleRoom = (room: Room) => {
    if (room.published) return;
    setRoomIds(prev => {
      const n = new Set(prev);
      n.has(room.id) ? n.delete(room.id) : n.add(room.id);
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

  const handleNext = () => {
    if (roomIds.size === 0) return toast.error("请至少选择一个可发布的房型");
    setStep(2);
  };

  const handlePublish = () => {
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

        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 px-5 py-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold ${
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
            </div>
            <span className={`text-[12px] font-medium ${step === 1 ? "text-foreground" : "text-muted-foreground"}`}>
              选择房型
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold ${
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              2
            </div>
            <span className={`text-[12px] font-medium ${step === 2 ? "text-foreground" : "text-muted-foreground"}`}>
              选择店铺
            </span>
          </div>
        </div>

        {/* Step 1: Rooms */}
        {step === 1 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/30 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Select value={vacancyFilter} onValueChange={(v) => setVacancyFilter(v as VacancyFilter)}>
                  <SelectTrigger className="h-7 w-[110px] text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部房态</SelectItem>
                    <SelectItem value="yes">有房</SelectItem>
                    <SelectItem value="no">无房</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={publishFilter} onValueChange={(v) => setPublishFilter(v as PublishFilter)}>
                  <SelectTrigger className="h-7 w-[120px] text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部发布状态</SelectItem>
                    <SelectItem value="unpublished">未发布</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                className="text-[12px] text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                disabled={selectableFilteredIds.length === 0}
                onClick={() => {
                  if (allFilteredSelected) {
                    setRoomIds(prev => {
                      const n = new Set(prev);
                      selectableFilteredIds.forEach(id => n.delete(id));
                      return n;
                    });
                  } else {
                    setRoomIds(prev => {
                      const n = new Set(prev);
                      selectableFilteredIds.forEach(id => n.add(id));
                      return n;
                    });
                  }
                }}
              >
                {allFilteredSelected ? "取消全选" : "全选可发布"}
              </button>
            </div>
            <ScrollArea className="h-[360px]">
              <div className="p-2 space-y-1">
                {filteredRooms.length === 0 && (
                  <div className="py-12 text-center text-[12px] text-muted-foreground">无符合条件的房型</div>
                )}
                {filteredRooms.map((room) => {
                  const checked = roomIds.has(room.id);
                  const disabled = room.published;
                  return (
                    <label
                      key={room.id}
                      className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                        disabled
                          ? "opacity-60 cursor-not-allowed bg-muted/20"
                          : checked
                          ? "bg-primary/10 cursor-pointer"
                          : "hover:bg-accent/40 cursor-pointer"
                      }`}
                    >
                      <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => toggleRoom(room)} />
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                        {room.image && <img src={room.image} alt={room.name} className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-medium text-foreground truncate">{room.name}</span>
                          {room.hasVacancy ? (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">有房</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-muted-foreground/30 text-muted-foreground">无房</Badge>
                          )}
                          {room.published ? (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-primary/40 text-primary">已发布</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400">未发布</Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{room.bedType} · {room.area}㎡ · {room.breakfast}</div>
                      </div>
                      <div className="text-[13px] font-semibold text-primary shrink-0">¥{room.price}</div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Step 2: Shops */}
        {step === 2 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/40">
              <div className="text-[12px] text-muted-foreground">
                将发布 <span className="text-primary font-semibold">{roomIds.size}</span> 个房型，请选择上架店铺
              </div>
              <button
                className="text-[12px] text-primary hover:underline"
                onClick={() => setShopIds(allShopsSelected ? new Set() : new Set(mockShops.map(s => s.id)))}
              >
                {allShopsSelected ? "取消全选" : "全选"}
              </button>
            </div>
            <ScrollArea className="h-[360px]">
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
        )}

        <DialogFooter className="px-5 py-3 border-t border-border/50 bg-muted/20 flex !justify-between items-center gap-2 sm:flex-row">
          <div className="text-[12px] text-muted-foreground">
            已选 <span className="text-primary font-semibold">{roomIds.size}</span> 个房型
            {step === 2 && (
              <>
                {" · "}
                <span className="text-primary font-semibold">{shopIds.size}</span> 个店铺
              </>
            )}
          </div>
          <div className="flex gap-2">
            {step === 1 ? (
              <>
                <Button size="sm" variant="outline" className="h-8" onClick={() => onOpenChange(false)}>取消</Button>
                <Button size="sm" className="h-8" onClick={handleNext}>
                  下一步<ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" className="h-8" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />上一步
                </Button>
                <Button size="sm" className="h-8" onClick={handlePublish}>
                  <Upload className="h-3.5 w-3.5 mr-1" />确认发布
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
