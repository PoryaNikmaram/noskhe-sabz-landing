import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Typography } from '@/components/ui/typography/Typography';
import { site } from '@/config/site';

export default function HomePage() {
  return (
    <Section spacing="lg">
      <Container size="narrow" className="text-center">
        <Typography variant="h1">{site.name}</Typography>
        <Typography variant="body-lg" className="mt-4 text-foreground-muted">
          {site.description}
        </Typography>
        <Typography variant="body" className="mt-6 text-foreground-subtle">
          محتوای صفحه اصلی در مراحل بعدی اضافه می‌شود.
        </Typography>
      </Container>
    </Section>
  );
}
