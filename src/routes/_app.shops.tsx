import { createFileRoute } from "@tanstack/react-router";
import { ShopManagement } from "@/components/ShopManagement";

export const Route = createFileRoute("/_app/shops")({
  head: () => ({
    meta: [
      { title: "店铺管理 — 酒店SaaS管理平台" },
      { name: "description", content: "管理店铺地域、渠道、API配置" },
    ],
  }),
  component: ShopManagement,
});
