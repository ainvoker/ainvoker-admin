import { SectionStub } from './SectionStub';

export const DashboardStub = () => (
  <SectionStub
    summary="Platform pulse after login — health, customer activity, a short money snapshot, and shortcuts into live sections."
    capabilities={[
      'Request volume and error rate across the platform.',
      'Recent organizations and suspended workspace count.',
      'Pro / Scale counts and cash collected this period.',
      'Shortcuts to Organizations, Models, and Business.',
    ]}
    endpoints={['GET /api/v1/admin/dashboard']}
  />
);

export const OrganizationsStub = () => (
  <SectionStub
    summary="Support starts here: find the workspace a customer is talking about and see its state at a glance."
    capabilities={[
      'Search every workspace by name, slug, or owner email.',
      'See owner, member count, plan, subscription status, and created date.',
      'Open a workspace to view its projects, API keys, and pending invites.',
      'Suspend or reinstate a workspace.',
    ]}
    endpoints={[
      'GET /api/v1/admin/organizations',
      'GET /api/v1/admin/organizations/:orgId',
      'PATCH /api/v1/admin/organizations/:orgId (status)',
    ]}
  />
);

export const UsersStub = () => (
  <SectionStub
    summary="Look up a person and see every workspace they belong to."
    capabilities={[
      'Search users by email or name.',
      'See profile, sign-up date, and whether they are a platform admin.',
      'List their workspaces with their role in each.',
    ]}
    endpoints={['GET /api/v1/admin/users', 'GET /api/v1/admin/users/:userId']}
  />
);

