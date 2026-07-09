import type {
  EcosystemItem,
  FeatureCard,
  FeatureSectionCopy,
  HeroSlide,
  PricingTier,
  FaqItem,
  SportItem
} from '@/types/site';

export const DEMO_FORM_URL = 'https://form.typeform.com/to/Z6Ly2Pq6' as const;

export const heroSlides: HeroSlide[] = [
  {
    kicker: 'DREAM',
    title: "BEFORE THE DATA, THERE'S A DREAM.",
    description: 'Every athlete begins with a vision long before the world notices.',
    imagePath: '/images/Gemini_Generated_Image_dts8rfdts8rfdts8 (1).webp'
  },
  {
    kicker: 'SPORTS RECOMMENDATION',
    title: 'THE RIGHT PATH CHANGES EVERYTHING.',
    description: 'When training aligns with ability, growth accelerates.',
    imagePath: '/images/Gemini_Generated_Image_dts8rfdts8rfdts8 (1).webp'
  },
  {
    kicker: 'INJURY PREDICTION',
    title: "PERFORMANCE SHOULDN'T COST A CAREER.",
    description: 'We help identify risks before they turn into setbacks.',
    imagePath: '/images/Gemini_Generated_Image_dts8rfdts8rfdts8 (1).webp'
  }
];

export const featuresIntro: FeatureSectionCopy = {
  label: 'CAPABILITIES',
  title: 'Advanced analysis. Simplified insights.',
  blurb: 'Everything you need to understand performance — instantly.'
};

export const featureCards: FeatureCard[] = [
  {
    kicker: 'INJURY PREDICTION',
    description:
      'Identify risk before it becomes injury. Ada2y analyzes movement patterns and load indicators to flag potential injury risks early — helping athletes stay healthy and available.',
    imagePath: '/images/A4lides-see-1-1-6-G34LCO.webp'
  },
  {
    kicker: 'PHYSICAL ASSESSMENTS',
    description:
      'Measure what matters. Speed, power, agility, endurance — captured objectively, without wearables or lab setups.',
    imagePath: '/images/A4lides-see-2-1--Knb6eDV.webp'
  },
  {
    kicker: 'SKILL ASSESSMENTS',
    description:
      'Assess technique clearly. Analyze accuracy, mechanics, timing, and execution quality across sport-specific skills.',
    imagePath: '/images/A4lides-see-3-1-SItOQVnN.webp'
  },
  {
    kicker: 'SPORTS RECOMMENDATION',
    description:
      'Put athletes where they belong. Using performance data and physical profiles, Ada2y recommends the sports and positions where each athlete is most likely to excel.',
    imagePath: '/images/A4lides-see-4-1-BoBM3QmC.webp'
  }
];

export const ecosystemItems: EcosystemItem[] = [
  {
    title: 'Schools',
    description:
      'Digitize physical education. Track student development, identify talent early, and bring objective assessment into school sports programs.',
    iconPath: '/images/school-white-C7vRxGN5.png'
  },
  {
    title: 'Sports Clubs',
    description:
      'Standardize player evaluation. Compare athletes fairly, monitor progress, and support data-driven selection and development.',
    iconPath: '/images/sports-BRaVv2vP.png'
  },
  {
    title: 'Professional Teams',
    description:
      'Decisions backed by data. Integrate Ada2y into scouting, performance monitoring, and injury-prevention workflows.',
    iconPath: '/images/sport-type-white-C5LF7Vcv.png'
  },
  {
    title: 'Academies',
    description:
      'Develop talent with clarity. Measure improvement over time, optimize training plans, and communicate progress clearly to athletes and parents.',
    iconPath: '/images/academies-white-MsWlCJij.png'
  }
];

export const sportItems: SportItem[] = [
  {name: 'Gym', imagePath: '/images/Gemini_Generated_Image_dm9lw6dm9lw6dm9l (1).webp'},
  {name: 'Football', imagePath: '/images/a8b51e90ceca246954810e3b49c1bf7a66851512-ibEzMV66.png'},
  {name: 'Basketball', imagePath: '/images/8b40b380224d9872078fef0040c4903cef75d176-CHXkcWa_.png'},
  {name: 'Volleyball', imagePath: '/images/c34182dbacbce8733f5845de3e5de1c5b2e00d88-ofjzfRkk.png'},
  {name: 'Handball', imagePath: '/images/0645881043b9f84430fe5a7c2a702f32ca9a3498-B0bcsYCy.png'},
  {
    name: 'Racket Sports',
    imagePath: '/images/5b46aee24880866318edacffe0f813af168ce233-tQSfRA_d.png'
  },
  {name: 'Swimming', imagePath: '/images/3250d3fa22e287e01603c78712a464b91895fae3-op-0asXB.png'}
];

/** Additional sport / court environment tiles in the long coverage section. */
export const sportCourtImages: {alt: string; path: string}[] = [
  {alt: 'Sport Court', path: '/images/b8efd5d84e62138c94ed08d4b02a00c182b04a69-CZP_pFQS.png'},
  {alt: 'Sport Court', path: '/images/c394c3d8f7fb097855fa564fd1a98c34aeb79204-BXvXSCCp.png'},
  {alt: 'Sport Court', path: '/images/8b1d82173a4c5fa074bbd9ce766893db18eed98a-DUsIRg4O.png'},
  {alt: 'Sport Court', path: '/images/de569774979aefe4027ae31abb97584cc5df9ba3-BcLg633m.png'},
  {alt: 'Sport Court', path: '/images/75566dea8d30e9577f5706ddeb3ed7920593c663-D5q8CrFV.png'}
];

export const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    priceLine: 'EGP 199',
    descriptionParts: {
      before: 'Perfect for those who need ',
      highlight1: 'core physical assessments',
      middle: ' and ',
      highlight2: 'performance tracking',
      after: '.'
    },
    bullets: [
      'Core physical assessments',
      'Performance tracking',
      'Athlete profiles',
      'Instant results'
    ],
    isPopular: false
  },
  {
    name: 'Pro',
    priceLine: 'EGP 399',
    descriptionParts: {
      before: 'Perfect for those who need ',
      highlight1: 'advanced assessments',
      middle: ' and ',
      highlight2: 'skill analysis',
      after: '.'
    },
    bullets: ['Advanced assessments', 'Skill analysis', 'Progress tracking', 'Reports and Exports'],
    isPopular: true
  },
  {
    name: 'Elite',
    priceLine: 'EGP 699',
    descriptionParts: {
      before: 'Perfect for those who need ',
      highlight1: 'injury prediction',
      middle: ' and ',
      highlight2: 'sport recommendation',
      after: '.'
    },
    bullets: ['Injury prediction', 'Sport recommendation', 'Team dashboards', 'Advanced analytics'],
    isPopular: false
  }
];

export const faqItems: FaqItem[] = [
  {
    value: 'faq-1',
    question: 'Do I need any special equipment to do an assessment?',
    answer: 'No. You just need your mobile camera'
  },
  {
    value: 'faq-2',
    question: 'Is Ada2y only for professional athletes?',
    answer:
      'Not at all. Ada2y is built for everyone — from youth players (5+ years) to academy athletes and elite performers.'
  },
  {
    value: 'faq-3',
    question: 'Do you only support one sport?',
    answer:
      'Ada2y supports multi-sport assessments. Our core performance metrics apply across all sports.'
  },
  {
    value: 'faq-4',
    question: 'What types of assessments does Ada2y provide?',
    answer:
      'Ada2y provides a complete 360 athlete profile, including: Physical performance assessments, Skill-based assessments, Psychological assessment.'
  },
  {
    value: 'faq-5',
    question: 'What will I actually get after the assessment?',
    answer:
      'You’ll receive an Athlete Profile that includes your results, key performance insights, and clear areas to improve.'
  },
  {
    value: 'faq-6',
    question: 'How does tracking help me improve over time?',
    answer:
      'Ada2y helps you track performance over time, identify strengths and gaps, and make training decisions based on data not guesswork. It also supports early injury risk prediction, helping athletes and coaches take action before injuries happen.'
  }
];

export const socialLinks = {
  instagram: '#',
  linkedin: 'https://www.linkedin.com/company/sports-educations-enhancer/',
  facebook: 'https://www.facebook.com/profile.php?id=61577736470374&mibextid=LQQJ4d'
} as const;
