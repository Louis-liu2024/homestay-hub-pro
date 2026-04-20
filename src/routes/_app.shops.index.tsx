import { createFileRoute } from "@tanstack/react-router";
import { ShopList } from "@/components/ShopList";

export const Route = createFileRoute("/_app/shops/")({
  head: () => ({
    meta: [
      { title: "店铺列表 — 酒店SaaS管理平台" },
      { name: "description", content: "管理多渠道店铺" },
    ],
  }),
  component: ShopList,
});
