export interface HeroSlide {
  kicker: string;
  title: string;
  description: string;
  imagePath: string;
}

export interface FeatureCard {
  kicker: string;
  description: string;
  imagePath: string;
}

export interface FeatureSectionCopy {
  label: string;
  title: string;
  blurb: string;
}

export interface EcosystemItem {
  title: string;
  description: string;
  iconPath: string;
}

export interface SportItem {
  name: string;
  imagePath: string;
}

export interface PricingTier {
  name: string;
  priceLine: string;
  descriptionParts: {
    before: string;
    highlight1: string;
    middle: string;
    highlight2: string;
    after: string;
  };
  bullets: string[];
  isPopular: boolean;
}

export interface FaqItem {
  value: string;
  question: string;
  answer: string;
}
