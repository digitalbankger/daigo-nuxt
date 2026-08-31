// types/articles.ts
export interface Breadcrumb {
  label: string;
  to: string;
}

export interface ArticleAuthor {
  id: number;
  name: string;
  position?: string;
  avatarUrl?: string;
  about?: string;
  social?: Array<{ type: "vk" | "tg" | "wa" | "yt" | "ig" | "x"; url: string }>;
}

export interface ArticleTag {
  id: number;
  slug: string;
  label: string;
}

export interface ArticleFAQ {
  q: string;
  a: string;
}

export interface ArticleFile {
  id: number;
  title: string;
  url: string;
  size?: string; // e.g. "2.1 MB"
  mime?: string; // e.g. "application/pdf"
}

export interface ArticleSpecialist {
  name: string;
  position: string;
  avatarUrl?: string;
  description?: string;
  social?: Array<{
    type: "dzen" | "vk" | "tg" | "wa" | "yt" | "ig" | "x";
    url: string;
  }>;
}

export interface ArticleProductMini {
  product_id: string;
  title: string;
  image: string;
  price: number;
  oldPrice?: number;
  url: string;
  badge?: string;
}

export interface ArticleSideNote {
  title: string;
  text: string;
  icon?: string;
}

export interface ArticleSectionBanner {
  title: string;
  image: string;
  products: ArticleProductMini[];
  /** nested — карточки товаров лежат прямо на баннере (золотая кнопка); separate — баннер сам по себе, карточки отдельным рядом ниже (синяя кнопка) */
  style?: "nested" | "separate";
}

export interface ArticleSideProduct extends ArticleProductMini {
  subtitle?: string;
}

export interface ArticleSection {
  id: string;
  heading: string;
  html: string;
  image?: { src: string; alt?: string };
  sideNote?: ArticleSideNote;
  infographic?: { src: string; alt?: string };
  /** промо-баннер с товарами, показывается под секцией на всю ширину (лонгриды типа "longevity") */
  banner?: ArticleSectionBanner;
  /** карточка одного товара в сайдбаре секции (вместо sideNote) */
  sideProduct?: ArticleSideProduct;
}

export interface ArticleListItem {
  id: number;
  slug: string;
  title: string;
  preview: string;
  image: string;
  date: string; // ISO
  time: number; // read minutes
  views: number;
  comments: number;
  properties: Record<string, string | string[]>;
}

export interface ArticleDetail extends ArticleListItem {
  description?: string;
  cover?: string;
  breadcrumbs?: Breadcrumb[];
  tags?: ArticleTag[];
  author?: ArticleAuthor;
  // контент делим на две части (по макету)
  contentTop?: string; // HTML (sanitized на бэке)
  contentBottom?: string; // HTML
  // блок "Полезные материалы"
  materials?: {
    title: string;
    text?: string;
    files: ArticleFile[];
    specialist?: ArticleSpecialist;
    downloadAllUrl?: string;
  };
  // виджеты
  faq?: ArticleFAQ[];
  topFive?: ArticleListItem[];
  recommended?: ArticleListItem[];
  popular?: ArticleListItem[];
  products?: ArticleProductMini[];
  productsIds?: string[];

  // альтернативная (авторская, не-wysiwyg) вёрстка статьи — см. ArticleDetailTemplate.vue
  layout?: "default" | "summer" | "omega3-system" | "longevity";
  sections?: ArticleSection[];
  outro?: { heading: string; html: string };
  recommendedProducts?: ArticleProductMini[];
  weeklyProducts?: ArticleProductMini[];
  weeklyProductsTitle?: string;
}

export interface ArticleComment {
  id: number;
  author: {
    name: string;
    avatarUrl?: string;
  };
  message: string;
  createdAt: string; // ISO
  replies?: ArticleComment[];
}

// API generic
export interface Paged<T> {
  items: T[];
  total: number;
}
