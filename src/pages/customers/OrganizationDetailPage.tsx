import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { useOrganization, useUpdateOrganizationStatus } from '../../hooks/useCustomers';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/common/Button';
import { AdminPage } from '../../components/layout/AdminPage';
import {
  formatPersonName,
  orgStatusLabel,
  orgStatusTone,
  subscriptionStatusTone,
} from './customersBadges';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export default function OrganizationDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const orgQuery = useOrganization(orgId);
  const updateStatus = useUpdateOrganizationStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const org = orgQuery.data;
  const nextStatus = org?.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
  const canToggle = org && (org.status === 'ACTIVE' || org.status === 'SUSPENDED');

  const confirmAction = async () => {
    if (!org || !canToggle) return;
    setActionError(null);
    try {
      await updateStatus.mutateAsync({ orgId: org.id, status: nextStatus });
      setConfirmOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <AdminPage
      actions={
        canToggle ? (
          <Button
            variant={nextStatus === 'SUSPENDED' ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => {
              setActionError(null);
              setConfirmOpen(true);
            }}
          >
            {nextStatus === 'SUSPENDED' ? 'Suspend workspace' : 'Reinstate workspace'}
          </Button>
        ) : undefined
      }
    >
      <div className="mb-3">
        <Link
          to="/organizations"
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 underline-offset-2 hover:text-accent hover:underline dark:text-neutral-400"
        >
          <HiOutlineArrowLeft className="size-3.5" aria-hidden />
          All organizations
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {orgQuery.isPending && (
          <div className="space-y-3 p-5">
            <div className="h-5 w-48 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-4 w-72 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        )}

        {orgQuery.isError && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium text-accent">Couldn&apos;t load this workspace</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => void orgQuery.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {org && (
          <>
            <div className="border-b border-neutral-200/80 p-5 dark:border-neutral-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-accent">{org.name}</h2>
                    <Badge tone={orgStatusTone[org.status]}>{orgStatusLabel[org.status]}</Badge>
                    {org.isPersonal && <Badge tone="muted">Personal</Badge>}
                  </div>
                  <p className="mt-1 font-mono text-[13px] text-neutral-400">{org.slug}</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-[12px] text-neutral-400">Owner</dt>
                  <dd className="mt-0.5 text-[13px]">
                    {org.owner ? (
                      <Link
                        to={`/users/${org.owner.id}`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {formatPersonName(org.owner)}
                      </Link>
                    ) : (
                      '—'
                    )}
                    {org.owner?.email && (
                      <div className="text-neutral-400">{org.owner.email}</div>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-neutral-400">Plan</dt>
                  <dd className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px]">
                    <Badge tone="neutral">{org.subscription?.planName ?? '—'}</Badge>
                    {org.subscription && (
                      <Badge tone={subscriptionStatusTone(org.subscription.status)}>
                        {org.subscription.status}
                      </Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-neutral-400">Members</dt>
                  <dd className="mt-0.5 text-[13px] tabular-nums text-accent">{org.memberCount}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-neutral-400">Created</dt>
                  <dd className="mt-0.5 text-[13px] text-neutral-600 dark:text-neutral-300">
                    {dateFormat.format(new Date(org.createdAt))}
                  </dd>
                </div>
              </dl>
            </div>

            <section className="border-b border-neutral-200/80 dark:border-neutral-800">
              <h3 className="px-5 pt-4 text-sm font-semibold text-accent">Projects</h3>
              {org.projects.length === 0 ? (
                <p className="px-5 py-4 text-[13px] text-neutral-500">No projects in this workspace.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-[13px]">
                    <thead className="text-xs text-neutral-500 dark:text-neutral-400">
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <th className="px-5 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Environment</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Keys</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {org.projects.map((project) => (
                        <tr key={project.id} className="text-neutral-700 dark:text-neutral-200">
                          <td className="px-5 py-2.5 font-medium text-accent">{project.name}</td>
                          <td className="px-3 py-2.5">{project.environment}</td>
                          <td className="px-3 py-2.5">
                            <Badge tone={project.status === 'ACTIVE' ? 'success' : 'muted'}>
                              {project.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 tabular-nums">{project.apiKeyCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="border-b border-neutral-200/80 dark:border-neutral-800">
              <h3 className="px-5 pt-4 text-sm font-semibold text-accent">API keys</h3>
              {org.apiKeys.length === 0 ? (
                <p className="px-5 py-4 text-[13px] text-neutral-500">No API keys in this workspace.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-[13px]">
                    <thead className="text-xs text-neutral-500 dark:text-neutral-400">
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <th className="px-5 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Prefix</th>
                        <th className="px-3 py-2 font-medium">Project</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Last used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {org.apiKeys.map((key) => (
                        <tr key={key.id} className="text-neutral-700 dark:text-neutral-200">
                          <td className="px-5 py-2.5 font-medium text-accent">{key.keyName}</td>
                          <td className="px-3 py-2.5 font-mono text-[12px]">{key.keyPrefix}</td>
                          <td className="px-3 py-2.5">{key.projectName}</td>
                          <td className="px-3 py-2.5">{key.clientType}</td>
                          <td className="px-3 py-2.5">
                            <Badge tone={key.status === 'ACTIVE' ? 'success' : 'muted'}>{key.status}</Badge>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-neutral-400">
                            {key.lastUsed ? dateFormat.format(new Date(key.lastUsed)) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <h3 className="px-5 pt-4 text-sm font-semibold text-accent">Pending invites</h3>
              {org.invites.length === 0 ? (
                <p className="px-5 py-4 text-[13px] text-neutral-500">No pending invites.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-[13px]">
                    <thead className="text-xs text-neutral-500 dark:text-neutral-400">
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <th className="px-5 py-2 font-medium">Email</th>
                        <th className="px-3 py-2 font-medium">Role</th>
                        <th className="px-3 py-2 font-medium">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {org.invites.map((invite) => (
                        <tr key={invite.id} className="text-neutral-700 dark:text-neutral-200">
                          <td className="px-5 py-2.5">{invite.email}</td>
                          <td className="px-3 py-2.5">
                            <Badge tone="neutral">{invite.role}</Badge>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-neutral-400">
                            {dateFormat.format(new Date(invite.expiresAt))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={nextStatus === 'SUSPENDED' ? 'Suspend workspace?' : 'Reinstate workspace?'}
        description={
          nextStatus === 'SUSPENDED'
            ? 'API keys on this workspace will stop working, and members will not be able to create projects or keys until you reinstate it.'
            : 'Members can use the workspace again, and API keys will work if they are still active.'
        }
      >
        {actionError && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {actionError}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={nextStatus === 'SUSPENDED' ? 'secondary' : 'primary'}
            size="sm"
            loading={updateStatus.isPending}
            onClick={() => void confirmAction()}
          >
            {nextStatus === 'SUSPENDED' ? 'Suspend workspace' : 'Reinstate workspace'}
          </Button>
        </div>
      </Dialog>
    </AdminPage>
  );
}
