import referenceContent from "../reference-content.json";
import { prisma } from "../lib/prisma";
import { syncLegacyBrandFields } from "../lib/brand-translations";

const TARGET_LANGS = ["en", "ar", "zh", "ru", "tr"] as const;
type TargetLang = (typeof TARGET_LANGS)[number];

type ItemText = { name: string; description: string; ingredients: string };

const CATEGORY_BY_FA: Record<string, Record<TargetLang, string>> = {
  "نوشیدنی گرم": {
    en: "Hot Drinks",
    ar: "مشروبات ساخنة",
    zh: "热饮",
    ru: "Горячие напитки",
    tr: "Sicak Icecekler",
  },
  "شکلات گرم": {
    en: "Hot Chocolate",
    ar: "شوكولاتة ساخنة",
    zh: "热巧克力",
    ru: "Горячий шоколад",
    tr: "Sicak Cikolata",
  },
  "کیک و شیرینی": {
    en: "Cakes and Pastries",
    ar: "الكيك والحلويات",
    zh: "蛋糕与甜点",
    ru: "Торты и сладости",
    tr: "Kek ve Tatlilar",
  },
};

const BRAND_BY_LANG: Record<TargetLang, { cafeName: string; tagline: string }> = {
  en: { cafeName: "Khane Madari Cafe", tagline: "Khane Madari Cafe" },
  ar: { cafeName: "مقهى خانه مادري", tagline: "مقهى خانه مادري" },
  zh: { cafeName: "Khane Madari 咖啡馆", tagline: "Khane Madari 咖啡馆" },
  ru: { cafeName: "Кафе Khane Madari", tagline: "Кафе Khane Madari" },
  tr: { cafeName: "Khane Madari Kafe", tagline: "Khane Madari Kafe" },
};

const PLACE_BY_LANG: Record<TargetLang, { title: string; address: string }> = {
  en: {
    title: "Address",
    address:
      "6 Najafi Alley, Fazaeli Alley, Farshadi Street, Ostandari Street, Isfahan, Iran",
  },
  ar: {
    title: "العنوان",
    address:
      "إيران، أصفهان، شارع الاستاندارية، شارع فرشادي، زقاق فضائلي، زقاق نجفي، رقم 6",
  },
  zh: {
    title: "地址",
    address:
      "伊朗伊斯法罕省，伊斯法罕市，奥斯坦达里大街，法尔沙迪街，法扎伊利小巷，纳贾菲小巷，6号",
  },
  ru: {
    title: "Адрес",
    address:
      "Иран, г. Исфахан, ул. Эстандари, ул. Фаршади, пер. Фазаели, пер. Наджафи, д. 6",
  },
  tr: {
    title: "Adres",
    address:
      "Iran, Isfahan, Ostandari Caddesi, Farsadi Caddesi, Fazaeli Sokagi, Necafi Sokagi, No: 6",
  },
};

const ITEM_BY_FA: Record<string, Record<TargetLang, ItemText>> = {
  "شکلات شیری": L("Milk Chocolate", "شوكولاتة بالحليب", "牛奶巧克力", "Молочный шоколад", "Sutlu Cikolata"),
  "شکلات دارک 70%": L("Dark Chocolate 70%", "شوكولاتة داكنة 70%", "70% 黑巧克力", "Темный шоколад 70%", "Bitter Cikolata %70"),
  اسپرسو: L("Espresso", "اسبرesso", "浓缩咖啡", "Эспрессо", "Espresso"),
  "اسپرسو 100% عربیکا": L("Espresso 100% Arabica", "اسبرesso 100% arabica", "100% 阿拉比卡浓缩咖啡", "Эспрессо 100% Arabica", "Espresso %100 Arabica"),
  "قهوه دمی": L("Brewed Coffee", "قهوة مفلترة", "手冲咖啡", "Заварной кофе", "Demleme Kahve"),
  آمریکانو: D("Americano", "Espresso + hot water", "Americano", "اسpresso + ماء ساخن", "美式咖啡", "浓缩咖啡 + 热水", "Америкano", "Эспрессо + горячая вода", "Americano", "Espresso + sicak su"),
  کاپوچینو: D("Cappuccino", "Espresso + milk + milk foam", "Cappuccino", "اسpresso + حليب + رغوة حليب", "卡布奇诺", "浓缩咖啡 + 牛奶 + 奶泡", "Капучино", "Эспрессо + молоко + молочная пена", "Kapuccino", "Espresso + sut + sut kopugu"),
  "لاته (اسپرسو+شیر)": D("Latte", "Espresso + milk", "Latte", "اسpresso + حليب", "拿铁", "浓缩咖啡 + 牛奶", "Латте", "Эспрессо + молоко", "Latte", "Espresso + sut"),
  "ماچا نارگیل": D("Coconut Matcha", "Milk + matcha + coconut", "Matcha بالجوز الهند", "حليب + ماتشا + جوز الهند", "椰子抹茶", "牛奶 + 抹茶 + 椰子", "Кокосовый матча", "Молоко + матча + кокос", "Hindistan Cevizli Matcha", "Sut + matcha + hindistan cevizi"),
  "ماچا لاته (شیر+ماچا)": D("Matcha Latte", "Milk + matcha", "Matcha Latte", "حليب + ماتشا", "抹茶拿铁", "牛奶 + 抹茶", "Матча латте", "Молоко + матча", "Matcha Latte", "Sut + matcha"),
  "لاته نارگیل": D("Coconut Latte", "Espresso + milk + coconut", "Latte بالجوز الهند", "اسpresso + حليب + جوز الهند", "椰子拿铁", "浓缩咖啡 + 牛奶 + 椰子", "Кокосовый латте", "Эспрессо + молоко + кокос", "Hindistan Cevizli Latte", "Espresso + sut + hindistan cevizi"),
  "لاته پسته": D("Pistachio Latte", "Espresso + milk + pistachio", "Latte بالفستق", "اسpresso + حليب + فستق", "开心果拿铁", "浓缩咖啡 + 牛奶 + 开心果", "Фисташковый латте", "Эспрессо + молоко + фисташки", "Antep Fistigi Latte", "Espresso + sut + antep fistigi"),
  "لاته فندق": D("Hazelnut Latte", "Espresso + milk + hazelnut", "Latte بالبندق", "اسpresso + حليب + بندق", "榛果拿铁", "浓缩咖啡 + 牛奶 + 榛果", "Латте с фундуком", "Эспрессо + молоко + фундук", "Findikli Latte", "Espresso + sut + findik"),
  کورتادو: D("Cortado", "Espresso + a small amount of milk", "Cortado", "اسpresso + كمية قليلة من الحليب", "科尔塔多", "浓缩咖啡 + 少量牛奶", "Кортado", "Эспрессо + немного молока", "Cortado", "Espresso + az miktarda sut"),
  "کارامل ماکیاتو": D("Caramel Macchiato", "Espresso + milk + caramel", "Caramel Macchiato", "اسpresso + حليب + كaramel", "焦糖玛奇朵", "浓缩咖啡 + 牛奶 + 焦糖", "Карамельный макиato", "Эспрессо + молоко + карамель", "Karamel Macchiato", "Espresso + sut + karamel"),
  موکا: D("Mocha", "Espresso + milk + chocolate", "Mocha", "اسpresso + حليب + شوكولاتة", "摩卡", "浓缩咖啡 + 牛奶 + 巧克力", "Мокка", "Эспрессо + молоко + шоколад", "Mocha", "Espresso + sut + cikolata"),
  "موکا شکلات سفید": D("White Chocolate Mocha", "Espresso + milk + white chocolate", "Mocha بالشوكولاتة البيضاء", "اسpresso + حليب + شوكولاتة بيضاء", "白巧克力摩卡", "浓缩咖啡 + 牛奶 + 白巧克力", "Мокка с белым шоколадом", "Эспрессо + молоко + белый шоколад", "Beyaz Cikolatali Mocha", "Espresso + sut + beyaz cikolata"),
  "موکا پرالین فندق": D("Hazelnut Praline Mocha", "Espresso + milk + chocolate + hazelnut praline", "Mocha Praline بالبندق", "اسpresso + حليب + شوكولاتة + praline بندق", "榛果 praline 摩卡", "浓缩咖啡 + 牛奶 + 巧克力 + 榛果 praline", "Мокка с фундуковым praline", "Эспрессо + молоко + шоколад + фундуковый praline", "Findik Pralinli Mocha", "Espresso + sut + cikolata + findik pralin"),
  "قهوه پارسی": D("Persian Coffee", "Coffee + saffron + cardamom", "قهوة فارسية", "قهوة + زعفران + هيل", "波斯咖啡", "咖啡 + 藏红花 + 小豆蔻", "Персидский кофе", "Кофе + шафран + кардамон", "Fars Kahvesi", "Kahve + safran + kakule"),
  "چای لاته (ماسالا)": L("Masala Chai Latte", "Masala Chai Latte", "Masala Chai Latte", "Masala Chai Latte", "Masala Chai Latte"),
  "سوهان نوش": D("Sohan Drink", "A blend inspired by Sohan flavors", "مشروب سوهان", "مزيج مستوحى من نكهات السوهان", "Sohan 风味饮品", "灵感来自 Sohan 风味的特调", "Напиток Sohan", "Смесь с нотами Sohan", "Sohan Icecegi", "Sohan lezzetlerinden ilham alan karisim"),
  "شکلات فندق": L("Hazelnut Chocolate", "شوكولاتة بالبندق", "榛果巧克力", "Шоколад с фундуком", "Findikli Cikolata"),
  "شکلات چای": L("Chocolate Tea", "شاي بالشوكولاتة", "巧克力茶", "Шоколадный чай", "Cikolatali Cay"),
  "شکلات مارشمالو": L("Chocolate Marshmallow", "شوكولاتة marshmallow", "棉花糖巧克力", "Шоколад с marshmallow", "Marshmallow Cikolata"),
  "شکلات زیرو": D("Sugar-Free Chocolate", "Sugar free", "شوكولاتة بدون سكر", "بدون سكر", "无糖巧克力", "无糖", "Шоколад без сахара", "Без сахара", "Sekersiz Cikolata", "Sekersiz"),
  "گلت سیب": L("Apple Galette", "Galette التفاح", "苹果 galette", "Яблочный galette", "Elmali Galette"),
  "کیک عسل": L("Honey Cake", "كعكة العسل", "蜂蜜蛋糕", "Медовый торт", "Bal Keki"),
  "کروسان شکلات فندق": L("Hazelnut Chocolate Croissant", "كرواسون شوكولاتة وبندق", "榛果巧克力可颂", "Круассан с шоколадом и фундуком", "Findikli Cikolatali Kruvasan"),
  "کوکی کارامل": L("Caramel Cookie", "كوكيز الكaramيل", "焦糖饼干", "Карамельное печенье", "Karamel Kurabiye"),
  "کوکی جو دوسرپرک": L("Oatmeal Cookie", "كوكيز الشوفان", "燕麦饼干", "Овсяное печенье", "Yulaf Kurabiyesi"),
  "کوکی فندق-شکلات": L("Hazelnut-Chocolate Cookie", "كوكيز البندق والشوكولاتة", "榛果巧克力饼干", "Печенье с фундуком и шоколадом", "Findikli Cikolatali Kurabiye"),
  "کوکی پرتقال": L("Orange Cookie", "كوكيز البرتقال", "橙子饼干", "Апельсиновое печенье", "Portakalli Kurabiye"),
  "کوکی جاینت پسته": L("Pistachio Giant Cookie", "كوكيز الفستق الكبيرة", "开心果 giant 饼干", "Большое печенье с фисташками", "Dev Antep Fistigi Kurabiyesi"),
  "لوف پسته": L("Pistachio Loaf Cake", "كيك الفستق", "开心果磅蛋糕", "Фисташковый кекс", "Antep Fistigi Kek"),
  "لوف بادام-پرتقال": L("Almond-Orange Loaf Cake", "كيك اللوز والبرتقال", "杏仁橙子磅蛋糕", "Миндально-апельсиновый кекс", "Badem-Portakalli Kek"),
  "لوف شکلات-فندق": L("Hazelnut-Chocolate Loaf Cake", "كيك الشوكولاتة والبندق", "榛果巧克力磅蛋糕", "Шоколадно-фунduковый кекс", "Findikli Cikolatali Kek"),
  "کیک شکلاتی": L("Chocolate Cake", "كيك الشوكولاتة", "巧克力蛋糕", "Шоколадный торт", "Cikolatali Kek"),
  "کروسان پسته": L("Pistachio Croissant", "كرواسون الفستق", "开心果可颂", "Фисташковый круассан", "Antep Fistigi Kruvasan"),
  کروسان: L("Croissant", "كرواسون", "可颂", "Круассан", "Kruvasan"),
  "چیزکیک تافی بادام زمینی": L("Toffee Peanut Cheesecake", "تشيزكيك التوفي والفول السوداني", "太妃花生芝士蛋糕", "Тоффи-арахисовый чизкейк", "Toffee Yer Fistigi Cheesecake"),
  "چیزکیک سن سباستین": L("San Sebastian Cheesecake", "تشيزكيك سان سباستيان", "圣塞巴斯蒂安芝士蛋糕", "Чизкейк San Sebastian", "San Sebastian Cheesecake"),
  "دسر شیر و پسته": L("Milk & Pistachio Dessert", "حلوى الحليب والفستق", "牛奶开心果甜点", "Десерт с молоком и фисташками", "Sutlu Antep Fistigi Tatlisi"),
  "شکلات ماداگاسکار": L("Madagascar Chocolate", "شوكولاتة مدغascar", "马达加斯加巧克力", "Мadagascar шоколад", "Madagaskar Cikolatasi"),
};

function text(name: string, description = name, ingredients = name): ItemText {
  return { name, description, ingredients };
}

function L(en: string, ar: string, zh: string, ru: string, trName: string) {
  return {
    en: text(en),
    ar: text(ar),
    zh: text(zh),
    ru: text(ru),
    tr: text(trName),
  };
}

function D(
  enName: string,
  enDesc: string,
  arName: string,
  arDesc: string,
  zhName: string,
  zhDesc: string,
  ruName: string,
  ruDesc: string,
  trName: string,
  trDesc: string
) {
  return {
    en: text(enName, enDesc),
    ar: text(arName, arDesc),
    zh: text(zhName, zhDesc),
    ru: text(ruName, ruDesc),
    tr: text(trName, trDesc),
  };
}

function extractEnglish(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const englishLine = [...lines]
    .reverse()
    .find((line) => /[A-Za-z]/.test(line) && !/[\u0600-\u06FF]/.test(line));
  if (!englishLine) return null;
  const paren = englishLine.match(/\(([^)]+)\)/);
  if (paren?.[1]) return paren[1];
  return englishLine.replace(/^[^A-Za-z]+/, "").trim() || englishLine;
}

function englishNameFromReference(faName: string): string {
  const refItem = referenceContent.menuItems.find((item) => item.name === faName);
  if (!refItem) return faName;
  const extracted = extractEnglish(refItem.description);
  if (!extracted) return refItem.description.split("\n")[0]?.trim() || faName;
  const firstPart = extracted.split("+")[0]?.trim();
  if (firstPart && firstPart.length < 40 && !firstPart.includes("Espresso")) {
    return firstPart;
  }
  const parenName = refItem.description.match(/([A-Za-z][A-Za-z0-9 &%-]+)\s*\(/)?.[1];
  return parenName?.trim() || extracted.split("(")[0]?.trim() || refItem.description.trim();
}

async function updateCategoryTranslations() {
  const categories = await prisma.category.findMany({ include: { translations: true } });
  for (const category of categories) {
    const fa = category.translations.find((t) => t.language === "fa");
    const map = fa ? CATEGORY_BY_FA[fa.name] : undefined;
    if (!map) continue;

    for (const lang of TARGET_LANGS) {
      await prisma.categoryTranslation.upsert({
        where: {
          categoryId_language: { categoryId: category.id, language: lang },
        },
        update: { name: map[lang] },
        create: { categoryId: category.id, language: lang, name: map[lang] },
      });
    }
  }
}

async function updateItemTranslations() {
  const items = await prisma.menuItem.findMany({ include: { translations: true } });
  for (const item of items) {
    const fa = item.translations.find((t) => t.language === "fa");
    if (!fa) continue;

    const mapped = ITEM_BY_FA[fa.name];
    if (!mapped) {
      console.warn(`Missing item translation map for: ${fa.name}`);
      continue;
    }

    for (const lang of TARGET_LANGS) {
      const payload = mapped[lang];
      await prisma.itemTranslation.upsert({
        where: {
          itemId_language: { itemId: item.id, language: lang },
        },
        update: {
          name: payload.name,
          description: payload.description,
          ingredients: payload.ingredients,
        },
        create: {
          itemId: item.id,
          language: lang,
          name: payload.name,
          description: payload.description,
          ingredients: payload.ingredients,
        },
      });
    }
  }
}

async function updateGeneralSettings() {
  const row = await prisma.setting.findUnique({ where: { key: "general" } });
  if (!row) return;

  const general = JSON.parse(row.value) as Record<string, unknown>;
  const faName =
    (general.cafeNameTranslations as { language: string; value: string }[] | undefined)?.find(
      (entry) => entry.language === "fa"
    )?.value ||
    (general.cafeName as string | undefined) ||
    "کافه خانه مادری";

  const cafeNameTranslations = [
    { language: "fa", value: faName },
    ...TARGET_LANGS.map((lang) => ({
      language: lang,
      value: BRAND_BY_LANG[lang].cafeName,
    })),
  ];

  const faTagline =
    (general.taglineTranslations as { language: string; value: string }[] | undefined)?.find(
      (entry) => entry.language === "fa"
    )?.value ||
    (general.tagline as string | undefined) ||
    BRAND_BY_LANG.en.tagline;

  const taglineTranslations = [
    { language: "fa", value: faTagline },
    ...TARGET_LANGS.map((lang) => ({
      language: lang,
      value: BRAND_BY_LANG[lang].tagline,
    })),
  ];

  const nextGeneral = syncLegacyBrandFields({
    ...general,
    cafeNameTranslations,
    taglineTranslations,
  });

  await prisma.setting.update({
    where: { key: "general" },
    data: { value: JSON.stringify(nextGeneral) },
  });
}

async function updateContactSettings() {
  const row = await prisma.setting.findUnique({ where: { key: "contact" } });
  if (!row) return;

  const contact = JSON.parse(row.value) as Record<string, unknown>;
  const places = (contact.places as Array<Record<string, unknown>>) ?? [];
  if (places.length === 0) return;

  const faPlace = places[0];
  const faTranslations =
    (faPlace.translations as Array<{ language: string; title?: string; address?: string }>) ??
    [];
  const faEntry = faTranslations.find((entry) => entry.language === "fa");

  const translations = [
    faEntry ?? { language: "fa", title: "عنوان", address: "" },
    ...TARGET_LANGS.map((lang) => ({
      language: lang,
      title: PLACE_BY_LANG[lang].title,
      address: PLACE_BY_LANG[lang].address,
    })),
  ];

  places[0] = { ...faPlace, translations };
  contact.places = places;

  await prisma.setting.update({
    where: { key: "contact" },
    data: { value: JSON.stringify(contact) },
  });
}

async function main() {
  await updateCategoryTranslations();
  await updateItemTranslations();
  await updateGeneralSettings();
  await updateContactSettings();
  console.log("Translations filled for en, ar, zh, ru, tr (fa preserved).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
