import { setRequestLocale } from "next-intl/server";
import { PublicMenu } from "@/components/public/PublicMenu";
import { getMenuData } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { categories, items, settings } = await getMenuData(locale);

  return <PublicMenu categories={categories} items={items} settings={settings} />;
}
