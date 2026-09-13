import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button/Button';
import { Typography } from '@/components/ui/typography/Typography';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Design System',
  robots: {
    index: false,
    follow: false,
  },
};

const brandShades = [
  { name: 'brand-50', className: 'bg-brand-50' },
  { name: 'brand-100', className: 'bg-brand-100' },
  { name: 'brand-200', className: 'bg-brand-200' },
  { name: 'brand-300', className: 'bg-brand-300' },
  { name: 'brand-400', className: 'bg-brand-400' },
  { name: 'brand-500', className: 'bg-brand-500' },
  { name: 'brand-600', className: 'bg-brand-600' },
  { name: 'brand-700', className: 'bg-brand-700' },
  { name: 'brand-800', className: 'bg-brand-800' },
  { name: 'brand-900', className: 'bg-brand-900' },
] as const;

const semanticColors = [
  { name: 'background', className: 'bg-background border border-border' },
  { name: 'surface', className: 'bg-surface border border-border' },
  { name: 'surface-muted', className: 'bg-surface-muted' },
  { name: 'foreground', className: 'bg-foreground' },
  { name: 'foreground-muted', className: 'bg-foreground-muted' },
  { name: 'foreground-subtle', className: 'bg-foreground-subtle' },
  { name: 'border', className: 'bg-border' },
  { name: 'border-strong', className: 'bg-border-strong' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'primary-hover', className: 'bg-primary-hover' },
  { name: 'primary-active', className: 'bg-primary-active' },
  { name: 'success', className: 'bg-success' },
  { name: 'warning', className: 'bg-warning' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'info', className: 'bg-info' },
] as const;

const typographyVariants = [
  'display',
  'h1',
  'h2',
  'h3',
  'h4',
  'body-lg',
  'body',
  'body-sm',
  'caption',
] as const;

const buttonVariants = ['primary', 'secondary', 'outline', 'ghost'] as const;
const buttonSizes = ['sm', 'md', 'lg'] as const;

const radiusSamples = [
  { name: 'sm', className: 'rounded-sm' },
  { name: 'md', className: 'rounded-md' },
  { name: 'lg', className: 'rounded-lg' },
  { name: 'xl', className: 'rounded-xl' },
  { name: 'full', className: 'rounded-full' },
] as const;

const shadowSamples = [
  { name: 'soft', className: 'shadow-soft' },
  { name: 'card', className: 'shadow-card' },
  { name: 'floating', className: 'shadow-floating' },
] as const;

function DemoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <Typography variant="h3">{title}</Typography>
      {children}
    </div>
  );
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="min-w-0 space-y-2">
      <div className={cn('h-16 rounded-md', className)} />
      <Typography variant="caption" className="break-all">
        {name}
      </Typography>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="min-w-0">
      <Section spacing="md">
        <Container>
          <Typography variant="display" className="mb-2">
            Design System
          </Typography>
          <Typography variant="body" className="text-foreground-muted">
            صفحه موقت برای بررسی بصری توکن‌ها و کامپوننت‌های پایه
          </Typography>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Brand Palette">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {brandShades.map((shade) => (
                <ColorSwatch key={shade.name} name={shade.name} className={shade.className} />
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Semantic Colors">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {semanticColors.map((color) => (
                <ColorSwatch key={color.name} name={color.name} className={color.className} />
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Typography">
            <div className="space-y-4">
              {typographyVariants.map((variant) => (
                <Typography key={variant} variant={variant}>
                  {variant} — متن نمونه برای بررسی تایپوگرافی
                </Typography>
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Button Variants">
            <div className="flex flex-wrap gap-3">
              {buttonVariants.map((variant) => (
                <Button key={variant} variant={variant}>
                  {variant}
                </Button>
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Button Sizes">
            <div className="flex flex-wrap items-center gap-3">
              {buttonSizes.map((size) => (
                <Button key={size} size={size}>
                  {size}
                </Button>
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Button States">
            <div className="flex flex-wrap gap-3">
              <Button disabled>غیرفعال</Button>
              <Button loading>در حال بارگذاری</Button>
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Containers">
            <div className="space-y-6">
              {(['narrow', 'default', 'wide'] as const).map((size) => (
                <div key={size} className="rounded-md border border-border p-2">
                  <Container size={size} className="rounded-md bg-surface-muted py-4 text-center">
                    <Typography variant="body-sm">{size}</Typography>
                  </Container>
                </div>
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Section Spacing">
            <div className="space-y-4">
              {(['sm', 'md', 'lg'] as const).map((spacing) => (
                <div key={spacing} className="rounded-md border border-border">
                  <Section spacing={spacing} className="bg-surface-muted text-center">
                    <Typography variant="body-sm">spacing: {spacing}</Typography>
                  </Section>
                </div>
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Radius">
            <div className="flex flex-wrap gap-6">
              {radiusSamples.map((sample) => (
                <div key={sample.name} className="space-y-2 text-center">
                  <div className={cn('size-20 bg-brand-100', sample.className)} />
                  <Typography variant="caption">{sample.name}</Typography>
                </div>
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="md" className="border-t border-border">
        <Container>
          <DemoBlock title="Shadows">
            <div className="flex flex-wrap gap-6">
              {shadowSamples.map((sample) => (
                <div key={sample.name} className="space-y-2 text-center">
                  <div className={cn('size-24 rounded-lg bg-surface', sample.className)} />
                  <Typography variant="caption">{sample.name}</Typography>
                </div>
              ))}
            </div>
          </DemoBlock>
        </Container>
      </Section>

      <Section spacing="lg" className="border-t border-border">
        <Container>
          <DemoBlock title="Logo">
            <div className="flex flex-wrap items-center gap-8">
              <Logo variant="full" />
              <Logo variant="mark" />
            </div>
          </DemoBlock>
        </Container>
      </Section>
    </main>
  );
}
