'use client';

import type {ReactNode} from 'react';
import Link from 'next/link';

import {buttonVariants} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {DEMO_FORM_URL} from '@/lib/content';
import type {VariantProps} from 'class-variance-authority';

type DemoBookLinkProps = {
  className?: string;
  children: ReactNode;
} & VariantProps<typeof buttonVariants>;

export default function DemoBookLink({className, children, variant, size}: DemoBookLinkProps) {
  return (
    <Link
      href={DEMO_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({variant, size}), className)}
    >
      {children}
    </Link>
  );
}
