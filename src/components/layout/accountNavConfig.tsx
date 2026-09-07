/**
 * Account-area navigation.
 *
 * The previous grouping was "Workspace / Library / Account", which split items
 * by how the app stores them rather than by what the user is trying to do:
 * operators sat under Library while drones sat under Workspace, even though
 * registering an operator is a prerequisite for registering a drone, and
 * certificates were separated from the documents they are filed alongside.
 *
 * The grouping below follows the task instead. Fleet is what you own and
 * operate; Compliance is the paperwork that has to be valid for it to fly;
 * Account is everything about the DroneTag subscription itself.
 *
 * No routes changed — this is purely how they are presented.
 */

import type { NavIconKey } from '@/components/layout/navIcons';

export type AccountNavSection = 'fleet' | 'compliance' | 'account';

export type AccountNavItem = {
  href: string;
  labelKey: string;
  icon: NavIconKey;
  prefix: string;
  section: AccountNavSection;
  mobilePrimary?: boolean;
  /**
   * Marks a destination that exists but is not yet functional. Billing is a
   * placeholder page; showing it identically to working features implies a
   * capability the product does not have.
   */
  preview?: boolean;
};

export const ACCOUNT_NAV_SECTIONS: { id: AccountNavSection; labelKey: string }[] = [
  { id: 'fleet', labelKey: 'account.nav.section.fleet' },
  { id: 'compliance', labelKey: 'account.nav.section.compliance' },
  { id: 'account', labelKey: 'account.nav.section.account' },
];

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  {
    href: '/account',
    labelKey: 'account.nav.home',
    icon: 'home',
    prefix: '/account',
    section: 'fleet',
    mobilePrimary: true,
  },
  {
    href: '/account/drones',
    labelKey: 'account.tab.drones',
    icon: 'drones',
    prefix: '/account/drones',
    section: 'fleet',
    mobilePrimary: true,
  },
  {
    href: '/account/operators',
    labelKey: 'account.tab.operators',
    icon: 'operators',
    prefix: '/account/operators',
    section: 'fleet',
  },
  {
    href: '/account/certificates',
    labelKey: 'account.tab.certificates',
    icon: 'certificates',
    prefix: '/account/certificates',
    section: 'compliance',
    mobilePrimary: true,
  },
  {
    href: '/account/insurances',
    labelKey: 'account.tab.insurances',
    icon: 'insurances',
    prefix: '/account/insurances',
    section: 'compliance',
    mobilePrimary: true,
  },
  {
    href: '/account/permits',
    labelKey: 'account.tab.permits',
    icon: 'permits',
    prefix: '/account/permits',
    section: 'compliance',
  },
  {
    href: '/account/documents',
    labelKey: 'account.tab.documents',
    icon: 'documents',
    prefix: '/account/documents',
    section: 'compliance',
  },
  {
    href: '/account/archive',
    labelKey: 'account.tab.archive',
    icon: 'archive',
    prefix: '/account/archive',
    section: 'compliance',
  },
  {
    href: '/account/profile',
    labelKey: 'account.tabProfile',
    icon: 'profile',
    prefix: '/account/profile',
    section: 'account',
  },
  {
    href: '/account/orders',
    labelKey: 'account.tabOrders',
    icon: 'orders',
    prefix: '/account/orders',
    section: 'account',
  },
  {
    href: '/account/billing',
    labelKey: 'account.tab.billing',
    icon: 'billing',
    prefix: '/account/billing',
    section: 'account',
    // The billing page is a placeholder: there is no payment provider wired
    // up. Flagged so the nav does not present it as a working feature.
    preview: true,
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
