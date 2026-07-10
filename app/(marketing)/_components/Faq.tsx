'use client';

import {type CSSProperties, useState} from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

type FaqEntry = {
  value: string;
  question: string;
  answer?: string;
};

type FaqGroup = {
  title: string;
  defaultOpen?: string;
  items: FaqEntry[];
};

const faqGroups: FaqGroup[] = [
  {
    title: 'General',
    defaultOpen: 'general-special-equipment',
    items: [
      {
        value: 'general-special-equipment',
        question: 'Do I need any special equipment to do an assessment?',
        answer: 'No. You only need a mobile device with a camera to run an Ada2y assessment.'
      },
      {
        value: 'general-pro-athletes-only',
        question: 'Is Ada2y only for professional athletes?',
        answer:
          'No. Ada2y is built for everyone, from youth players (5+ years) to academy athletes and elite performers.'
      },
      {
        value: 'general-multi-sport',
        question: 'Do you only support one sport?',
        answer:
          'Ada2y supports multi-sport assessments. Core performance metrics are designed to work across different sports.'
      }
    ]
  },
  {
    title: 'Assessments',
    items: [
      {
        value: 'assessments-types',
        question: 'What types of assessments does Ada2y provide?',
        answer:
          'Ada2y provides a complete athlete profile including physical performance assessments, skill-based assessments, and psychological assessment signals.'
      },
      {
        value: 'assessments-output',
        question: 'What do I get after an assessment?',
        answer:
          'You get an athlete profile with your results, key performance insights, and clear focus areas for improvement.'
      },
      {
        value: 'assessments-tracking',
        question: 'How does tracking help me improve over time?',
        answer:
          'Ada2y lets you track progress over time, spot strengths and gaps, and make training decisions using data instead of guesswork. It also helps flag injury risk early.'
      }
    ]
  }
];

const replicaFaqColorTokens = {
  '--background': '#fafafa',
  '--foreground': 'lab(2.51107% .242703 -.886115)',
  '--card': '#ffffff',
  '--card-foreground': 'lab(2.51107% .242703 -.886115)',
  '--muted': 'oklch(0.97 0 0)',
  '--muted-foreground': 'lab(35.1166% 1.78212 -6.1173)',
  '--primary': 'oklch(0.58 0.22 277)',
  '--primary-foreground': '#ffffff',
  '--ring': 'oklch(0.58 0.22 277)',
  '--border': 'color-mix(in oklab, oklch(0.145 0 0) 7.5%, transparent)'
} as CSSProperties;

export default function Faq() {
  const [openItems, setOpenItems] = useState<Record<string, string[]>>(
    Object.fromEntries(
      faqGroups.map((group) => [group.title, group.defaultOpen ? [group.defaultOpen] : []])
    )
  );

  return (
    <section
      id="faq"
      style={replicaFaqColorTokens}
      className="bg-background py-16 text-foreground md:py-24"
    >
      <div className="mx-auto max-w-5xl px-1 md:px-6">
        <div className="grid gap-8 md:grid-cols-5 md:gap-12">
          <div className="max-w-lg max-md:px-6 md:col-span-2">
            <h2 className="text-foreground text-4xl font-semibold">FAQs</h2>
            <p className="text-muted-foreground mt-4 text-balance text-lg">
              Your questions answered
            </p>
            <p className="text-muted-foreground mt-6 max-md:hidden">
              Can&apos;t find what you&apos;re looking for? Contact our{' '}
              <a className="text-primary font-medium hover:underline" href="#">
                customer support team
              </a>
            </p>
          </div>

          <div className="space-y-12 md:col-span-3">
            {faqGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <h3 className="text-foreground pl-6 text-lg font-semibold">{group.title}</h3>
                <Accordion
                  value={openItems[group.title] ?? []}
                  onValueChange={(value: string[]) =>
                    setOpenItems((prev) => ({
                      ...prev,
                      [group.title]: value
                    }))
                  }
                  className="-space-y-1"
                >
                  {group.items.map((item) => (
                    <AccordionItem
                      key={item.value}
                      value={item.value}
                      className="border-b last:border-b-0 data-open:bg-card data-open:ring-border data-open:shadow-black/6.5 peer rounded-xl border-none px-6 py-1 data-open:border-none data-open:shadow-sm data-open:ring-1"
                    >
                      <AccordionTrigger className="cursor-pointer rounded-none border-b py-4 text-left text-base font-medium transition-none hover:no-underline data-open:border-transparent">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="overflow-hidden text-sm">
                        {item.answer ? (
                          <div className="pb-4 pt-0">
                            <p className="text-muted-foreground text-base">{item.answer}</p>
                          </div>
                        ) : null}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground mt-12 px-6 md:hidden">
          Can&apos;t find what you&apos;re looking for? Contact our{' '}
          <a className="text-primary font-medium hover:underline" href="#">
            customer support team
          </a>
        </p>
      </div>
    </section>
  );
}
