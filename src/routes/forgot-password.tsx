import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "修改密码 — HotelOS" }] }),
  component: ForgotPasswordPage,
});

const BG_IMG =
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1920&q=80";
const FIXED_CODE = "123456";

type Step = 1 | 2 | 3 | 4;

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const sentRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("请输入正确的邮箱");
      return;
    }
    setCooldown(60);
    sentRef.current = true;
    toast.success(`验证码已发送至 ${email}（演示固定为 ${FIXED_CODE}）`);
  };

  const next1 = () => {
    if (!sentRef.current) {
      toast.error("请先获取验证码");
      return;
    }
    if (code !== FIXED_CODE) {
      toast.error("验证码错误");
      return;
    }
    setStep(2);
  };

  const next2 = async () => {
    if (pwd.length < 6) {
      toast.error("密码至少 6 位");
      return;
    }
    if (pwd !== pwd2) {
      toast.error("两次密码不一致");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, pwd);
      setStep(3);
      toast.success("密码已修改");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div
        className="hidden lg:block relative bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMG})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-black/40 to-black/60" />
        <div className="relative z-10 h-full flex flex-col justify-end p-10 text-white">
          <h1 className="text-3xl font-bold leading-tight max-w-md">
            找回您的账号访问权限
          </h1>
          <p className="mt-3 text-sm text-white/80 max-w-md">
            通过邮箱验证安全地重置您的登录密码。
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link
            to="/login"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground gap-1 mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 返回登录
          </Link>

          {/* 步骤指示 */}
          <div className="flex items-center gap-1.5 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step >= s ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">验证邮箱</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                我们将向您的邮箱发送验证码
              </p>

              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-10 pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">邮箱验证码</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="6 位验证码"
                        className="h-10 pl-8"
                        maxLength={6}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 shrink-0 w-28"
                      onClick={sendCode}
                      disabled={cooldown > 0}
                    >
                      {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                    </Button>
                  </div>
                </div>

                <Button className="w-full h-10" onClick={next1}>
                  下一步
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">设置新密码</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                请输入并确认您的新密码
              </p>
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="password"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      className="h-10 pl-8"
                      placeholder="至少 6 位"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">确认新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="password"
                      value={pwd2}
                      onChange={(e) => setPwd2(e.target.value)}
                      className="h-10 pl-8"
                      placeholder="再次输入新密码"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-10" onClick={() => setStep(1)}>
                    上一步
                  </Button>
                  <Button className="flex-1 h-10" onClick={next2} disabled={loading}>
                    {loading ? "提交中..." : "确认修改"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="mx-auto h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h2 className="mt-4 text-2xl font-bold">修改成功</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                您的密码已更新，请使用新密码登录
              </p>
              <Button
                className="mt-6 w-full h-10"
                onClick={() => navigate({ to: "/login" })}
              >
                前往登录
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
