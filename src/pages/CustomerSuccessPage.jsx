import React, { useState, useMemo } from 'react';
import {
  TriangleAlert,
  GitBranch,
  PhoneCall,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Check,
  Pencil,
  Copy,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { T, cx } from '../theme.js';
import {
  fmtINR,
  parseDate,
  isTaskOverdue,
  daysUntil,
  TODAY_DATE,
} from '../lib/format.js';
import {
  STEP_TYPE_ICON,
  STEP_TYPES,
  PLAYBOOK_RISK_TIERS,
  PLAYBOOK_INDUSTRIES,
  RENEWAL_STATUSES,
  TASK_STATUSES,
} from '../data/constants.js';
import { useStore } from '../store/StoreContext.jsx';
import {
  PageHeader,
  Tabs,
  Modal,
  Button,
  Card,
  CardHeader,
  CardBody,
  Field,
  Badge,
  Table,
  Td,
  NameCell,
  Menu,
  Kpi,
  Progress,
  statusBadge,
  taskStatusBadge,
  Drawer,
  FilterPill,
  SearchInput,
  Pagination,
  usePagination,
} from '../components/ui.jsx';

/* ============================================================
   CUSTOMER SUCCESS — at-risk accounts, playbooks, tasks, renewals
   ============================================================ */
const CS_TABS = [
  'At-Risk Accounts',
  'Playbook Library',
  'Tenant Tasks',
  'Renewals',
];

export function CsPage({ openTenant }) {
  const [tab, setTab] = useState('At-Risk Accounts');
  return (
    <div className='flex flex-col h-full min-h-0'>
      <PageHeader
        title='Customer Success'
        desc='Health scores, playbooks, tasks and renewals'
      />
      <div className='shrink-0'>
        <Tabs tabs={CS_TABS} value={tab} onChange={setTab} />
      </div>
      <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
        {tab === 'At-Risk Accounts' && <CsAtRiskTab openTenant={openTenant} />}
        {tab === 'Playbook Library' && <CsPlaybookLibraryTab />}
        {tab === 'Tenant Tasks' && <CsTenantTasksTab openTenant={openTenant} />}
        {tab === 'Renewals' && <CsRenewalsTab />}
      </div>
    </div>
  );
}

/* ---- Tab 1: At-Risk Accounts ---- */
export function AssignPlaybookModal({ tenant, onClose }) {
  const store = useStore();
  const [selected, setSelected] = useState('');
  React.useEffect(() => {
    setSelected('');
  }, [tenant?.id]);
  if (!tenant) return null;
  const activePlaybooks = store.spPlaybooks.filter(
    (p) => p.status === 'Active',
  );
  // Only still-open work blocks a direct assign — Done/Skipped tasks are history, not a conflict.
  const existing = store.tenantTasks.filter(
    (t) =>
      t.tenantId === tenant.id &&
      (t.status === 'Open' || t.status === 'In Progress'),
  );
  const showGuard = !!selected && existing.length > 0;

  const assign = () => {
    if (!selected) return;
    store.assignPlaybookToTenant(tenant.id, selected);
    onClose();
  };
  const replace = () => {
    if (!selected) return;
    store.replaceTenantPlaybook(tenant.id, selected);
    onClose();
  };
  const addAlongside = () => {
    if (!selected) return;
    store.assignPlaybookToTenant(tenant.id, selected);
    onClose();
  };

  return (
    <Modal
      open={!!tenant}
      onClose={onClose}
      title={`Assign Playbook — ${tenant.name}`}
      footer={
        showGuard ? (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={addAlongside}>Add alongside</Button>
            <Button variant='danger' onClick={replace}>
              Replace
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant='primary' disabled={!selected} onClick={assign}>
              Assign
            </Button>
          </>
        )
      }
    >
      {showGuard && (
        <div
          className='flex items-start gap-2 rounded-lg p-3 mb-3'
          style={{
            background: T.warningSoft,
            border: `1px solid ${T.warning}`,
          }}
        >
          <TriangleAlert size={15} style={{ color: T.warning, marginTop: 2 }} />
          <div className='text-[12px]' style={{ color: T.text }}>
            This tenant already has {existing.length} open task
            {existing.length === 1 ? '' : 's'} from "
            <span className='font-semibold'>{existing[0].playbookName}</span>".
            Replace clears them; Add alongside keeps them and appends the new
            playbook's tasks.
          </div>
        </div>
      )}
      <div className='space-y-2'>
        {activePlaybooks.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={cx(
              'w-full flex items-center justify-between p-3 rounded-lg border text-left transition',
              selected === p.id ? 'ring-2' : 'hover:bg-[var(--t-subtle)]',
            )}
            style={{
              borderColor: selected === p.id ? T.primary : T.border,
              '--tw-ring-color': T.ring,
            }}
          >
            <div>
              <div
                className='text-[13px] font-medium'
                style={{ color: T.text }}
              >
                {p.name}
              </div>
              <div className='text-[11px]' style={{ color: T.text2 }}>
                {p.riskTier} risk · {p.industry} · {p.steps.length} steps
              </div>
            </div>
          </button>
        ))}
        {!activePlaybooks.length && (
          <div
            className='text-[12px] py-4 text-center'
            style={{ color: T.text3 }}
          >
            No active playbooks. Create one in the Playbook Library tab.
          </div>
        )}
      </div>
    </Modal>
  );
}

export function LogContactModal({ tenant, onClose }) {
  const store = useStore();
  const [type, setType] = useState('Call');
  const [outcome, setOutcome] = useState('Positive');
  const [notes, setNotes] = useState('');
  React.useEffect(() => {
    setType('Call');
    setOutcome('Positive');
    setNotes('');
  }, [tenant?.id]);
  if (!tenant) return null;
  const save = () => {
    if (!notes.trim()) return;
    store.logContact(tenant.id, { type, outcome, notes: notes.trim() });
    onClose();
  };
  return (
    <Modal
      open={!!tenant}
      onClose={onClose}
      title={`Log Contact — ${tenant.name}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='primary' disabled={!notes.trim()} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className='space-y-3'>
        <div>
          <label
            className='text-[11px] font-semibold uppercase tracking-wider'
            style={{ color: T.text3 }}
          >
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none'
            style={{ borderColor: T.border }}
          >
            <option>Call</option>
            <option>Email</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label
            className='text-[11px] font-semibold uppercase tracking-wider'
            style={{ color: T.text3 }}
          >
            Outcome
          </label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none'
            style={{ borderColor: T.border }}
          >
            <option>Positive</option>
            <option>Neutral</option>
            <option>Negative</option>
          </select>
        </div>
        <div>
          <label
            className='text-[11px] font-semibold uppercase tracking-wider'
            style={{ color: T.text3 }}
          >
            Notes
            {!notes.trim() && (
              <span style={{ color: T.danger }}> — required</span>
            )}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none'
            style={{ borderColor: T.border }}
          />
        </div>
      </div>
    </Modal>
  );
}

export function CsAtRiskTab({ openTenant }) {
  const store = useStore();
  const atRisk = [...store.clients]
    .filter((c) => c.churnRisk !== 'Low')
    .sort((a, b) => a.health - b.health);
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } =
    usePagination(atRisk, 10);
  const [assigningTenant, setAssigningTenant] = useState(null);
  const [loggingTenant, setLoggingTenant] = useState(null);
  const tasksFor = (tenantId) =>
    store.tenantTasks.filter((t) => t.tenantId === tenantId);
  return (
    <div className='flex flex-col h-full min-h-0'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0'>
        <Kpi label='Avg Health' value='82' sub='+3 pts' trend='pos' />
        <Kpi
          label='At Risk'
          value={String(atRisk.length)}
          sub='health < 75'
          trend='warn'
        />
        <Kpi label='Renewals (30d)' value='3' sub={fmtINR(19167) + ' MRR'} />
        <Kpi label='NPS' value='+48' sub='52 responses' trend='pos' />
      </div>
      <Card className='flex-1 min-h-0 flex flex-col overflow-hidden'>
        <CardHeader
          title='At-Risk Accounts'
          action={<Badge tone='danger'>{atRisk.length} accounts</Badge>}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          perPage={perPage}
          setPerPage={setPerPage}
          total={total}
        />
        <Table
          head={[
            'Client',
            'Health',
            'Risk',
            'Playbook',
            'MRR',
            'Owner',
            'Renewal',
            '',
          ]}
        >
          {pageRows.map((c) => {
            const tasks = tasksFor(c.id);
            const done = tasks.filter((t) => t.status === 'Done').length;
            // A left border on <tr> is dropped by the collapsed-border table model this
            // component uses, so the flag is applied to the first cell instead — same visual
            // result (a red edge on unworked High-risk rows), reliably rendered.
            const flagBorder = c.churnRisk === 'High' && tasks.length === 0;
            return (
              <tr key={c.id} className='hover:bg-[#F8F9FC]'>
                <Td
                  style={
                    flagBorder
                      ? { borderLeft: `3px solid ${T.danger}` }
                      : undefined
                  }
                >
                  <NameCell
                    name={c.name}
                    sub={c.industry}
                    onClick={() => openTenant(c)}
                  />
                </Td>
                <Td>
                  <Progress value={c.health} />
                </Td>
                <Td>{statusBadge(c.churnRisk)}</Td>
                <Td>
                  {tasks.length ? (
                    <div>
                      <div
                        className='font-medium text-[12px]'
                        style={{ color: T.text }}
                      >
                        {tasks[0].playbookName}
                      </div>
                      <Badge
                        tone={
                          done === tasks.length
                            ? 'success'
                            : done > 0
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {done}/{tasks.length} done
                      </Badge>
                    </div>
                  ) : (
                    <Badge tone='gray'>No playbook</Badge>
                  )}
                </Td>
                <Td className='font-medium'>{c.mrr ? fmtINR(c.mrr) : '—'}</Td>
                <Td className='text-xs' style={{ color: T.text2 }}>
                  {c.am}
                </Td>
                <Td className='text-xs font-mono' style={{ color: T.text2 }}>
                  {c.planEnd}
                </Td>
                <Td>
                  <div className='flex items-center gap-1.5 justify-end'>
                    <Button size='sm' onClick={() => setAssigningTenant(c)}>
                      <GitBranch size={13} /> Assign Playbook
                    </Button>
                    <Button size='sm' onClick={() => setLoggingTenant(c)}>
                      <PhoneCall size={13} /> Log Contact
                    </Button>
                  </div>
                </Td>
              </tr>
            );
          })}
          {!atRisk.length && (
            <tr>
              <Td
                colSpan={8}
                className='text-center py-10'
                style={{ color: T.text3 }}
              >
                No at-risk accounts
              </Td>
            </tr>
          )}
        </Table>
      </Card>
      <AssignPlaybookModal
        tenant={assigningTenant}
        onClose={() => setAssigningTenant(null)}
      />
      <LogContactModal
        tenant={loggingTenant}
        onClose={() => setLoggingTenant(null)}
      />
    </div>
  );
}

/* ---- Tab 2: Playbook Library ---- */
const makeBlankStep = () => ({
  id:
    'step-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  title: '',
  type: 'Call',
  slaDays: 1,
});

export function PlaybookForm({ initial, mode, onSave, onCancel }) {
  const [f, setF] = useState(() =>
    initial
      ? { ...initial, steps: initial.steps.map((s) => ({ ...s })) }
      : {
          name: '',
          description: '',
          riskTier: 'High',
          industry: 'All',
          status: 'Active',
          steps: [makeBlankStep()],
        },
  );
  const [errors, setErrors] = useState({});
  const u = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const updateStep = (i, patch) =>
    setF((p) => ({
      ...p,
      steps: p.steps.map((s, si) => (si === i ? { ...s, ...patch } : s)),
    }));
  const addStep = () =>
    setF((p) => ({ ...p, steps: [...p.steps, makeBlankStep()] }));
  const removeStep = (i) =>
    setF((p) => ({ ...p, steps: p.steps.filter((_, si) => si !== i) }));
  const moveStep = (i, dir) =>
    setF((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.steps.length) return p;
      const steps = [...p.steps];
      [steps[i], steps[j]] = [steps[j], steps[i]];
      return { ...p, steps };
    });

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    if (f.steps.length < 1) e.steps = 'At least 1 step required';
    f.steps.forEach((s, i) => {
      if (!s.title.trim()) e['step-' + i] = 'Title required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = () => {
    if (validate()) onSave(f);
  };

  return (
    <div className='space-y-5'>
      <div className='text-lg font-semibold' style={{ color: T.text }}>
        {mode === 'edit' ? 'Edit Playbook' : 'Create Playbook'}
      </div>
      <div>
        <label
          className='text-[11px] font-semibold uppercase tracking-wider'
          style={{ color: T.text3 }}
        >
          Name
          {errors.name && (
            <span style={{ color: T.danger }}> — {errors.name}</span>
          )}
        </label>
        <input
          value={f.name}
          onChange={(e) => u('name', e.target.value)}
          className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:ring-2'
          style={{
            borderColor: errors.name ? T.danger : T.border,
            '--tw-ring-color': T.ring,
          }}
        />
      </div>
      <div>
        <label
          className='text-[11px] font-semibold uppercase tracking-wider'
          style={{ color: T.text3 }}
        >
          Description
        </label>
        <textarea
          value={f.description}
          onChange={(e) => u('description', e.target.value)}
          rows={2}
          className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none'
          style={{ borderColor: T.border }}
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label
            className='text-[11px] font-semibold uppercase tracking-wider'
            style={{ color: T.text3 }}
          >
            Target Risk Tier
          </label>
          <select
            value={f.riskTier}
            onChange={(e) => u('riskTier', e.target.value)}
            className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none'
            style={{ borderColor: T.border }}
          >
            {PLAYBOOK_RISK_TIERS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            className='text-[11px] font-semibold uppercase tracking-wider'
            style={{ color: T.text3 }}
          >
            Industry
          </label>
          <select
            value={f.industry}
            onChange={(e) => u('industry', e.target.value)}
            className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none'
            style={{ borderColor: T.border }}
          >
            {PLAYBOOK_INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label
          className='text-[11px] font-semibold uppercase tracking-wider'
          style={{ color: T.text3 }}
        >
          Status
        </label>
        <select
          value={f.status}
          onChange={(e) => u('status', e.target.value)}
          className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none'
          style={{ borderColor: T.border }}
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>
      <div className='border-t pt-4' style={{ borderColor: T.border }}>
        <div
          className='text-[13px] font-semibold mb-3'
          style={{ color: T.text }}
        >
          Steps
          {errors.steps && (
            <span style={{ color: T.danger }}> — {errors.steps}</span>
          )}
        </div>
        <div className='space-y-2.5'>
          {f.steps.map((s, i) => {
            const Icon = STEP_TYPE_ICON[s.type];
            return (
              <div
                key={s.id}
                className='rounded-lg border p-3'
                style={{
                  borderColor: errors['step-' + i] ? T.danger : T.border,
                }}
              >
                <div className='flex items-start gap-2'>
                  <div
                    className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5'
                    style={{ background: T.primarySoft }}
                  >
                    <Icon size={14} style={{ color: T.primary }} />
                  </div>
                  <div className='flex-1 grid grid-cols-[1fr_140px_90px] gap-2'>
                    <div>
                      <input
                        value={s.title}
                        onChange={(e) =>
                          updateStep(i, { title: e.target.value })
                        }
                        placeholder='Step title'
                        className='w-full px-2.5 py-1.5 rounded-md border text-[13px] outline-none'
                        style={{
                          borderColor: errors['step-' + i]
                            ? T.danger
                            : T.border,
                        }}
                      />
                      {errors['step-' + i] && (
                        <div
                          className='text-[11px] mt-1'
                          style={{ color: T.danger }}
                        >
                          {errors['step-' + i]}
                        </div>
                      )}
                    </div>
                    <select
                      value={s.type}
                      onChange={(e) => updateStep(i, { type: e.target.value })}
                      className='px-2.5 py-1.5 rounded-md border text-[13px] outline-none'
                      style={{ borderColor: T.border }}
                    >
                      {STEP_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type='number'
                      min={1}
                      value={s.slaDays}
                      onChange={(e) =>
                        updateStep(i, { slaDays: Number(e.target.value) || 1 })
                      }
                      title='SLA days'
                      className='px-2.5 py-1.5 rounded-md border text-[13px] outline-none'
                      style={{ borderColor: T.border }}
                    />
                  </div>
                  <div className='flex flex-col gap-0.5 shrink-0'>
                    <button
                      onClick={() => moveStep(i, -1)}
                      disabled={i === 0}
                      className='p-0.5 rounded hover:bg-[var(--t-hover)] disabled:opacity-30'
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveStep(i, 1)}
                      disabled={i === f.steps.length - 1}
                      className='p-0.5 rounded hover:bg-[var(--t-hover)] disabled:opacity-30'
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeStep(i)}
                    disabled={f.steps.length <= 1}
                    className='p-1.5 rounded hover:bg-[var(--t-hover)] shrink-0 disabled:opacity-30'
                    title='Remove step'
                  >
                    <Trash2 size={14} style={{ color: T.danger }} />
                  </button>
                </div>
                <div
                  className='text-[10px] mt-1.5 ml-9'
                  style={{ color: T.text3 }}
                >
                  SLA: {s.slaDays} day{s.slaDays === 1 ? '' : 's'} after
                  assignment
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={addStep}
          className='mt-3 flex items-center gap-1.5 text-[12px] font-medium'
          style={{ color: T.primary }}
        >
          <Plus size={14} /> Add Step
        </button>
      </div>
      <div
        className='flex justify-end gap-2 border-t pt-4'
        style={{ borderColor: T.border }}
      >
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant='primary' onClick={submit}>
          <Check size={15} />{' '}
          {mode === 'edit' ? 'Save Changes' : 'Create Playbook'}
        </Button>
      </div>
    </div>
  );
}

export function CsPlaybookLibraryTab() {
  const store = useStore();
  const [statusF, setStatusF] = useState('All');
  const [drawer, setDrawer] = useState(null); // { mode: "create" | "edit", playbook }
  const rows = store.spPlaybooks.filter(
    (p) => statusF === 'All' || p.status === statusF,
  );
  const tenantsUsing = (id) =>
    new Set(
      store.tenantTasks
        .filter((t) => t.playbookId === id)
        .map((t) => t.tenantId),
    ).size;

  const handleSave = (pb) => {
    if (drawer.mode === 'edit') store.updatePlaybook(drawer.playbook.id, pb);
    else store.createPlaybook(pb);
    setDrawer(null);
  };
  const handleDuplicate = (p) => store.duplicatePlaybook(p.id);

  return (
    <div className='flex flex-col h-full min-h-0'>
      <div className='flex gap-2 items-center mb-3.5 flex-wrap shrink-0'>
        {['All', 'Active', 'Inactive'].map((f) => (
          <FilterPill
            key={f}
            active={statusF === f}
            onClick={() => setStatusF(f)}
          >
            {f}
          </FilterPill>
        ))}
        <Button
          variant='primary'
          className='ml-auto'
          onClick={() => setDrawer({ mode: 'create', playbook: null })}
        >
          <Plus size={15} /> Create Playbook
        </Button>
      </div>
      <Card className='flex-1 min-h-0 flex flex-col overflow-hidden'>
        <Table
          head={[
            'Name',
            'Target Tier',
            'Industry',
            'Steps',
            'Status',
            'Tenants Using',
            '',
          ]}
        >
          {rows.map((p) => (
            <tr key={p.id} className='hover:bg-[#F8F9FC]'>
              <Td className='font-medium'>{p.name}</Td>
              <Td>
                <Badge
                  tone={
                    p.riskTier === 'High'
                      ? 'danger'
                      : p.riskTier === 'Medium'
                        ? 'warning'
                        : 'gray'
                  }
                >
                  {p.riskTier}
                </Badge>
              </Td>
              <Td className='text-xs' style={{ color: T.text2 }}>
                {p.industry}
              </Td>
              <Td>{p.steps.length}</Td>
              <Td>{statusBadge(p.status)}</Td>
              <Td>{tenantsUsing(p.id)}</Td>
              <Td>
                <div className='flex items-center gap-1.5 justify-end'>
                  <Menu
                    items={[
                      {
                        label: 'Edit',
                        icon: Pencil,
                        onClick: () => setDrawer({ mode: 'edit', playbook: p }),
                      },
                      {
                        label: 'Duplicate',
                        icon: Copy,
                        onClick: () => handleDuplicate(p),
                      },
                      {
                        label:
                          p.status === 'Active' ? 'Deactivate' : 'Activate',
                        icon: p.status === 'Active' ? PauseCircle : PlayCircle,
                        onClick: () => store.togglePlaybookStatus(p.id),
                      },
                    ]}
                  />
                </div>
              </Td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <Td
                colSpan={7}
                className='text-center py-10'
                style={{ color: T.text3 }}
              >
                No playbooks match
              </Td>
            </tr>
          )}
        </Table>
      </Card>
      <Drawer open={!!drawer} onClose={() => setDrawer(null)} width={640}>
        {drawer && (
          <div className='p-6'>
            <PlaybookForm
              initial={drawer.playbook}
              mode={drawer.mode}
              onSave={handleSave}
              onCancel={() => setDrawer(null)}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* ---- Tab 3: Tenant Tasks ---- */
export function TaskDoneModal({ task, onClose }) {
  const store = useStore();
  const [notes, setNotes] = useState('');
  React.useEffect(() => {
    setNotes(task?.notes || '');
  }, [task?.id]);
  if (!task) return null;
  const save = () => {
    if (notes !== task.notes) store.updateTaskNotes(task.id, notes);
    store.updateTaskStatus(task.id, 'Done');
    onClose();
  };
  return (
    <Modal
      open={!!task}
      onClose={onClose}
      title={`Mark Done — ${task.title}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='primary' onClick={save}>
            <CheckCircle2 size={15} /> Mark Done
          </Button>
        </>
      }
    >
      <Field label='Notes (optional)'>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none'
          style={{ borderColor: T.border }}
        />
      </Field>
    </Modal>
  );
}
export function TaskSkipModal({ task, onClose }) {
  const store = useStore();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  React.useEffect(() => {
    setNote('');
    setError('');
  }, [task?.id]);
  if (!task) return null;
  const save = () => {
    const ok = store.updateTaskStatus(task.id, 'Skipped', note);
    if (!ok) {
      setError('Skip reason is required');
      return;
    }
    onClose();
  };
  return (
    <Modal
      open={!!task}
      onClose={onClose}
      title={`Skip Task — ${task.title}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='danger' onClick={save}>
            <XCircle size={15} /> Skip Task
          </Button>
        </>
      }
    >
      <Field label='Skip reason (required)'>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none'
          style={{ borderColor: error ? T.danger : T.border }}
        />
        {error && (
          <div className='text-xs mt-1' style={{ color: T.danger }}>
            {error}
          </div>
        )}
      </Field>
    </Modal>
  );
}
export function TaskNoteModal({ task, onClose }) {
  const store = useStore();
  const [notes, setNotes] = useState('');
  React.useEffect(() => {
    setNotes(task?.notes || '');
  }, [task?.id]);
  if (!task) return null;
  const save = () => {
    store.updateTaskNotes(task.id, notes);
    onClose();
  };
  return (
    <Modal
      open={!!task}
      onClose={onClose}
      title={`Note — ${task.title}`}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='primary' onClick={save}>
            Save Note
          </Button>
        </>
      }
    >
      <Field label='Notes'>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className='w-full mt-1 px-3 py-2 rounded-lg border text-[13px] outline-none resize-none'
          style={{ borderColor: T.border }}
        />
      </Field>
    </Modal>
  );
}

// Shared by the Tenant Tasks tab and the Tenant360 "Tasks" tab.
export function TaskActionsMenu({
  task,
  onMarkDone,
  onMarkInProgress,
  onSkip,
  onAddNote,
}) {
  return (
    <Menu
      items={[
        task.status !== 'Done'
          ? { label: 'Mark Done', icon: CheckCircle2, onClick: onMarkDone }
          : null,
        task.status !== 'In Progress' && task.status !== 'Done'
          ? {
              label: 'Mark In Progress',
              icon: Clock,
              onClick: onMarkInProgress,
            }
          : null,
        task.status !== 'Skipped' && task.status !== 'Done'
          ? { label: 'Skip', icon: XCircle, danger: true, onClick: onSkip }
          : null,
        { label: 'Add Note', icon: FileText, onClick: onAddNote },
      ].filter(Boolean)}
    />
  );
}

export function CsTenantTasksTab({ openTenant }) {
  const store = useStore();
  const [statusF, setStatusF] = useState('All');
  const [amF, setAmF] = useState('All');
  const [q, setQ] = useState('');
  const [doneTask, setDoneTask] = useState(null);
  const [skipTask, setSkipTask] = useState(null);
  const [noteTask, setNoteTask] = useState(null);

  const ams = ['All', ...Array.from(new Set(store.clients.map((c) => c.am)))];
  const rows = useMemo(
    () =>
      store.tenantTasks.filter(
        (t) =>
          (statusF === 'All' || t.status === statusF) &&
          (amF === 'All' || t.assignedTo === amF) &&
          t.tenantName.toLowerCase().includes(q.toLowerCase()),
      ),
    [store.tenantTasks, statusF, amF, q],
  );
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } =
    usePagination(rows, 10);

  const openCount = store.tenantTasks.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress',
  ).length;
  const overdueCount = store.tenantTasks.filter(isTaskOverdue).length;
  const doneThisWeek = store.tenantTasks.filter(
    (t) =>
      t.status === 'Done' &&
      t.completedDate &&
      parseDate(t.completedDate) >= new Date(TODAY_DATE.getTime() - 7 * 864e5),
  ).length;
  const doneTasks = store.tenantTasks.filter((t) => t.status === 'Done').length;
  const completionRate = store.tenantTasks.length
    ? Math.round((doneTasks / store.tenantTasks.length) * 100)
    : 0;
  const clientById = (id) => store.clients.find((c) => c.id === id);

  return (
    <div className='flex flex-col h-full min-h-0'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0'>
        <Kpi label='Open Tasks' value={String(openCount)} />
        <Kpi
          label='Overdue'
          value={String(overdueCount)}
          trend={overdueCount > 0 ? 'neg' : undefined}
        />
        <Kpi label='Done This Week' value={String(doneThisWeek)} trend='pos' />
        <Kpi label='Completion Rate' value={`${completionRate}%`} />
      </div>
      <div className='flex gap-2 items-center mb-3.5 flex-wrap shrink-0'>
        <SearchInput value={q} onChange={setQ} placeholder='Search tenant…' />
        <span
          className='text-[11px] font-semibold uppercase tracking-wider ml-1'
          style={{ color: T.text3 }}
        >
          Status
        </span>
        {['All', ...TASK_STATUSES].map((f) => (
          <FilterPill
            key={f}
            active={statusF === f}
            onClick={() => setStatusF(f)}
          >
            {f}
          </FilterPill>
        ))}
        <span
          className='text-[11px] font-semibold uppercase tracking-wider ml-1'
          style={{ color: T.text3 }}
        >
          AM
        </span>
        <div className='relative'>
          <select
            value={amF}
            onChange={(e) => setAmF(e.target.value)}
            className='appearance-none pl-2.5 pr-7 py-1.5 rounded-md text-xs border outline-none'
            style={{ borderColor: T.border, background: '#fff', color: T.text }}
          >
            {ams.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'
            style={{ color: T.text3 }}
          />
        </div>
      </div>
      <Card className='flex-1 min-h-0 flex flex-col overflow-hidden'>
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          perPage={perPage}
          setPerPage={setPerPage}
          total={total}
        />
        <Table
          head={[
            'Tenant',
            'Task',
            'Type',
            'Playbook',
            'Assigned To',
            'Due Date',
            'Status',
            '',
          ]}
        >
          {pageRows.map((t) => {
            const overdue = isTaskOverdue(t);
            const Icon = STEP_TYPE_ICON[t.type];
            const client = clientById(t.tenantId);
            return (
              <tr
                key={t.id}
                className='hover:bg-[#F8F9FC]'
                style={overdue ? { background: T.dangerSoft } : undefined}
              >
                <Td>
                  <button
                    onClick={() => client && openTenant(client)}
                    className='font-medium hover:underline'
                    style={{ color: T.primary }}
                  >
                    {t.tenantName}
                  </button>
                </Td>
                <Td className='font-medium'>{t.title}</Td>
                <Td>
                  <span
                    className='inline-flex items-center gap-1.5 text-xs'
                    style={{ color: T.text2 }}
                  >
                    <Icon size={13} />
                    {t.type}
                  </span>
                </Td>
                <Td className='text-xs' style={{ color: T.text2 }}>
                  {t.playbookName}
                </Td>
                <Td className='text-xs' style={{ color: T.text2 }}>
                  {t.assignedTo}
                </Td>
                <Td
                  className='text-xs font-mono'
                  style={{ color: overdue ? T.danger : T.text2 }}
                >
                  {t.dueDate}
                  {overdue ? ' (overdue)' : ''}
                </Td>
                <Td>{taskStatusBadge(t.status)}</Td>
                <Td>
                  <TaskActionsMenu
                    task={t}
                    onMarkDone={() => setDoneTask(t)}
                    onMarkInProgress={() =>
                      store.updateTaskStatus(t.id, 'In Progress')
                    }
                    onSkip={() => setSkipTask(t)}
                    onAddNote={() => setNoteTask(t)}
                  />
                </Td>
              </tr>
            );
          })}
          {!rows.length && (
            <tr>
              <Td
                colSpan={8}
                className='text-center py-10'
                style={{ color: T.text3 }}
              >
                No tasks match
              </Td>
            </tr>
          )}
        </Table>
      </Card>
      <TaskDoneModal task={doneTask} onClose={() => setDoneTask(null)} />
      <TaskSkipModal task={skipTask} onClose={() => setSkipTask(null)} />
      <TaskNoteModal task={noteTask} onClose={() => setNoteTask(null)} />
    </div>
  );
}

/* ---- Tab 4: Renewals ---- */
export function CsRenewalsTab() {
  const store = useStore();
  // Renewal status lives in local component state per the spec — it doesn't persist to the store.
  const [statusMap, setStatusMap] = useState({});
  const withDays = useMemo(
    () => store.clients.map((c) => ({ ...c, daysLeft: daysUntil(c.planEnd) })),
    [store.clients],
  );
  const overdueRows = useMemo(
    () =>
      withDays
        .filter((c) => c.daysLeft !== null && c.daysLeft < 0)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [withDays],
  );
  const rows = useMemo(
    () =>
      withDays
        .filter(
          (c) => c.daysLeft !== null && c.daysLeft >= 0 && c.daysLeft <= 60,
        )
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [withDays],
  );
  const { pageRows, page, setPage, perPage, setPerPage, totalPages, total } =
    usePagination(rows, 10);

  const due30 = rows.filter((c) => c.daysLeft <= 30);
  const due3160 = rows.filter((c) => c.daysLeft > 30 && c.daysLeft <= 60);
  const statusFor = (id) => statusMap[id] || 'Not Started';
  const confirmedCount = rows.filter(
    (c) => statusFor(c.id) === 'Confirmed',
  ).length;
  const setStatus = (id, status) => {
    setStatusMap((m) => ({ ...m, [id]: status }));
    store.notify('Renewal status updated');
  };
  const dayColor = (days) =>
    days < 15 ? T.danger : days <= 30 ? T.warning : T.success;

  const renewalStatusSelect = (c) => (
    <select
      value={statusFor(c.id)}
      onChange={(e) => setStatus(c.id, e.target.value)}
      className='px-2.5 py-1.5 rounded-md border text-xs outline-none'
      style={{ borderColor: T.border, background: '#fff' }}
    >
      {RENEWAL_STATUSES.map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  );

  return (
    <div className='flex flex-col h-full min-h-0 overflow-y-auto'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0'>
        <Kpi
          label='Due in 30d'
          value={String(due30.length)}
          sub={fmtINR(due30.reduce((s, c) => s + c.mrr, 0)) + ' MRR'}
          trend='warn'
        />
        <Kpi
          label='Due in 31–60d'
          value={String(due3160.length)}
          sub={fmtINR(due3160.reduce((s, c) => s + c.mrr, 0)) + ' MRR'}
        />
        <Kpi
          label='Overdue'
          value={String(overdueRows.length)}
          trend={overdueRows.length > 0 ? 'neg' : undefined}
        />
        <Kpi label='Confirmed' value={String(confirmedCount)} trend='pos' />
      </div>
      {overdueRows.length > 0 && (
        <Card className='mb-4 shrink-0'>
          <CardHeader
            title='Overdue Renewals'
            action={<Badge tone='danger'>{overdueRows.length} tenants</Badge>}
          />
          <Table
            head={[
              'Tenant',
              'Industry',
              'MRR',
              'Plan End',
              'Days Overdue',
              'AM',
              'Renewal Status',
            ]}
            maxHeight={240}
          >
            {overdueRows.map((c) => (
              <tr key={c.id} style={{ background: T.dangerSoft }}>
                <Td className='font-medium'>{c.name}</Td>
                <Td className='text-xs' style={{ color: T.text2 }}>
                  {c.industry}
                </Td>
                <Td className='font-medium'>{c.mrr ? fmtINR(c.mrr) : '—'}</Td>
                <Td className='text-xs font-mono' style={{ color: T.text2 }}>
                  {c.planEnd}
                </Td>
                <Td>
                  <span className='font-semibold' style={{ color: T.danger }}>
                    {-c.daysLeft}d overdue
                  </span>
                </Td>
                <Td className='text-xs' style={{ color: T.text2 }}>
                  {c.am}
                </Td>
                <Td>{renewalStatusSelect(c)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
      <Card className='flex-1 min-h-0 flex flex-col overflow-hidden'>
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          perPage={perPage}
          setPerPage={setPerPage}
          total={total}
        />
        <Table
          head={[
            'Tenant',
            'Industry',
            'MRR',
            'Plan End',
            'Days Left',
            'AM',
            'Renewal Status',
          ]}
        >
          {pageRows.map((c) => (
            <tr key={c.id} className='hover:bg-[#F8F9FC]'>
              <Td className='font-medium'>{c.name}</Td>
              <Td className='text-xs' style={{ color: T.text2 }}>
                {c.industry}
              </Td>
              <Td className='font-medium'>{c.mrr ? fmtINR(c.mrr) : '—'}</Td>
              <Td className='text-xs font-mono' style={{ color: T.text2 }}>
                {c.planEnd}
              </Td>
              <Td>
                <span
                  className='font-semibold'
                  style={{ color: dayColor(c.daysLeft) }}
                >
                  {c.daysLeft}d
                </span>
              </Td>
              <Td className='text-xs' style={{ color: T.text2 }}>
                {c.am}
              </Td>
              <Td>{renewalStatusSelect(c)}</Td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <Td
                colSpan={7}
                className='text-center py-10'
                style={{ color: T.text3 }}
              >
                No renewals due within 60 days
              </Td>
            </tr>
          )}
        </Table>
      </Card>
    </div>
  );
}
