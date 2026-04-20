import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Captcha, type CaptchaHandle } from "@/components/Captcha";
import { useAuth } from "@/lib/auth-context";
import { Hotel, Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "登录 — HotelOS" }],
  }),
  component: LoginPage,
});

const BG_IMG =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const captchaRef = useRef<CaptchaHandle>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("请填写邮箱和密码");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("邮箱格式不正确");
      return;
    }
    if (!captchaRef.current?.verify(captcha)) {
      toast.error("验证码错误");
      captchaRef.current?.refresh();
      setCaptcha("");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("登录成功");
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* 左侧背景图 */}
      <div
        className="hidden lg:block relative bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMG})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Hotel className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold">HotelOS</div>
              <div className="text-[11px] text-white/80">酒店运营管理平台</div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight max-w-md">
              一站式酒店多渠道运营平台
            </h1>
            <p className="mt-3 text-sm text-white/80 max-w-md">
              统一管理携程、美团、飞猪等多平台店铺，订单、价格、数据，全流程可视化。
            </p>
          </div>
        </div>
      </div>

      {/* 右侧表单 */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-7 lg:hidden flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Hotel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">HotelOS</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">欢迎回来</h2>
          <p className="text-sm text-muted-foreground mt-1.5">登录您的账号继续使用</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-10 pl-8"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">密码</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="h-10 pl-8"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="captcha" className="text-xs">图形验证码</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <ShieldCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="captcha"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    placeholder="请输入右侧验证码"
                    className="h-10 pl-8 uppercase"
                    maxLength={4}
                  />
                </div>
                <Captcha ref={captchaRef} />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                忘记密码？
              </Link>
            </div>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "登录中..." : "登 录"}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground">
              © {new Date().getFullYear()} HotelOS · 演示环境，任意邮箱密码可登录
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
