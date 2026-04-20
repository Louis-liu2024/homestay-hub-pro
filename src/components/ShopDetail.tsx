import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { mockShops } from "@/lib/mock-data";
import type { Shop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  ShieldCheck,
  RefreshCw,
  Phone,
  Loader2,
  Check,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

const SHOP_KEY = "hotelos.shops.list";
const RULES_KEY = "hotelos.shops.rules";
const SUPER_CODE = "123456";

function loadShops(): Shop[] {
  try {
    const raw = localStorage.getItem(SHOP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return mockShops;
}

interface MarkupRule {
  id: string;
  supplier: string;
  channel: string;
  hotelTag: string;
  priceMin: number;
  priceMax: number;
  otherCondition?: string;
  markupPercent: number;
  markupFixed: number;
  priority: number;
}

interface BlockRule {
  id: string;
  supplier: string;
  channel: string;
  hotelTag: string;
  reason: string;
  priority: number;
}

interface CancelRule {
  id: string;
  condition: string;
  rule: string;
  priority: number;
}

interface AutoOrderRule {
  id: string;
  condition: string;
  enabled: boolean;
}

interface CheckInScene {
  enabled: boolean;
  hour: number;
  mode: "direct" | "ifNonCancelable";
}

interface ShopRules {
  advanceBookingHours: number;
  markupRules: MarkupRule[];
  blockRules: BlockRule[];
  cancelRules: CancelRule[];
  autoOrderRules: AutoOrderRule[];
  contactPhone: string;
  scene1: CheckInScene;
  scene2: { enabled: boolean; hour: number };
}

const DEFAULT_RULES: ShopRules = {
  advanceBookingHours: 0,
  markupRules: [
    { id: "m1", supplier: "艺龙", channel: "飞猪", hotelTag: "扶摇专用", priceMin: 0, priceMax: 55, markupPercent: 0, markupFixed: -7, priority: 0 },
    { id: "m2", supplier: "艺龙", channel: "飞猪", hotelTag: "扶摇专用", priceMin: 55, priceMax: 9999, markupPercent: 20, markupFixed: 0, priority: 0 },
  ],
  blockRules: [],
  cancelRules: [
    { id: "c1", condition: "艺龙 且 供应商取消类型:不可取消", rule: "不可取消", priority: 0 },
  ],
  autoOrderRules: [],
  contactPhone: "",
  scene1: { enabled: true, hour: 0, mode: "direct" },
  scene2: { enabled: true, hour: 19 },
};

const PALETTE = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-purple-500 to-purple-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
];
function hashIdx(s: string, m: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % m;
}

function maskSecret(value: string) {
  if (!value) return "—";
  if (value.length <= 5) return value[0] + "****";
  return `${value.slice(0, 3)}${"*".repeat(Math.max(4, value.length - 5))}${value.slice(-2)}`;
}

export function ShopDetail() {
  const navigate = useNavigate();
  const { shopId } = useParams({ from: "/_app/shops/$shopId" });
  const [shops] = useState<Shop[]>(() => loadShops());
  const shop = useMemo(() => shops.find((s) => s.id === shopId), [shops, shopId]);

  // 超管验证状态
  const [verified, setVerified] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);

  // 编辑替换
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editSecret, setEditSecret] = useState("");
  const [showSecretId, setShowSecretId] = useState<string | null>(null);

  const [rules, setRules] = useState<ShopRules>(() => {
    try {
      const raw = localStorage.getItem(`${RULES_KEY}.${shopId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return {
      bookingRule: "支持提前 30 天预定;同一身份证最多预定 5 间房",
      markupRule: "周末加价 10%;节假日加价 20%",
      cancelPolicy: "入住前 24 小时免费取消;之后扣除首晚房费",
      contactInfo: "联系电话:400-888-0000\n邮箱:contact@hotel.com",
      checkInRule: "入住时间:14:00 后\n离店时间:12:00 前\n需出示身份证原件",
    };
  });

  if (!shop) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">店铺不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: "/shops" })}>
          返回店铺列表
        </Button>
      </div>
    );
  }

  const initials = shop.name.slice(0, 2);
  const grad = PALETTE[hashIdx(shop.id, PALETTE.length)];

  const sendCode = () => {
    if (!/^1\d{10}$/.test(phone)) {
      toast.error("请输入正确的手机号");
      return;
    }
    setCooldown(60);
    toast.success(`验证码已发送（演示固定为 ${SUPER_CODE}）`);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const verify = async () => {
    if (code !== SUPER_CODE) {
      toast.error("验证码错误");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 400));
    setVerifying(false);
    setVerified(true);
    setVerifyOpen(false);
    toast.success("超管验证通过，可查看与替换密钥");
  };

  const requireVerify = (action: () => void) => {
    if (verified) action();
    else setVerifyOpen(true);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制");
  };

  const startEdit = (id: string, key: string, secret: string) => {
    setEditingId(id);
    setEditKey(key);
    setEditSecret(secret);
  };

  const saveEdit = () => {
    // 更新 localStorage
    try {
      const raw = localStorage.getItem(SHOP_KEY);
      const list: Shop[] = raw ? JSON.parse(raw) : mockShops;
      const idx = list.findIndex((s) => s.id === shopId);
      if (idx >= 0) {
        list[idx].apiConfigs = list[idx].apiConfigs.map((ac) =>
          ac.id === editingId ? { ...ac, shopAccountId: editKey, apiKey: editSecret } : ac
        );
        localStorage.setItem(SHOP_KEY, JSON.stringify(list));
      }
    } catch {
      /* ignore */
    }
    toast.success("配置已替换");
    setEditingId(null);
    setTimeout(() => window.location.reload(), 300);
  };

  const updateRule = (k: keyof ShopRules, v: string) => {
    const next = { ...rules, [k]: v };
    setRules(next);
    localStorage.setItem(`${RULES_KEY}.${shopId}`, JSON.stringify(next));
  };

  return (
    <div className="p-5 md:p-7 space-y-4 text-[13px] max-w-5xl">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 -ml-2"
        asChild
      >
        <Link to="/shops">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> 返回店铺列表
        </Link>
      </Button>

      {/* Header */}
      <Card className="border-border/60 bg-card">
        <CardContent className="p-5 flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-lg shadow-md`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold truncate">{shop.name}</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {shop.region} · {shop.city} · 创建于 {shop.createdAt}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {shop.channels.map((ch) => (
                <Badge key={ch} variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-0">
                  {ch}
                </Badge>
              ))}
            </div>
          </div>
          {verified && (
            <Badge variant="outline" className="text-[11px] gap-1 border-success/40 text-success">
              <ShieldCheck className="h-3 w-3" />
              超管已验证
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* API 密钥 */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            平台 API 配置
            <span className="ml-auto text-[11px] font-normal text-muted-foreground">
              {verified ? "已解锁查看" : "查看与替换需超管验证"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shop.apiConfigs.length === 0 && (
            <p className="text-[12px] text-muted-foreground py-4 text-center border border-dashed border-border/60 rounded-md">
              暂未配置任何平台 API
            </p>
          )}
          {shop.apiConfigs.map((ac) => {
            const isEdit = editingId === ac.id;
            const showFull = verified && showSecretId === ac.id;
            return (
              <div
                key={ac.id}
                className="border border-border/50 rounded-lg p-3 space-y-3 bg-muted/10"
              >
                <div className="flex items-center justify-between">
                  <Badge className="text-[11px]">{ac.channel}</Badge>
                  {!isEdit && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px]"
                        onClick={() =>
                          requireVerify(() =>
                            setShowSecretId(showSecretId === ac.id ? null : ac.id)
                          )
                        }
                      >
                        {showFull ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" /> 隐藏
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" /> 查看
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px]"
                        onClick={() =>
                          requireVerify(() =>
                            startEdit(ac.id, ac.shopAccountId, ac.apiKey)
                          )
                        }
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> 替换
                      </Button>
                    </div>
                  )}
                </div>

                {isEdit ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">AppKey</Label>
                      <Input
                        className="h-9 font-mono text-xs"
                        value={editKey}
                        onChange={(e) => setEditKey(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">AppSecret</Label>
                      <Input
                        className="h-9 font-mono text-xs"
                        value={editSecret}
                        onChange={(e) => setEditSecret(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        取消
                      </Button>
                      <Button size="sm" onClick={saveEdit}>
                        <Check className="h-3.5 w-3.5 mr-1" /> 保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SecretRow
                      label="AppKey"
                      value={showFull ? ac.shopAccountId : maskSecret(ac.shopAccountId)}
                      onCopy={() => requireVerify(() => copy(ac.shopAccountId))}
                    />
                    <SecretRow
                      label="AppSecret"
                      value={showFull ? ac.apiKey : maskSecret(ac.apiKey)}
                      onCopy={() => requireVerify(() => copy(ac.apiKey))}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 店铺规则 */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">店铺规则配置</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="booking">
            <TabsList className="h-9">
              <TabsTrigger value="booking" className="text-xs">提前预定</TabsTrigger>
              <TabsTrigger value="markup" className="text-xs">加价规则</TabsTrigger>
              <TabsTrigger value="cancel" className="text-xs">取消政策</TabsTrigger>
              <TabsTrigger value="contact" className="text-xs">联系方式</TabsTrigger>
              <TabsTrigger value="checkin" className="text-xs">入住规则</TabsTrigger>
            </TabsList>

            <TabsContent value="booking" className="mt-4">
              <Textarea
                className="min-h-[160px] text-[13px]"
                value={rules.bookingRule}
                onChange={(e) => updateRule("bookingRule", e.target.value)}
                placeholder="例如：支持提前 30 天预定..."
              />
            </TabsContent>
            <TabsContent value="markup" className="mt-4">
              <Textarea
                className="min-h-[160px] text-[13px]"
                value={rules.markupRule}
                onChange={(e) => updateRule("markupRule", e.target.value)}
                placeholder="例如：周末加价 10%..."
              />
            </TabsContent>
            <TabsContent value="cancel" className="mt-4">
              <Textarea
                className="min-h-[160px] text-[13px]"
                value={rules.cancelPolicy}
                onChange={(e) => updateRule("cancelPolicy", e.target.value)}
                placeholder="例如：入住前 24 小时免费取消..."
              />
            </TabsContent>
            <TabsContent value="contact" className="mt-4">
              <Textarea
                className="min-h-[160px] text-[13px]"
                value={rules.contactInfo}
                onChange={(e) => updateRule("contactInfo", e.target.value)}
                placeholder="联系电话/邮箱..."
              />
            </TabsContent>
            <TabsContent value="checkin" className="mt-4">
              <Textarea
                className="min-h-[160px] text-[13px]"
                value={rules.checkInRule}
                onChange={(e) => updateRule("checkInRule", e.target.value)}
                placeholder="入住时间/离店时间/证件要求..."
              />
            </TabsContent>
          </Tabs>
          <p className="text-[11px] text-muted-foreground mt-2">规则修改将自动保存</p>
        </CardContent>
      </Card>

      {/* 超管验证弹窗 */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              超管身份验证
            </DialogTitle>
            <DialogDescription>
              查看与替换密钥需要超级管理员的手机号 + 短信验证码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">超管手机号</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="h-10 pl-8"
                  placeholder="11 位手机号"
                  value={phone}
                  maxLength={11}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">短信验证码</Label>
              <div className="flex gap-2">
                <Input
                  className="h-10 flex-1"
                  placeholder="6 位验证码"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
                <Button
                  variant="outline"
                  className="h-10 w-28 shrink-0"
                  onClick={sendCode}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)}>
              取消
            </Button>
            <Button onClick={verify} disabled={verifying}>
              {verifying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> 验证中
                </>
              ) : (
                "确认验证"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SecretRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex items-center gap-1 bg-card border border-border/50 rounded-md px-2.5 h-9">
        <code className="font-mono text-[12.5px] flex-1 truncate">{value}</code>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={onCopy}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
