import { SectionStub } from './SectionStub';

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

export const BillingStub = () => (
  <SectionStub
    summary="See who is paying, what they paid, and fix subscriptions when support needs to."
    capabilities={[
      'List subscriptions with plan, status, and current period.',
      'View Xendit transactions and receipts.',
      'Grant or extend Pro, or cancel a subscription, for support cases.',
      'Show plan limits (Free, Pro, Scale) read-only, since they are defined in code.',
    ]}
    endpoints={[
      'GET /api/v1/admin/subscriptions',
      'PATCH /api/v1/admin/subscriptions/:subscriptionId',
      'GET /api/v1/admin/transactions',
      'GET /api/v1/admin/plans',
    ]}
  />
);

export const UsageStub = () => (
  <SectionStub
    summary="Platform-wide view of traffic, cost, and failures across every workspace."
    capabilities={[
      'Totals for requests, tokens, cost, error rate, and latency.',
      'Breakdowns by model, provider, and workspace.',
      'A searchable request log across all workspaces.',
      'Workspaces near or over their plan limits, and where 429 and 402 errors come from.',
    ]}
    endpoints={[
      'GET /api/v1/admin/usage',
      'GET /api/v1/admin/ai-requests',
      'GET /api/v1/admin/ai-requests/:requestId',
    ]}
  />
);

export const SafetyStub = () => (
  <SectionStub
    summary="Stop abuse quickly, without waiting for a workspace owner to act."
    capabilities={[
      'Find and force-revoke any API key.',
      'Disable a project so its keys stop working.',
    ]}
    endpoints={[
      'POST /api/v1/admin/api-keys/:keyId/revoke',
      'PATCH /api/v1/admin/projects/:projectId (status)',
    ]}
  />
);
