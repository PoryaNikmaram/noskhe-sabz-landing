import type { NavItem } from '@/config/navigation';

export type DesktopNavigationProps = {
  items: readonly NavItem[];
  primaryCta: NavItem;
  secondaryAction: NavItem;
};

export type MobileNavigationProps = {
  items: readonly NavItem[];
  primaryCta: NavItem;
  secondaryAction: NavItem;
};
