export type TargetLang = "en" | "ar" | "zh" | "ru" | "tr";
export type Lang5 = Record<TargetLang, string>;

function L(en: string, ar: string, zh: string, ru: string, tr: string): Lang5 {
  return { en, ar, zh, ru, tr };
}

export const ALL_TARGET_LANGS: TargetLang[] = ["en", "ar", "zh", "ru", "tr"];

export const CATEGORY_I18N: Record<string, Lang5> = {
  "چای و دمنوش": L(
    "Tea & Herbal Drinks",
    "الشاي والأعشاب",
    "茶与花草茶",
    "Чай и травяные напитки",
    "Cay ve Bitki Caylari"
  ),
  "نوشیدنی گرم": L(
    "Hot Drinks",
    "مشروبات ساخنة",
    "热饮",
    "Горячие напитки",
    "Sicak Icecekler"
  ),
  صبحانه: L("Breakfast", "فطور", "早餐", "Завтрак", "Kahvalti"),
  شیک: L("Shakes", "مشروبات مخفوقة", "奶昔", "Коктейли", "Milkshake"),
  "نوشیدنی سرد": L(
    "Cold Drinks",
    "مشروبات باردة",
    "冷饮",
    "Холодные напитки",
    "Soguk Icecekler"
  ),
  غذاها: L("Food", "أطباق", "餐食", "Блюда", "Yemekler"),
  "اسپرسو بار": L(
    "Espresso Bar",
    "بار الإسبريسو",
    "意式咖啡吧",
    "Эспрессо-бар",
    "Espresso Bar"
  ),
};

export const ITEM_I18N: Record<string, Lang5> = {
  "چای سیاه": L("Black Tea", "شاي أسود", "红茶", "Черный чай", "Siyah Cay"),
  "چای زعفران": L("Saffron Tea", "شاي بالزعفران", "藏红花茶", "Шафрановый чай", "Safranli Cay"),
  "چای هل و دارچین": L(
    "Cardamom & Cinnamon Tea",
    "شاي بالهيل والقرفة",
    "豆蔻肉桂茶",
    "Чай с кардамоном и корицей",
    "Kakule ve Tarçinli Cay"
  ),
  "دمنوش آرامش": L(
    "Relaxation Herbal Tea",
    "منقوع الأعشاب للاسترخاء",
    "舒缓花草茶",
    "Успокаивающий травяной чай",
    "Rahatlatici Bitki Cayi"
  ),
  "دمنوش نقش جهان": L(
    "Naqsh-e Jahan Herbal Tea",
    "منقوع نقش جهان",
    "纳克什贾汉花草茶",
    "Травяной чай Naqsh-e Jahan",
    "Naks-i Cihan Bitki Cayi"
  ),
  "دمنوش مادری": L(
    "Madari Herbal Tea",
    "منقوع مادري",
    "马德里花草茶",
    "Травяной чай Madari",
    "Madari Bitki Cayi"
  ),
  "آیس تی لیمو نعنا": L(
    "Iced Tea Lemon Mint",
    "شاي مثلج بالليمون والنعناع",
    "柠檬薄荷冰茶",
    "Холодный чай с лимоном и мятой",
    "Limon Naneli Buzlu Cay"
  ),
  "آیس تی استوایی": L(
    "Iced Tea Tropical",
    "شاي مثلج استوائي",
    "热带冰茶",
    "Тропический холодный чай",
    "Tropikal Buzlu Cay"
  ),
  "هات چاکلت": L("Hot Chocolate", "شوكولاتة ساخنة", "热巧克力", "Горячий шоколад", "Sicak Cikolata"),
  ماسالا: L("Masala", "ماسالا", "玛萨拉", "Масала", "Masala"),
  "وایت چاکلت": L(
    "White Chocolate",
    "شوكولاتة بيضاء",
    "白巧克力",
    "Белый шоколад",
    "Beyaz Cikolata"
  ),
  "ماچا لاته": L("Matcha Latte", "ماتشا لاتيه", "抹茶拿铁", "Матча латте", "Matcha Latte"),
  "صبحانه ایرانی": L(
    "Iranian Breakfast",
    "فطور إيراني",
    "伊朗早餐",
    "Иранский завтрак",
    "Iran Kahvaltisi"
  ),
  "صبحانه انگلیسی": L(
    "English Breakfast",
    "فطور إنجليزي",
    "英式早餐",
    "Английский завтрак",
    "Ingiliz Kahvaltisi"
  ),
  "تست فرانسوی": L("French Toast", "توست فرنسي", "法式吐司", "Французский тост", "Fransiz Tostu"),
  نیمرو: L("Fried Eggs", "بيض مقلي", "煎蛋", "Яичница", "Sahanda Yumurta"),
  "املت گوجه": L("Tomato Omelette", "عجة بالطماطم", "番茄 omelette", "Омлет с помидорами", "Domatesli Omlet"),
  "سوسیس تخم مرغ": L(
    "Sausage & Eggs",
    "سجق وبيض",
    "香肠煎蛋",
    "Сосиски с яйцом",
    "Sosis ve Yumurta"
  ),
  "املت خرما گردو": L(
    "Date & Walnut Omelette",
    "عجة بالتمر والجوز",
    "椰枣核桃 omelette",
    "Омлет с финиками и грецкими орехами",
    "Hurma ve Cevizli Omlet"
  ),
  وافل: L("Waffle", "وافل", "华夫饼", "Вафля", "Waffle"),
  "شیک ترش": L("Sour Shake", "مخفوق حامض", "酸味奶昔", "Кислый коктейль", "Ekşi Milkshake"),
  "شیک شکلات": L(
    "Chocolate Shake",
    "مخفوق الشوكولاتة",
    "巧克力奶昔",
    "Шоколадный коктейль",
    "Cikolatali Milkshake"
  ),
  "شیک شکلات فندوق": L(
    "Hazelnut Chocolate Shake",
    "مخفوق الشوكولاتة والبندق",
    "榛果巧克力奶昔",
    "Шоколадно-фунduковый коктейль",
    "Findikli Cikolatali Milkshake"
  ),
  "شیک بینگو": L("Bingo Shake", "مخفوق بينغو", "宾果奶昔", "Коктейль Bingo", "Bingo Milkshake"),
  "شیک وانیل": L("Vanilla Shake", "مخفوق الفانيليا", "香草奶昔", "Ванильный коктейль", "Vanilyali Milkshake"),
  "شیک نسکافه": L(
    "Nescafe Shake",
    "مخفوق نسكافيه",
    "雀巢奶昔",
    "Коктейль Nescafe",
    "Nescafe Milkshake"
  ),
  "شیک پینات": L("Peanut Shake", "مخفوق الفول السوداني", "花生奶昔", "Арахисовый коктейль", "Fistikli Milkshake"),
  لیموناد: L("Lemonade", "ليمونادة", "柠檬水", "Лимонад", "Limonata"),
  موهیتو: L("Mojito", "موهيتو", "莫吉托", "Мохито", "Mojito"),
  "رد موهیتo": L("Red Mojito", "موهيتو أحمر", "红色莫吉托", "Красный мохито", "Kirmizi Mojito"),
  "رد موهیتو": L("Red Mojito", "موهيتو أحمر", "红色莫吉托", "Красный мохито", "Kirmizi Mojito"),
  "لیموناد لوندر": L(
    "Lavender Lemonade",
    "ليمونادة باللافندر",
    "薰衣草柠檬水",
    "Лавандовый лимонад",
    "Lavantali Limonata"
  ),
  بیلیز: L("Breeze", "نسيم", "清风饮品", "Бриз", "Breeze"),
  "شربت زعفران": L(
    "Saffron Sherbet",
    "شراب الزعفران",
    "藏红花糖浆饮品",
    "Шербет с шафраном",
    "Safranli Serbet"
  ),
  "اسموتی لیمونعنا": L(
    "Lemon Mint Smoothie",
    "سموذي الليمون والنعناع",
    "柠檬薄荷冰沙",
    "Смузи с лимоном и мятой",
    "Limon Naneli Smoothie"
  ),
  "اسموتی ترش": L("Sour Smoothie", "سموذي حامض", "酸味冰沙", "Кислый смузи", "Ekşi Smoothie"),
  "اسموتی استوایی": L(
    "Tropical Smoothie",
    "سموذي استوائي",
    "热带冰沙",
    "Тропический смузи",
    "Tropikal Smoothie"
  ),
  "اسموتی بلوهاوایی": L(
    "Blue Hawaii Smoothie",
    "سموذي بلو هاواي",
    "蓝色夏威夷冰沙",
    "Смузи Blue Hawaii",
    "Blue Hawaii Smoothie"
  ),
  "حاجی واشنگتن": L(
    "Haji Washington",
    "حاجي واشنطن",
    "哈吉华盛顿",
    "Haji Washington",
    "Haci Washington"
  ),
  "پاستا پنه آلفردو": L(
    "Penne Alfredo Pasta",
    "معكرونة بيني ألفريدو",
    "阿尔弗雷多通心粉",
    "Паста пенне альфредо",
    "Penne Alfredo"
  ),
  "استیک مرغ": L("Chicken Steak", "ستيك دجاج", "鸡肉牛排", "Куриный стейк", "Tavuk Biftek"),
  "چیکن پارمسان": L(
    "Chicken Parmesan",
    "دجاج بارميزان",
    "帕尔马鸡排",
    "Курица пармезан",
    "Tavuk Parmesan"
  ),
  "برگر مرغ گریل": L(
    "Grilled Chicken Burger",
    "برجر دجاج مشوي",
    "烤鸡汉堡",
    "Бургер с курицей гриль",
    "Izgara Tavuk Burger"
  ),
  "برگر کلاسیک": L("Classic Burger", "برجر كلاسيكي", "经典汉堡", "Классический бургер", "Klasik Burger"),
  "چیز برگر": L("Cheese Burger", "تشيز برجر", "芝士汉堡", "Чизбургер", "Cheeseburger"),
  "برگر مخصوص": L("Special Burger", "برجر مخصوص", "特色汉堡", "Фирменный бургер", "Ozel Burger"),
  "چیکن فینگر": L("Chicken Fingers", "أصابع دجاج", "鸡柳", "Куриные палочки", "Tavuk Parmaklari"),
  "سیب فرایز و بیکن": L(
    "Fries with Bacon",
    "بطاطس مقلية مع لحم مقدد",
    "培根薯条",
    "Картофель фри с беконом",
    "Pastirmali Patates Kizartmasi"
  ),
  "سیب فرایز و سوسیس": L(
    "Fries with Sausage",
    "بطاطس مقلية مع سجق",
    "香肠薯条",
    "Картофель фри с сосисками",
    "Sosisli Patates Kizartmasi"
  ),
  "سیب فرایز": L("French Fries", "بطاطس مقلية", "薯条", "Картофель фри", "Patates Kizartmasi"),
  "سالاد مخصوص": L("Special Salad", "سلطة مخصوصة", "特色沙拉", "Фирменный салат", "Ozel Salata"),
  "سالاد سزار": L("Caesar Salad", "سلطة سيزر", "凯撒沙拉", "Салат цезарь", "Sezar Salata"),
  اسپرسو: L("Espresso", "إسبريسو", "浓缩咖啡", "Эспрессо", "Espresso"),
  "اسپرسو ماکیاتو": L("Espresso Macchiato", "إسبريسو ماكياتو", "浓缩玛奇朵", "Эспрессо макиато", "Espresso Macchiato"),
  "اسپرسو کن پانا": L(
    "Espresso Con Panna",
    "إسبريسو كون بانا",
    "浓缩康帕纳",
    "Эспрессо кон панна",
    "Espresso Con Panna"
  ),
  آمریکانو: L("Americano", "أمريكانو", "美式咖啡", "Американо", "Americano"),
  کاپوچینو: L("Cappuccino", "كابتشينو", "卡布奇诺", "Капучино", "Kapuccino"),
  "کافه لاته": L("Cafe Latte", "كافيه لاتيه", "拿铁咖啡", "Кафе латте", "Cafe Latte"),
  موکا: L("Mocha", "موكا", "摩卡", "Мокка", "Mocha"),
  "موکا کرم": L("Mocha Cream", "موكا كريم", "奶油摩卡", "Мокка с кремом", "Kremali Mocha"),
  "آیس آمریکانو": L("Iced Americano", "أمريكانو مثلج", "冰美式", "Айс американо", "Buzlu Americano"),
  "آیس لاته": L("Iced Latte", "لاتيه مثلج", "冰拿铁", "Айс латте", "Buzlu Latte"),
  "آیس موکا": L("Iced Mocha", "موكا مثلجة", "冰摩卡", "Айс мокка", "Buzlu Mocha"),
  "آفوگاتo": L("Affogato", "أفوجاتو", "阿芙佳朵", "Аффогато", "Affogato"),
  آفوگاتو: L("Affogato", "أفوجاتو", "阿芙佳朵", "Аффогато", "Affogato"),
  "اورنج کافی": L("Orange Coffee", "قهوة بالبرتقال", "橙子咖啡", "Апельсиновый кофе", "Portakalli Kahve"),
  "قهوه ترک": L("Turkish Coffee", "قهوة تركية", "土耳其咖啡", "Турецкий кофе", "Turk Kahvesi"),
};

export const BRAND_I18N = {
  cafeName: L(
    "Khane Madari Cafe",
    "مقهى خانه مادري",
    "Khane Madari 咖啡馆",
    "Кафе Khane Madari",
    "Khane Madari Kafe"
  ),
  tagline: L(
    "Khane Madari Cafe",
    "مقهى خانه مادري",
    "Khane Madari 咖啡馆",
    "Кафе Khane Madari",
    "Khane Madari Kafe"
  ),
};

export const PLACE_I18N = L(
  "Address",
  "العنوان",
  "地址",
  "Адрес",
  "Adres"
);

export const DUAL_PRICE_LABELS: Record<
  TargetLang | "fa",
  { primary: string; secondary: string }
> = {
  fa: { primary: "تک", secondary: "دبل" },
  en: { primary: "Single", secondary: "Double" },
  ar: { primary: "فردي", secondary: "مزدوج" },
  zh: { primary: "单份", secondary: "双份" },
  ru: { primary: "Одинарный", secondary: "Двойной" },
  tr: { primary: "Tek", secondary: "Cift" },
};

export function resolveItemI18n(faName: string): Lang5 | undefined {
  const trimmed = faName.trim();
  return ITEM_I18N[trimmed] ?? ITEM_I18N[faName];
}

export function resolveCategoryI18n(faName: string): Lang5 | undefined {
  return CATEGORY_I18N[faName.trim()];
}
