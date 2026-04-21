import { createFileRoute } from "@tanstack/react-router";
import { DataPool } from "@/components/DataPool";

export const Route = createFileRoute("/_app/data-pool/")({
  head: () => ({
    meta: [
      { title: "数据池 — 酒店SaaS管理平台" },
      { name: "description", content: "查看和管理从各渠道获取的酒店民宿数据" },
    ],
  }),
  component: DataPool,
});
