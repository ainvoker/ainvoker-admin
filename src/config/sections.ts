import type { IconType } from 'react-icons';
import {
  HiOutlineArrowsRightLeft,
  HiOutlineBanknotes,
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineClipboardDocumentList,
  HiOutlineCpuChip,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineShieldExclamation,
  HiOutlineUsers,
} from 'react-icons/hi2';

export type AdminSection = {
  path: string;
  label: string;
  icon: IconType;
  title: string;
  subtitle: string;
  /** False for sections whose admin endpoints don't exist yet. */
  live: boolean;
};

export type AdminSectionGroup = {
  label: string;
  sections: AdminSection[];
};

export const sectionGroups: AdminSectionGroup[] = [
  {
    label: 'Home',
    sections: [
      {
        path: '/',
        label: 'Dashboard',
        icon: HiOutlineHome,
        title: 'Dashboard',
        subtitle: 'System health, traffic pulse, and period P&L at a glance.',
        live: true,
      },
    ],
  },
  {
    label: 'Catalog',
    sections: [
      {
        path: '/models',
        label: 'Models',
        icon: HiOutlineCpuChip,
        title: 'Models',
        subtitle: 'Catalog from releases; change availability, pricing tier, and Free access; view provider vs retail pricing.',
        live: true,
      },
    ],
  },
  {
    label: 'Customers',
    sections: [
      {
        path: '/organizations',
        label: 'Organizations',
        icon: HiOutlineBuildingOffice2,
        title: 'Organizations',
        subtitle: 'Find any workspace, see its owner and plan, and suspend or reinstate it.',
        live: true,
      },
      {
        path: '/users',
        label: 'Users',
        icon: HiOutlineUsers,
        title: 'Users',
        subtitle: 'Look up people by email and see which workspaces they belong to.',
        live: true,
      },
    ],
  },
  {
    label: 'Monetization',
    sections: [
      {
        path: '/business',
        label: 'Business',
        icon: HiOutlineCreditCard,
        title: 'Business',
        subtitle: 'Markups, FX, and Scale advance — drives retail prices on all models.',
        live: true,
      },
      {
        path: '/billing',
        label: 'Billing',
        icon: HiOutlineBanknotes,
        title: 'Billing',
        subtitle: 'Subscriptions, payments, and manual plan adjustments for support cases.',
        live: true,
      },
    ],
  },
  {
    label: 'Finance',
    sections: [
      {
        path: '/finance/overview',
        label: 'Overview',
        icon: HiOutlineChartPie,
        title: 'Overview',
        subtitle: 'Revenue, COGS, gross margin, and net profit by period.',
        live: true,
      },
      {
        path: '/finance/expenses',
        label: 'Expenses',
        icon: HiOutlineClipboardDocumentList,
        title: 'Expenses',
        subtitle: 'Operating costs: hosting, payment fees, tools, payroll.',
        live: true,
      },
      {
        path: '/finance/reconciliation',
        label: 'Reconciliation',
        icon: HiOutlineArrowsRightLeft,
        title: 'Reconciliation',
        subtitle: 'Match Xendit and provider invoices to internal records.',
        live: true,
      },
    ],
  },
  {
    label: 'Operations',
    sections: [
      {
        path: '/audit',
        label: 'Audit log',
        icon: HiOutlineDocumentText,
        title: 'Audit log',
        subtitle: 'Who changed workspaces, billing, catalog, and business settings.',
        live: true,
      },
      {
        path: '/usage',
        label: 'Usage and requests',
        icon: HiOutlineChartBar,
        title: 'Usage and requests',
        subtitle: 'Platform-wide traffic, cost, and errors across every workspace.',
        live: true,
      },
      {
        path: '/safety',
        label: 'Safety',
        icon: HiOutlineShieldExclamation,
        title: 'Safety',
        subtitle: 'Shut down abuse by revoking API keys or disabling projects.',
        live: true,
      },
    ],
  },
];

export const allSections = sectionGroups.flatMap((group) => group.sections);

export function findSection(pathname: string): AdminSection | undefined {
  return allSections.find((s) => pathname === s.path || pathname.startsWith(`${s.path}/`));
}
