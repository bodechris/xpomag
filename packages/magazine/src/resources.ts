export type MagazineFontResource = {
  id: string;
  family: string;
  src?: string;
  weight?: string | number;
  style?: "normal" | "italic";
  preload?: boolean;
};

export type MagazineImageResource = {
  id: string;
  src: string;
  alt?: string;
  preload?: boolean;
  fetchPriority?: "high" | "low" | "auto";
};

export type MagazineStyleResource = {
  id: string;
  cssText?: string;
  href?: string;
};

export type MagazineResourceBundle = {
  fonts?: MagazineFontResource[];
  images?: MagazineImageResource[];
  styles?: MagazineStyleResource[];
};
