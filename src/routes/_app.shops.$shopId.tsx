import { createFileRoute } from "@tanstack/react-router";
import { ShopDetail } from "@/components/ShopDetail";

export const Route = createFileRoute("/_app/shops/$shopId")({
  head: () => ({
    meta: [{ title: "店铺详情 — 酒店SaaS管理平台" }],
  }),
  component: ShopDetail,
});
