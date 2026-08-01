import type { NavIconKey } from '@/components/layout/navIcons';

export type AccountNavSection = 'workspace' | 'library' | 'account';

export type AccountNavItem = {
  href: string;
  labelKey: string;
  icon: NavIconKey;
  prefix: string;
  section: AccountNavSection;
  mobilePrimary?: boolean;
};

export const ACCOUNT_NAV_SECTIONS: { id: AccountNavSection; labelKey: string }[] = [
  { id: 'workspace', labelKey: 'account.nav.section.workspace' },
  { id: 'library', labelKey: 'account.nav.section.library' },
  { id: 'account', labelKey: 'account.nav.section.account' },
];

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  {
    href: '/account',
    labelKey: 'account.nav.home',
    icon: 'home',
    prefix: '/account',
    section: 'workspace',
    mobilePrimary: true,
  },
  {
    href: '/account/drones',
    labelKey: 'account.tab.drones',
    icon: 'drones',
    prefix: '/account/drones',
    section: 'workspace',
    mobilePrimary: true,
  },
  {
    href: '/account/certificates',
    labelKey: 'account.tab.certificates',
    icon: 'certificates',
    prefix: '/account/certificates',
    section: 'workspace',
    mobilePrimary: true,
  },
  {
    href: '/account/insurances',
    labelKey: 'account.tab.insurances',
    icon: 'insurances',
    prefix: '/account/insurances',
    section: 'workspace',
    mobilePrimary: true,
  },
  {
    href: '/account/permits',
    labelKey: 'account.tab.permits',
    icon: 'permits',
    prefix: '/account/permits',
    section: 'workspace',
  },
  {
    href: '/account/operators',
    labelKey: 'account.tab.operators',
    icon: 'operators',
    prefix: '/account/operators',
    section: 'library',
  },
  {
    href: '/account/documents',
    labelKey: 'account.tab.documents',
    icon: 'documents',
    prefix: '/account/documents',
    section: 'library',
  },
  {
    href: '/account/archive',
    labelKey: 'account.tab.archive',
    icon: 'archive',
    prefix: '/account/archive',
    section: 'library',
  },
  {
    href: '/account/orders',
    labelKey: 'account.tabOrders',
    icon: 'orders',
    prefix: '/account/orders',
    section: 'library',
  },
  {
    href: '/account/profile',
    labelKey: 'account.tabProfile',
    icon: 'profile',
    prefix: '/account/profile',
    section: 'account',
  },
  {
    href: '/account/billing',
    labelKey: 'account.tab.billing',
    icon: 'billing',
    prefix: '/account/billing',
    section: 'account',
  },
  {
    href: '/account/support',
    labelKey: 'support.nav',
    icon: 'support',
    prefix: '/account/support',
    section: 'account',
  },
];

export function isAccountNavActive(pathname: string, item: AccountNavItem): boolean {
  if (item.href === '/account') {
    return pathname === '/account';
  }
  return pathname === item.href || pathname.startsWith(`${item.prefix}/`);
}
