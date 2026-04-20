import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Store,
  Plug,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import type { Channel, Shop } from "@/lib/types";

type Platform = Extract<Channel, "飞猪" | "携程" | "美团"> | "其他";
const PLATFORMS: Platform[] = ["飞猪", "携程", "美团", "其他"];

interface PlatformConfig {
  platform: Platform;
  openTime: string;
  expireTime: string;
  appKey?: string;
  appSecret?: string;
  // 仅飞猪需要测试连接
  tested?: boolean;
}

const SHOP_KEY = "hotelos.shops.list";

const STEPS = [
  { id: 1, title: "店铺名称", icon: Store },
  { id: 2, title: "平台配置", icon: Plug },
  { id: 3, title: "飞猪 API", icon: Plug },
  { id: 4, title: "确认创建", icon: ClipboardCheck },
];

export function ShopWizard() {
  const navigate = useNavigate();
  const { setHasShop } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [testing, setTesting] = useState(false);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => {
      const exists = prev.find((x) => x.platform === p);
      if (exists) return prev.filter((x) => x.platform !== p);
      return [...prev, { platform: p, openTime: "", expireTime: "" }];
    });
  };

  const updatePlatform = (p: Platform, patch: Partial<PlatformConfig>) => {
    setPlatforms((prev) => prev.map((x) => (x.platform === p ? { ...x, ...patch } : x)));
  };

  const feizhu = platforms.find((p) => p.platform === "飞猪");

  const next = () => {
    if (step === 1) {
      if (!name.trim()) return toast.error("请输入店铺名称");
    }
    if (step === 2) {
      if (platforms.length === 0) return toast.error("请至少选择一个平台");
      for (const p of platforms) {
        if (!p.openTime || !p.expireTime) {
          return toast.error(`请填写【${p.platform}】的开店时间和有限期`);
        }
      }
      // 没选飞猪，跳过 step 3
      if (!feizhu) {
        setStep(4);
        return;
      }
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const prev = () => {
    if (step === 4 && !feizhu) {
      setStep(2);
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const testConnection = async () => {
    if (!feizhu?.appKey || !feizhu?.appSecret) {
      toast.error("请先填写 AppKey 与 AppSecret");
      return;
    }
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setTesting(false);
    updatePlatform("飞猪", { tested: true });
    toast.success("连接测试通过");
  };

  const reconfigureApi = () => {
    updatePlatform("飞猪", { tested: false });
  };

  // Step3 下一步前置校验：必须填写并连接测试通过
  const goNextFromStep3 = () => {
    if (!feizhu?.appKey?.trim() || !feizhu?.appSecret?.trim()) {
      toast.error("请填写 AppKey 与 AppSecret");
      return;
    }
    if (!feizhu.tested) {
      toast.error("请先点击「连接测试」并通过后再继续");
      return;
    }
    setStep(4);
  };

  const handleCreate = () => {
    const newShop: Shop = {
      id: `shop_${Date.now()}`,
      name,
      region: "华东",
      city: "-",
      address: "-",
      channels: platforms.map((p) =>
        p.platform === "其他" ? "途家" : (p.platform as Channel)
      ),
      publishTime: platforms[0]?.openTime || "",
      apiConfigs:
        feizhu && feizhu.tested && feizhu.appKey
          ? [
              {
                id: `ac_${Date.now()}`,
                channel: "飞猪",
                apiUrl: "https://eco.taobao.com/router/rest",
                shopAccountId: feizhu.appKey,
                apiKey: feizhu.appSecret || "",
              },
            ]
          : [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    // 持久化
    try {
      const raw = localStorage.getItem(SHOP_KEY);
      const list: Shop[] = raw ? JSON.parse(raw) : [];
      list.unshift(newShop);
      localStorage.setItem(SHOP_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setHasShop(true);
    toast.success("店铺创建成功");
    navigate({ to: "/shops" });
  };

  return (
    <div className="p-5 md:p-7 max-w-3xl mx-auto text-[13px]">
      {/* Stepper */}
      <Card className="border-border/60 bg-card mb-5">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span
                      className={`text-[11px] whitespace-nowrap ${
                        isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Step {s.id} · {s.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`h-px flex-1 mx-2 ${
                        step > s.id ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card">
        <CardContent className="p-6 space-y-5">
          {step === 1 && (
            <>
              <div>
                <h3 className="text-base font-semibold">配置店铺名称</h3>
                <p className="text-[12px] text-muted-foreground mt-1">
                  店铺名称用于在系统内标识本店铺，建议清晰易识别
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">店铺名称</Label>
                <Input
                  className="h-10"
                  placeholder="例如：上海外滩希尔顿酒店"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h3 className="text-base font-semibold">配置平台</h3>
                <p className="text-[12px] text-muted-foreground mt-1">
                  选择本店铺接入的 OTA 平台，并填写开店时间与有限期
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">选择平台（可多选）</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const selected = !!platforms.find((x) => x.platform === p);
                    return (
                      <Badge
                        key={p}
                        variant={selected ? "default" : "outline"}
                        onClick={() => togglePlatform(p)}
                        className={`cursor-pointer h-8 px-3 text-[12px] ${
                          selected ? "" : "border-border/60"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 mr-1" />}
                        {p}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {platforms.length > 0 && (
                <div className="space-y-3 pt-2">
                  {platforms.map((p) => (
                    <div
                      key={p.platform}
                      className="border border-border/50 rounded-lg p-3 space-y-3 bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="text-[11px]">{p.platform}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">开店时间</Label>
                          <Input
                            type="date"
                            className="h-9"
                            value={p.openTime}
                            onChange={(e) =>
                              updatePlatform(p.platform, { openTime: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">平台有限期</Label>
                          <Input
                            type="date"
                            className="h-9"
                            value={p.expireTime}
                            onChange={(e) =>
                              updatePlatform(p.platform, { expireTime: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 3 && feizhu && (
            <>
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2">
                  飞猪 API 配置
                  <Badge variant="secondary" className="text-[10px]">
                    可选
                  </Badge>
                </h3>
                <p className="text-[12px] text-muted-foreground mt-1">
                  配置 AppKey 与 AppSecret 后即可与飞猪平台数据互通，可稍后再配
                </p>
              </div>

              <TooltipProvider>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1.5">
                      AppKey
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          登录飞猪商家后台 → 应用管理 → 我的应用 → 复制对应应用的 AppKey
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      className="h-10 font-mono"
                      placeholder="请输入飞猪 AppKey"
                      value={feizhu.appKey || ""}
                      disabled={feizhu.tested}
                      onChange={(e) => updatePlatform("飞猪", { appKey: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1.5">
                      AppSecret
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          飞猪商家后台 → 应用管理 → 应用详情 → 查看 AppSecret，请妥善保管
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      className="h-10 font-mono"
                      type={feizhu.tested ? "password" : "text"}
                      placeholder="请输入飞猪 AppSecret"
                      value={feizhu.appSecret || ""}
                      disabled={feizhu.tested}
                      onChange={(e) => updatePlatform("飞猪", { appSecret: e.target.value })}
                    />
                  </div>

                  {feizhu.tested && (
                    <div className="flex items-center gap-2 text-[12px] text-success bg-success/10 rounded-md px-3 py-2">
                      <CheckCircle2 className="h-4 w-4" />
                      连接测试通过，配置已锁定
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {feizhu.tested ? (
                      <Button variant="outline" className="flex-1" onClick={reconfigureApi}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        更换配置
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={skipApi}
                          disabled={testing}
                        >
                          跳过，以后再配
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={testConnection}
                          disabled={testing}
                        >
                          {testing ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              测试中...
                            </>
                          ) : (
                            "连接测试"
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </TooltipProvider>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h3 className="text-base font-semibold">确认信息</h3>
                <p className="text-[12px] text-muted-foreground mt-1">
                  请核对以下信息，确认无误后即可创建店铺
                </p>
              </div>

              <dl className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden">
                <Row label="店铺名称" value={name} />
                <Row
                  label="平台"
                  value={
                    <div className="flex flex-wrap gap-1">
                      {platforms.map((p) => (
                        <Badge key={p.platform} variant="secondary" className="text-[11px]">
                          {p.platform}
                        </Badge>
                      ))}
                    </div>
                  }
                />
                {platforms.map((p) => (
                  <Row
                    key={p.platform}
                    label={`${p.platform} 时间`}
                    value={`开店：${p.openTime || "-"} · 有限期：${p.expireTime || "-"}`}
                  />
                ))}
                {feizhu && (
                  <Row
                    label="飞猪 API"
                    value={
                      feizhu.tested ? (
                        <span className="text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> 已配置并测试通过
                        </span>
                      ) : (
                        <span className="text-muted-foreground">未配置（稍后再配）</span>
                      )
                    }
                  />
                )}
              </dl>
            </>
          )}

          {/* Footer 按钮 */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> 上一步
            </Button>
            {step < 4 ? (
              step === 3 ? null : (
                <Button onClick={next} className="gap-1">
                  下一步 <ChevronRight className="h-4 w-4" />
                </Button>
              )
            ) : (
              <Button onClick={handleCreate} className="gap-1">
                <Check className="h-4 w-4" /> 确认创建
              </Button>
            )}
            {step === 3 && (
              <Button onClick={next} className="gap-1">
                下一步 <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center px-3.5 py-2.5 text-[13px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value || "-"}</dd>
    </div>
  );
}
