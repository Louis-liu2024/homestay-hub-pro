import { useState } from "react";
import { mockShops } from "@/lib/mock-data";
import type { Shop, ShopApiConfig, Channel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Pencil, Trash2, Key, Globe } from "lucide-react";
import { toast } from "sonner";

const allChannels: Channel[] = ['携程', '美团', 'Booking', '飞猪', '去哪儿', 'Agoda', '途家', '小红书'];
const regions = ['华东', '华南', '华北', '华中', '西南', '西北', '东北'];

export function ShopManagement() {
  const [shops, setShops] = useState<Shop[]>(mockShops);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shop | null>(null);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [apiShop, setApiShop] = useState<Shop | null>(null);
  const [apiForm, setApiForm] = useState<Omit<ShopApiConfig, 'id'>>({
    channel: '携程',
    apiUrl: '',
    shopAccountId: '',
    apiKey: '',
  });
  const [editingApiId, setEditingApiId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    region: '华东',
    city: '',
    address: '',
    channels: [] as Channel[],
    publishTime: '',
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', region: '华东', city: '', address: '', channels: [], publishTime: '' });
    setDialogOpen(true);
  };

  const openEdit = (shop: Shop) => {
    setEditing(shop);
    setForm({
      name: shop.name,
      region: shop.region,
      city: shop.city,
      address: shop.address,
      channels: shop.channels,
      publishTime: shop.publishTime || '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.city) {
      toast.error("请填写店铺名称和城市");
      return;
    }
    if (editing) {
      setShops(prev => prev.map(s =>
        s.id === editing.id ? { ...s, ...form } : s
      ));
      toast.success("店铺已更新");
    } else {
      setShops(prev => [...prev, {
        ...form,
        id: `shop${Date.now()}`,
        apiConfigs: [],
        createdAt: new Date().toISOString().split('T')[0],
      }]);
      toast.success("店铺已创建");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setShops(prev => prev.filter(s => s.id !== id));
    toast.success("店铺已删除");
  };

  const toggleChannel = (ch: Channel) => {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch)
        ? f.channels.filter(c => c !== ch)
        : [...f.channels, ch],
    }));
  };

  const openApiDialog = (shop: Shop, existing?: ShopApiConfig) => {
    setApiShop(shop);
    if (existing) {
      setEditingApiId(existing.id);
      setApiForm({ channel: existing.channel, apiUrl: existing.apiUrl, shopAccountId: existing.shopAccountId, apiKey: existing.apiKey });
    } else {
      setEditingApiId(null);
      setApiForm({ channel: '携程', apiUrl: '', shopAccountId: '', apiKey: '' });
    }
    setApiDialogOpen(true);
  };

  const handleSaveApi = () => {
    if (!apiShop || !apiForm.apiUrl || !apiForm.shopAccountId) {
      toast.error("请填写完整API配置");
      return;
    }
    setShops(prev => prev.map(s => {
      if (s.id !== apiShop.id) return s;
      if (editingApiId) {
        return { ...s, apiConfigs: s.apiConfigs.map(ac => ac.id === editingApiId ? { ...ac, ...apiForm } : ac) };
      }
      return { ...s, apiConfigs: [...s.apiConfigs, { ...apiForm, id: `ac${Date.now()}` }] };
    }));
    toast.success(editingApiId ? "API配置已更新" : "API配置已添加");
    setApiDialogOpen(false);
  };

  const handleDeleteApi = (shopId: string, apiId: string) => {
    setShops(prev => prev.map(s =>
      s.id === shopId ? { ...s, apiConfigs: s.apiConfigs.filter(ac => ac.id !== apiId) } : s
    ));
    toast.success("API配置已删除");
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">店铺管理</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          新增店铺
        </Button>
      </div>

      <div className="space-y-4">
        {shops.map(shop => (
          <Card key={shop.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{shop.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {shop.region} · {shop.city} · {shop.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(shop)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(shop.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">渠道：</span>
                {shop.channels.map(ch => (
                  <Badge key={ch} variant="secondary">{ch}</Badge>
                ))}
              </div>
              {shop.publishTime && (
                <p className="text-sm text-muted-foreground">
                  发布时间：{shop.publishTime}
                </p>
              )}

              <Accordion type="single" collapsible>
                <AccordionItem value="api" className="border-none">
                  <AccordionTrigger className="py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      渠道API配置 ({shop.apiConfigs.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {shop.apiConfigs.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>渠道</TableHead>
                              <TableHead>API路径</TableHead>
                              <TableHead>店铺ID</TableHead>
                              <TableHead>密钥</TableHead>
                              <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {shop.apiConfigs.map(ac => (
                              <TableRow key={ac.id}>
                                <TableCell><Badge variant="outline">{ac.channel}</Badge></TableCell>
                                <TableCell className="font-mono text-xs max-w-[200px] truncate">{ac.apiUrl}</TableCell>
                                <TableCell className="font-mono text-xs">{ac.shopAccountId}</TableCell>
                                <TableCell className="font-mono text-xs">{'•'.repeat(8)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => openApiDialog(shop, ac)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteApi(shop.id, ac.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openApiDialog(shop)}>
                        <Plus className="h-3 w-3 mr-1" />
                        添加API配置
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shop dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "编辑店铺" : "新增店铺"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>店铺名称</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="输入店铺名称" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>地域</Label>
                <Select value={form.region} onValueChange={v => setForm(f => ({ ...f, region: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>城市</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="城市" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>地址</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="详细地址" />
            </div>
            <div className="space-y-2">
              <Label>渠道</Label>
              <div className="flex flex-wrap gap-2">
                {allChannels.map(ch => (
                  <Badge
                    key={ch}
                    variant={form.channels.includes(ch) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleChannel(ch)}
                  >
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>发布时间</Label>
              <Input type="date" value={form.publishTime} onChange={e => setForm(f => ({ ...f, publishTime: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API config dialog */}
      <Dialog open={apiDialogOpen} onOpenChange={setApiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {editingApiId ? "编辑" : "添加"}API配置
                {apiShop && <span className="text-muted-foreground font-normal text-sm">— {apiShop.name}</span>}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>渠道</Label>
              <Select value={apiForm.channel} onValueChange={v => setApiForm(f => ({ ...f, channel: v as Channel }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allChannels.map(ch => <SelectItem key={ch} value={ch}>{ch}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API路径</Label>
              <Input value={apiForm.apiUrl} onChange={e => setApiForm(f => ({ ...f, apiUrl: e.target.value }))} placeholder="https://api.example.com/v1" />
            </div>
            <div className="space-y-2">
              <Label>店铺ID</Label>
              <Input value={apiForm.shopAccountId} onChange={e => setApiForm(f => ({ ...f, shopAccountId: e.target.value }))} placeholder="渠道分配的店铺账号ID" />
            </div>
            <div className="space-y-2">
              <Label>API密钥</Label>
              <Input type="password" value={apiForm.apiKey} onChange={e => setApiForm(f => ({ ...f, apiKey: e.target.value }))} placeholder="API Key / Secret" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveApi}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
