import { createFileRoute } from "@tanstack/react-router";
import { HotelDetail } from "@/components/HotelDetail";

export const Route = createFileRoute("/_app/data-pool/$hotelId")({
  head: () => ({
    meta: [
      { title: "酒店详情 — 酒店SaaS管理平台" },
    ],
  }),
  component: HotelDetailPage,
});

function HotelDetailPage() {
  const { hotelId } = Route.useParams();
  return <HotelDetail hotelId={hotelId} />;
}
