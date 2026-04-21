import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { mockShops } from "@/lib/mock-data";
import type { Shop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

import { MarkupRuleDialog, type MarkupRuleConfig } from "@/components/MarkupRuleDialog";

type MarkupRule = MarkupRuleConfig;

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
    {
      id: "m1",
      channel: "飞猪",
      priceMin: 0,
      priceMax: 55,
      breakfastMode: "any",
      breakfastCounts: [],
      dateMode: "range",
      dateRange: {},
      monthlyDays: [],
      weeklyDays: [],
      specificDates: [],
      holidayMode: "none",
      brandKeyword: "",
      roomKeyword: "扶摇专用",
      markupPercent: 0,
      markupFixed: -7,
      priority: 0,
    },
    {
      id: "m2",
      channel: "飞猪",
      priceMin: 55,
      priceMax: 9999,
      breakfastMode: "any",
      breakfastCounts: [],
      dateMode: "range",
      dateRange: {},
      monthlyDays: [],
      weeklyDays: [],
      specificDates: [],
      holidayMode: "none",
      brandKeyword: "",
      roomKeyword: "扶摇专用",
      markupPercent: 20,
      markupFixed: 0,
      priority: 0,
    },
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
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged: ShopRules = { ...DEFAULT_RULES, ...parsed };
        // 兼容旧数据：补齐加价规则缺失字段
        merged.markupRules = (merged.markupRules || []).map((r: Partial<MarkupRule>) => ({
          id: r.id || `m${Date.now()}`,
          channel: r.channel ?? "",
          priceMin: r.priceMin ?? 0,
          priceMax: r.priceMax ?? 9999,
          breakfastMode: r.breakfastMode ?? "any",
          breakfastCounts: r.breakfastCounts ?? [],
          dateMode: r.dateMode ?? "range",
          dateRange: r.dateRange ?? {},
          monthlyDays: r.monthlyDays ?? [],
          weeklyDays: r.weeklyDays ?? [],
          specificDates: r.specificDates ?? [],
          holidayMode: r.holidayMode ?? "none",
          brandKeyword: r.brandKeyword ?? "",
          roomKeyword: r.roomKeyword ?? "",
          markupPercent: r.markupPercent ?? 0,
          markupFixed: r.markupFixed ?? 0,
          priority: r.priority ?? 0,
        }));
        return merged;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_RULES;
  });

  const persistRules = (next: ShopRules) => {
    setRules(next);
    localStorage.setItem(`${RULES_KEY}.${shopId}`, JSON.stringify(next));
  };

  // 加价规则弹框
  const [markupOpen, setMarkupOpen] = useState(false);
  const [editingMarkup, setEditingMarkup] = useState<MarkupRule | null>(null);

  const saveMarkupRule = (next: MarkupRule) => {
    const exists = rules.markupRules.some((x) => x.id === next.id);
    const list = exists
      ? rules.markupRules.map((x) => (x.id === next.id ? next : x))
      : [...rules.markupRules, next];
    persistRules({ ...rules, markupRules: list });
  };

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
    <div className="p-5 md:p-7 space-y-4 text-[13px] max-w-6xl">
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

      {/* 基本信息 + 平台 API 合并 */}
      <Card className="border-border/60 bg-card">
        <CardContent className="p-3.5 space-y-3">
          {/* 顶部：头像 + 名称 + 渠道 */}
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[13px] shadow-sm shrink-0`}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[14px] font-semibold truncate">{shop.name}</h1>
                {shop.channels.map((ch) => (
                  <Badge key={ch} variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-0">
                    {ch}
                  </Badge>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {shop.region} · {shop.city} · 创建于 {shop.createdAt}
                {shop.shortName ? ` · 简称：${shop.shortName}` : ""}
              </p>
            </div>
            {verified && (
              <Badge variant="outline" className="text-[10px] h-5 gap-1 border-success/40 text-success shrink-0">
                <ShieldCheck className="h-2.5 w-2.5" />
                超管已验证
              </Badge>
            )}
          </div>

          {/* 平台 API 区域 */}
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-3.5 w-3.5 text-primary" />
              <span className="text-[12px] font-semibold">平台 API 配置</span>
              <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                {verified ? "已解锁查看" : "查看与替换需超管验证"}
              </span>
            </div>
            <div className="space-y-2">
              {shop.apiConfigs.length === 0 && (
                <p className="text-[11px] text-muted-foreground py-3 text-center border border-dashed border-border/60 rounded-md">
                  暂未配置任何平台 API
                </p>
              )}
              {shop.apiConfigs.map((ac) => {
                const isEdit = editingId === ac.id;
                const showFull = verified && showSecretId === ac.id;
                return (
                  <div
                    key={ac.id}
                    className="border border-border/50 rounded-md p-2.5 space-y-2 bg-muted/10"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="text-[11px]">{ac.channel}</Badge>
                        <span className="text-[11px] text-muted-foreground">
                          授权有效期：
                          <span className="text-foreground ml-1">
                            {shop.openTime || "-"} 至 {shop.expireTime || shop.publishTime || "-"}
                          </span>
                        </span>
                      </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 店铺规则 */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">店铺规则配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="advance" className="w-full">
            <TabsList className="h-9 flex flex-wrap justify-start gap-1 bg-muted/50">
              <TabsTrigger value="advance" className="text-[12px]">提前预定</TabsTrigger>
              <TabsTrigger value="markup" className="text-[12px]">加价规则</TabsTrigger>
              <TabsTrigger value="block" className="text-[12px]">屏蔽规则</TabsTrigger>
              <TabsTrigger value="cancel" className="text-[12px]">取消政策</TabsTrigger>
              <TabsTrigger value="auto" className="text-[12px]">自动下单</TabsTrigger>
              <TabsTrigger value="contact" className="text-[12px]">下单手机号</TabsTrigger>
              <TabsTrigger value="checkin" className="text-[12px]">入住设置</TabsTrigger>
            </TabsList>

            <TabsContent value="advance" className="mt-4">
          {/* 提前预定 */}
          <RuleRow label="提前预定">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={23}
                className="h-8 w-24 text-[13px]"
                value={rules.advanceBookingHours}
                onChange={(e) =>
                  persistRules({ ...rules, advanceBookingHours: Number(e.target.value) || 0 })
                }
              />
              <span className="text-[12px] text-muted-foreground">
                小时 (请填写0-23之间的数字)
              </span>
            </div>
          </RuleRow>
            </TabsContent>

            <TabsContent value="markup" className="mt-4">
          {/* 加价规则 */}
          <RuleRow label="加价规则">
            <div className="border border-border/50 rounded-md overflow-x-auto">
              <table className="w-full text-[12px] min-w-[860px]">
                <thead className="bg-muted/40">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-2 py-2 font-medium">数据渠道</th>
                    <th className="px-2 py-2 font-medium">价格区间</th>
                    <th className="px-2 py-2 font-medium">早餐</th>
                    <th className="px-2 py-2 font-medium">日期</th>
                    <th className="px-2 py-2 font-medium">节假日</th>
                    <th className="px-2 py-2 font-medium">关键词</th>
                    <th className="px-2 py-2 font-medium">加价</th>
                    <th className="px-2 py-2 font-medium">优先级</th>
                    <th className="px-2 py-2 font-medium w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.markupRules.map((r) => (
                    <tr key={r.id} className="border-t border-border/40 align-middle">
                      <td className="px-2 py-2">{r.channel || "-"}</td>
                      <td className="px-2 py-2">{r.priceMin} ~ {r.priceMax}</td>
                      <td className="px-2 py-2">
                        {r.breakfastMode === "any"
                          ? "不限"
                          : r.breakfastCounts.length
                          ? r.breakfastCounts.join("/")
                          : "-"}
                      </td>
                      <td className="px-2 py-2">{summarizeDate(r)}</td>
                      <td className="px-2 py-2">
                        {r.holidayMode === "include"
                          ? "包含"
                          : r.holidayMode === "exclude"
                          ? "排除"
                          : "不限"}
                      </td>
                      <td className="px-2 py-2 max-w-[140px] truncate">
                        {[r.brandKeyword, r.roomKeyword].filter(Boolean).join(" / ") || "-"}
                      </td>
                      <td className="px-2 py-2">
                        {r.markupPercent}% {r.markupFixed >= 0 ? "+" : ""}{r.markupFixed}
                      </td>
                      <td className="px-2 py-2">{r.priority}</td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px]"
                            onClick={() => {
                              setEditingMarkup(r);
                              setMarkupOpen(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] text-destructive hover:text-destructive"
                            onClick={() => {
                              persistRules({
                                ...rules,
                                markupRules: rules.markupRules.filter((x) => x.id !== r.id),
                              });
                            }}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rules.markupRules.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-2 py-6 text-center text-muted-foreground">
                        暂无规则
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[12px]"
                onClick={() => {
                  setEditingMarkup(null);
                  setMarkupOpen(true);
                }}
              >
                添加规则
              </Button>
              <span className="text-[11px] text-primary cursor-help">ⓘ 规则说明</span>
            </div>
          </RuleRow>
            </TabsContent>

            <TabsContent value="block" className="mt-4">
          {/* 屏蔽规则 */}
          <RuleRow label="屏蔽规则">
            {rules.blockRules.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">暂无规则</p>
            ) : (
              <ul className="text-[12px] space-y-1">
                {rules.blockRules.map((r) => (
                  <li key={r.id} className="flex items-center justify-between border border-border/40 rounded px-2 py-1">
                    <span>{r.supplier} · {r.channel} · {r.hotelTag} — {r.reason}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] text-destructive"
                      onClick={() =>
                        persistRules({
                          ...rules,
                          blockRules: rules.blockRules.filter((x) => x.id !== r.id),
                        })
                      }
                    >
                      删除
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[12px]"
                onClick={() =>
                  persistRules({
                    ...rules,
                    blockRules: [
                      ...rules.blockRules,
                      { id: `b${Date.now()}`, supplier: "艺龙", channel: "飞猪", hotelTag: "扶摇专用", reason: "暂停售卖", priority: 0 },
                    ],
                  })
                }
              >
                添加规则
              </Button>
              <span className="text-[11px] text-primary cursor-help">ⓘ 规则说明</span>
            </div>
          </RuleRow>
            </TabsContent>

            <TabsContent value="cancel" className="mt-4">
          {/* 取消政策 */}
          <RuleRow label="取消政策">
            <div className="border border-border/50 rounded-md overflow-x-auto">
              <table className="w-full text-[12px] min-w-[600px]">
                <thead className="bg-muted/40">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-2 py-2 font-medium">限制条件</th>
                    <th className="px-2 py-2 font-medium">取消规则</th>
                    <th className="px-2 py-2 font-medium">优先级</th>
                    <th className="px-2 py-2 font-medium w-24">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.cancelRules.map((r, i) => (
                    <tr key={r.id} className="border-t border-border/40">
                      <td className="px-2 py-2">
                        <Input
                          className="h-7 text-[12px]"
                          value={r.condition}
                          onChange={(e) => {
                            const next = [...rules.cancelRules];
                            next[i] = { ...r, condition: e.target.value };
                            persistRules({ ...rules, cancelRules: next });
                          }}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          className="h-7 text-[12px]"
                          value={r.rule}
                          onChange={(e) => {
                            const next = [...rules.cancelRules];
                            next[i] = { ...r, rule: e.target.value };
                            persistRules({ ...rules, cancelRules: next });
                          }}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          className="h-7 w-16 text-[12px]"
                          value={r.priority}
                          onChange={(e) => {
                            const next = [...rules.cancelRules];
                            next[i] = { ...r, priority: Number(e.target.value) || 0 };
                            persistRules({ ...rules, cancelRules: next });
                          }}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] text-destructive hover:text-destructive"
                          onClick={() =>
                            persistRules({
                              ...rules,
                              cancelRules: rules.cancelRules.filter((x) => x.id !== r.id),
                            })
                          }
                        >
                          删除
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {rules.cancelRules.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-2 py-6 text-center text-muted-foreground">
                        暂无规则
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[12px]"
                onClick={() =>
                  persistRules({
                    ...rules,
                    cancelRules: [
                      ...rules.cancelRules,
                      { id: `c${Date.now()}`, condition: "", rule: "不可取消", priority: 0 },
                    ],
                  })
                }
              >
                添加规则
              </Button>
              <span className="text-[11px] text-muted-foreground">ⓘ 规则说明 更改规则后,需联系管理员同步后才会生效</span>
            </div>
          </RuleRow>
            </TabsContent>

            <TabsContent value="auto" className="mt-4">
          {/* 自动下单 */}
          <RuleRow label="自动下单">
            {rules.autoOrderRules.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">不自动下单</p>
            ) : (
              <ul className="text-[12px] space-y-1">
                {rules.autoOrderRules.map((r) => (
                  <li key={r.id} className="flex items-center justify-between border border-border/40 rounded px-2 py-1">
                    <span>{r.condition}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] text-destructive"
                      onClick={() =>
                        persistRules({
                          ...rules,
                          autoOrderRules: rules.autoOrderRules.filter((x) => x.id !== r.id),
                        })
                      }
                    >
                      删除
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[12px]"
                onClick={() =>
                  persistRules({
                    ...rules,
                    autoOrderRules: [
                      ...rules.autoOrderRules,
                      { id: `a${Date.now()}`, condition: "符合条件订单自动下单", enabled: true },
                    ],
                  })
                }
              >
                添加规则
              </Button>
              <span className="text-[11px] text-primary cursor-help">ⓘ 规则说明</span>
            </div>
          </RuleRow>
            </TabsContent>

            <TabsContent value="contact" className="mt-4">
          {/* 下单手机号 */}
          <RuleRow label="下单手机号">
            <div className="flex items-center gap-2">
              <Input
                className="h-8 w-72 text-[13px]"
                placeholder="请填写商家自己的联系方式"
                value={rules.contactPhone}
                onChange={(e) => persistRules({ ...rules, contactPhone: e.target.value })}
              />
              <span className="text-[11px] text-muted-foreground">
                (下单给供应商时使用的联系方式,多个时用英文,隔开,系统会随机选择一个)
              </span>
            </div>
          </RuleRow>
            </TabsContent>

            <TabsContent value="checkin" className="mt-4">
          {/* 入住设置 */}
          <RuleRow label="入住设置">
            <div className="space-y-3">
              <div>
                <p className="text-[12px] font-medium text-foreground mb-1.5">场景一</p>
                <div className="space-y-1.5 ml-2">
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="scene1"
                      checked={!rules.scene1.enabled}
                      onChange={() =>
                        persistRules({ ...rules, scene1: { ...rules.scene1, enabled: false } })
                      }
                    />
                    <span>不设置</span>
                  </label>
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="scene1"
                      checked={rules.scene1.enabled && rules.scene1.mode === "direct"}
                      onChange={() =>
                        persistRules({
                          ...rules,
                          scene1: { ...rules.scene1, enabled: true, mode: "direct" },
                        })
                      }
                    />
                    <span>针对</span>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      className="h-7 w-16 text-[12px]"
                      value={rules.scene1.hour}
                      onChange={(e) =>
                        persistRules({
                          ...rules,
                          scene1: { ...rules.scene1, hour: Number(e.target.value) || 0 },
                        })
                      }
                    />
                    <span>点后确认有房的当日入住订单,在订单确认后立即标记入住</span>
                  </label>
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="scene1"
                      checked={rules.scene1.enabled && rules.scene1.mode === "ifNonCancelable"}
                      onChange={() =>
                        persistRules({
                          ...rules,
                          scene1: { ...rules.scene1, enabled: true, mode: "ifNonCancelable" },
                        })
                      }
                    />
                    <span>针对</span>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      className="h-7 w-16 text-[12px]"
                      value={rules.scene1.hour}
                      onChange={(e) =>
                        persistRules({
                          ...rules,
                          scene1: { ...rules.scene1, hour: Number(e.target.value) || 0 },
                        })
                      }
                    />
                    <span>点后确认有房的当日入住订单,如果其采购的供应商订单当前时间不可取消,则在订单确认后立即标记入住</span>
                  </label>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-foreground mb-1.5">场景二</p>
                <div className="space-y-1.5 ml-2">
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="scene2"
                      checked={!rules.scene2.enabled}
                      onChange={() =>
                        persistRules({ ...rules, scene2: { ...rules.scene2, enabled: false } })
                      }
                    />
                    <span>不设置</span>
                  </label>
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="scene2"
                      checked={rules.scene2.enabled}
                      onChange={() =>
                        persistRules({ ...rules, scene2: { ...rules.scene2, enabled: true } })
                      }
                    />
                    <span>所有订单在入住日的</span>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      className="h-7 w-16 text-[12px]"
                      value={rules.scene2.hour}
                      onChange={(e) =>
                        persistRules({
                          ...rules,
                          scene2: { ...rules.scene2, hour: Number(e.target.value) || 0 },
                        })
                      }
                    />
                    <span>点将标记为入住,预定时间在设置的时间之后的当日住订单将在订单确认有房后立即标记成入住</span>
                  </label>
                </div>
              </div>
            </div>
          </RuleRow>
            </TabsContent>
          </Tabs>

          <p className="text-[11px] text-muted-foreground">规则修改将自动保存</p>
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

      {/* 加价规则弹框 */}
      <MarkupRuleDialog
        open={markupOpen}
        onOpenChange={setMarkupOpen}
        initial={editingMarkup}
        onSave={saveMarkupRule}
      />
    </div>
  );
}

function summarizeDate(r: MarkupRule): string {
  switch (r.dateMode) {
    case "range":
      if (r.dateRange?.from || r.dateRange?.to) {
        return `${r.dateRange?.from || "…"} ~ ${r.dateRange?.to || "…"}`;
      }
      return "时间范围";
    case "monthly":
      return r.monthlyDays.length ? `每月 ${r.monthlyDays.join(",")}` : "每月";
    case "weekly": {
      const W = ["日", "一", "二", "三", "四", "五", "六"];
      return r.weeklyDays.length
        ? `每周 ${r.weeklyDays.map((d) => W[d]).join(",")}`
        : "每周";
    }
    case "specific":
      return r.specificDates.length ? `指定 ${r.specificDates.length} 天` : "指定日期";
    default:
      return "-";
  }
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

function RuleRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-4 items-start">
      <div className="text-[12.5px] font-medium text-foreground pt-2 text-right">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
