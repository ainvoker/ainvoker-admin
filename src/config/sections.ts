import type { IconType } from 'react-icons';
import {
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineCpuChip,
  HiOutlineCreditCard,
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
    label: 'Revenue',
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
        icon: HiOutlineCreditCard,
        title: 'Billing',
        subtitle: 'Subscriptions, payments, and manual plan adjustments for support cases.',
        live: false,
      },
    ],
  },
  {
    label: 'Operations',
    sections: [
      {
        path: '/usage',
        label: 'Usage and requests',
        icon: HiOutlineChartBar,
        title: 'Usage and requests',
        subtitle: 'Platform-wide traffic, cost, and errors across every workspace.',
        live: false,
      },
      {
        path: '/safety',
        label: 'Safety',
        icon: HiOutlineShieldExclamation,
        title: 'Safety',
        subtitle: 'Shut down abuse by revoking API keys or disabling projects.',
        live: false,
      },
    ],
  },
];

export const allSections = sectionGroups.flatMap((group) => group.sections);

export function findSection(pathname: string): AdminSection | undefined {
  return allSections.find((s) => pathname === s.path || pathname.startsWith(`${s.path}/`));
}
