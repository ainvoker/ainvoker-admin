import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import {
  useAdminApiKeys,
  useAdminProjects,
  useRevokeApiKey,
  useUpdateProjectStatus,
} from '../../hooks/useSafety';
import type {
  AdminApiKeyItem,
  AdminProjectItem,
  AdminProjectStatus,
  ApiKeyStatus,
  ProjectStatus,
} from '../../services/AdminSafetyService';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { TextInput } from '../../components/ui/Field';
import { TABLE_PAGE_SIZE, TablePagination } from '../../components/ui/TablePagination';
import { Button } from '../../components/common/Button';
import { AdminPage } from '../../components/layout/AdminPage';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

type ConfirmState =
  | { kind: 'revoke'; key: AdminApiKeyItem }
  | { kind: 'project'; project: AdminProjectItem; status: AdminProjectStatus }
  | null;

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'muted' | 'neutral' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'DISABLED' || status === 'REVOKED') return 'danger';
  if (status === 'EXPIRED' || status === 'ARCHIVED') return 'muted';
  return 'neutral';
}

export default function SafetyPage() {
  const [keySearch, setKeySearch] = useState('');
  const [keySubmittedQ, setKeySubmittedQ] = useState('');
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatus | ''>('');
  const [keyOffset, setKeyOffset] = useState(0);

  const [projectSearch, setProjectSearch] = useState('');
  const [projectSubmittedQ, setProjectSubmittedQ] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | ''>('');
  const [projectOffset, setProjectOffset] = useState(0);

  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const revokeKey = useRevokeApiKey();
  const updateProject = useUpdateProjectStatus();

  useEffect(() => {
    setKeyOffset(0);
  }, [keySubmittedQ, keyStatus]);

  useEffect(() => {
    setProjectOffset(0);
  }, [projectSubmittedQ, projectStatus]);

  const keyFilters = useMemo(
    () => ({
      q: keySubmittedQ || undefined,
      status: keyStatus || undefined,
      limit: TABLE_PAGE_SIZE,
      offset: keyOffset,
    }),
    [keySubmittedQ, keyStatus, keyOffset],
  );

  const projectFilters = useMemo(
    () => ({
      q: projectSubmittedQ || undefined,
      status: projectStatus || undefined,
      limit: TABLE_PAGE_SIZE,
      offset: projectOffset,
    }),
    [projectSubmittedQ, projectStatus, projectOffset],
  );

  const keysQuery = useAdminApiKeys(keyFilters);
  const projectsQuery = useAdminProjects(projectFilters);

  const keys = keysQuery.data?.items ?? [];
  const keyTotal = keysQuery.data?.total ?? 0;
  const projects = projectsQuery.data?.items ?? [];
  const projectTotal = projectsQuery.data?.total ?? 0;

  const actionPending = revokeKey.isPending || updateProject.isPending;

  const openRevoke = (key: AdminApiKeyItem) => {
    setActionError(null);
    setConfirm({ kind: 'revoke', key });
  };

  const openProjectStatus = (project: AdminProjectItem, status: AdminProjectStatus) => {
    setActionError(null);
    setConfirm({ kind: 'project', project, status });
  };

  const confirmAction = async () => {
    if (!confirm) return;
    setActionError(null);
    try {
      if (confirm.kind === 'revoke') {
        await revokeKey.mutateAsync(confirm.key.id);
      } else {
        await updateProject.mutateAsync({
          projectId: confirm.project.id,
          status: confirm.status,
        });
      }
      setConfirm(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const dialogTitle =
    confirm?.kind === 'revoke'
      ? 'Revoke API key?'
      : confirm?.status === 'DISABLED'
        ? 'Disable project?'
        : 'Re-enable project?';

  const dialogDescription =
    confirm?.kind === 'revoke'
      ? `“${confirm.key.keyName}” (${confirm.key.keyPrefix}…) will stop authenticating immediately.`
      : confirm?.status === 'DISABLED'
        ? `“${confirm?.project.name}” will stop accepting requests from all of its API keys until you re-enable it.`
        : `“${confirm?.project.name}” will accept requests again from active API keys.`;

  return (
    <AdminPage>
      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-accent">API keys</h2>
          <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">
            Find a key by name, prefix, project, or workspace and force-revoke it.
          </p>
        </div>

        <form
          className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 p-3 dark:border-neutral-800"
          onSubmit={(e) => {
            e.preventDefault();
            setKeySubmittedQ(keySearch.trim());
          }}
        >
          <div className="relative w-full sm:w-72">
            <HiOutlineMagnifyingGlass
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            />
            <TextInput
              aria-label="Search API keys"
              placeholder="Name, prefix, project, or workspace"
              value={keySearch}
              onChange={(e) => setKeySearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Select
            aria-label="Filter keys by status"
            className="w-36"
            value={keyStatus}
            onChange={(e) => {
              setKeyStatus((e.target.value || '') as ApiKeyStatus | '');
              setKeyOffset(0);
            }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="REVOKED">Revoked</option>
            <option value="EXPIRED">Expired</option>
          </Select>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[13px]">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400">
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Key
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Project
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Workspace
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Last used
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {keysQuery.isPending &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {keysQuery.isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load API keys</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void keysQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {keysQuery.isSuccess && keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500">
                    {keySubmittedQ || keyStatus
                      ? 'No API keys match your filters.'
                      : 'No API keys yet.'}
                  </td>
                </tr>
              )}

              {keys.map((key) => (
                <tr
                  key={key.id}
                  className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{key.keyName}</div>
                    <div className="font-mono text-[12px] text-neutral-400">{key.keyPrefix}…</div>
                  </td>
                  <td className="px-3 py-3">{key.projectName}</td>
                  <td className="px-3 py-3">
                    <Link
                      to={`/organizations/${key.organizationId}`}
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      {key.organizationName}
                    </Link>
                    <div className="text-[12px] text-neutral-400">{key.organizationSlug}</div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={statusTone(key.status)}>{key.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-neutral-400">
                    {key.lastUsed ? dateFormat.format(new Date(key.lastUsed)) : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={key.status === 'REVOKED'}
                      onClick={() => openRevoke(key)}
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {keysQuery.isSuccess && (
          <TablePagination
            total={keyTotal}
            limit={TABLE_PAGE_SIZE}
            offset={keyOffset}
            onOffsetChange={setKeyOffset}
            disabled={keysQuery.isFetching}
          />
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200/80 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-accent">Projects</h2>
          <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">
            Disable a project so every key under it stops working, or re-enable it later.
          </p>
        </div>

        <form
          className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 p-3 dark:border-neutral-800"
          onSubmit={(e) => {
            e.preventDefault();
            setProjectSubmittedQ(projectSearch.trim());
          }}
        >
          <div className="relative w-full sm:w-72">
            <HiOutlineMagnifyingGlass
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            />
            <TextInput
              aria-label="Search projects"
              placeholder="Project or workspace name"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="py-1.5 pl-8 text-[13px]"
            />
          </div>
          <Select
            aria-label="Filter projects by status"
            className="w-36"
            value={projectStatus}
            onChange={(e) => {
              setProjectStatus((e.target.value || '') as ProjectStatus | '');
              setProjectOffset(0);
            }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[13px]">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400">
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Project
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Workspace
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Environment
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Keys
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Updated
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {projectsQuery.isPending &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    </td>
                  </tr>
                ))}

              {projectsQuery.isError && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-accent">Couldn&apos;t load projects</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => void projectsQuery.refetch()}
                    >
                      Try again
                    </Button>
                  </td>
                </tr>
              )}

              {projectsQuery.isSuccess && projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-500">
                    {projectSubmittedQ || projectStatus
                      ? 'No projects match your filters.'
                      : 'No projects yet.'}
                  </td>
                </tr>
              )}

              {projects.map((project) => {
                const canDisable = project.status === 'ACTIVE' || project.status === 'ARCHIVED';
                const canReenable = project.status === 'DISABLED';
                return (
                  <tr
                    key={project.id}
                    className="text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-4 py-3 font-medium">{project.name}</td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/organizations/${project.organizationId}`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {project.organizationName}
                      </Link>
                      <div className="text-[12px] text-neutral-400">{project.organizationSlug}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone="neutral">{project.environment}</Badge>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{project.apiKeyCount}</td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone(project.status)}>{project.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-neutral-400">
                      {dateFormat.format(new Date(project.updatedAt))}
                    </td>
                    <td className="px-3 py-3">
                      {canDisable && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openProjectStatus(project, 'DISABLED')}
                        >
                          Disable
                        </Button>
                      )}
                      {canReenable && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openProjectStatus(project, 'ACTIVE')}
                        >
                          Re-enable
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {projectsQuery.isSuccess && (
          <TablePagination
            total={projectTotal}
            limit={TABLE_PAGE_SIZE}
            offset={projectOffset}
            onOffsetChange={setProjectOffset}
            disabled={projectsQuery.isFetching}
          />
        )}
      </section>

      <Dialog
        open={confirm != null}
        onClose={() => {
          if (!actionPending) setConfirm(null);
        }}
        title={dialogTitle}
        description={dialogDescription}
      >
        {actionError && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {actionError}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={actionPending}
            onClick={() => setConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            variant={
              confirm?.kind === 'revoke' || confirm?.status === 'DISABLED' ? 'secondary' : 'primary'
            }
            size="sm"
            loading={actionPending}
            onClick={() => void confirmAction()}
          >
            {confirm?.kind === 'revoke'
              ? 'Revoke key'
              : confirm?.status === 'DISABLED'
                ? 'Disable project'
                : 'Re-enable project'}
          </Button>
        </div>
      </Dialog>
    </AdminPage>
  );
}
