import { getHeaderNav } from "@/lib/queries";
import HeaderClient from "./HeaderClient";

export default async function SiteHeader({ active }: { active?: string }) {
  const items = await getHeaderNav();
  return <HeaderClient items={items} active={active} />;
}
