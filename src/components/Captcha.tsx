import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { RefreshCw } from "lucide-react";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(len = 4) {
  let s = "";
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}

export interface CaptchaHandle {
  refresh: () => void;
  verify: (input: string) => boolean;
  getCode: () => string;
}

export const Captcha = forwardRef<CaptchaHandle, { width?: number; height?: number }>(
  ({ width = 110, height = 36 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [code, setCode] = useState(() => randomCode());

    const draw = (text: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      // 背景
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, width, height);

      // 干扰线
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `hsl(${Math.random() * 360},60%,70%)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
      }
      // 干扰点
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360},60%,60%)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // 字符
      const charW = width / text.length;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const fontSize = 20 + Math.floor(Math.random() * 4);
        ctx.font = `700 ${fontSize}px "Inter", system-ui, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = `hsl(${Math.random() * 360},70%,40%)`;
        const x = i * charW + charW / 2;
        const y = height / 2;
        const angle = (Math.random() - 0.5) * 0.5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(ch, -fontSize / 2 + 2, 0);
        ctx.restore();
      }
    };

    const refresh = () => {
      const next = randomCode();
      setCode(next);
    };

    useEffect(() => {
      draw(code);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    useImperativeHandle(ref, () => ({
      refresh,
      verify: (input: string) => input.trim().toUpperCase() === code.toUpperCase(),
      getCode: () => code,
    }));

    return (
      <button
        type="button"
        onClick={refresh}
        title="点击刷新验证码"
        className="relative group rounded-md overflow-hidden border border-input shrink-0"
      >
        <canvas ref={canvasRef} />
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
          <RefreshCw className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
        </span>
      </button>
    );
  }
);
Captcha.displayName = "Captcha";
