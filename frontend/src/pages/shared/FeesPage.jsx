import { useEffect, useState } from 'react';
import { Plus, Wallet, Receipt, FileBarChart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, Button, Input, Select, Badge, EmptyState, Spinner } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));

function AdminFees() {
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', month: '', year: new Date().getFullYear() });
  const [createModal, setCreateModal] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [reportModal, setReportModal] = useState(false);
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({ scope: 'class', student: '', classSection: '', month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(), amount: '', dueDate: '' });
  const [payForm, setPayForm] = useState({ paidAmount: '', paymentMethod: 'cash', remarks: '' });
  const [students, setStudents] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      const [f, c] = await Promise.all([api.get('/fees', { params }), api.get('/classes')]);
      setFees(f.data);
      setClasses(c.data);
    } catch {
      toast.error('Could not load fee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters]);

  useEffect(() => {
    if (createForm.scope === 'single' && createForm.classSection) {
      api.get('/students', { params: { classSection: createForm.classSection, status: 'active', limit: 200 } })
        .then((res) => setStudents(res.data.students));
    }
  }, [createForm.scope, createForm.classSection]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        month: createForm.month, year: createForm.year, amount: Number(createForm.amount), dueDate: createForm.dueDate,
        ...(createForm.scope === 'class' ? { classSection: createForm.classSection } : { student: createForm.student }),
      };
      await api.post('/fees', payload);
      toast.success('Fee record(s) created');
      setCreateModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create fee record');
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/fees/${payModal._id}/pay`, { ...payForm, paidAmount: Number(payForm.paidAmount) });
      toast.success('Payment recorded');
      setPayModal(null);
      setPayForm({ paidAmount: '', paymentMethod: 'cash', remarks: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record payment');
    } finally {
      setSaving(false);
    }
  };

  const loadReport = async () => {
    try {
      const { data } = await api.get('/fees/report', { params: { month: filters.month || MONTHS[new Date().getMonth()], year: filters.year } });
      setReport(data);
      setReportModal(true);
    } catch {
      toast.error('Could not load report');
    }
  };

  const statusTone = { paid: 'success', partial: 'warning', unpaid: 'danger' };

  return (
    <div>
      <Card>
        <div className="flex flex-wrap gap-3 p-5 border-b border-border items-end">
          <Select label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </Select>
          <Select label="Month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
            <option value="">All months</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Input label="Year" type="number" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="w-28" />
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={loadReport}><FileBarChart size={16} /> Monthly report</Button>
            <Button onClick={() => setCreateModal(true)}><Plus size={16} /> Create fee record</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-7 h-7" /></div>
        ) : fees.length === 0 ? (
          <EmptyState icon={Wallet} title="No fee records found" description="Create fee records for a class or an individual student." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Student</th>
                  <th className="px-6 py-3 font-medium">Month</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Paid</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fees.map((f) => (
                  <tr key={f._id} className="hover:bg-paper/60">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-ink">{f.student?.user?.name}</p>
                      <p className="text-xs text-ink-muted">{f.student?.classSection?.className}-{f.student?.classSection?.section}</p>
                    </td>
                    <td className="px-6 py-3.5 text-ink-muted">{f.month} {f.year}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-xs">Rs {f.amount.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-xs">Rs {f.paidAmount.toLocaleString()}</td>
                    <td className="px-6 py-3.5"><Badge tone={statusTone[f.status]}>{f.status}</Badge></td>
                    <td className="px-6 py-3.5 text-right">
                      {f.status !== 'paid' && (
                        <Button size="sm" variant="secondary" onClick={() => { setPayModal(f); setPayForm({ paidAmount: f.amount - f.paidAmount, paymentMethod: 'cash', remarks: '' }); }}>
                          <Receipt size={14} /> Record payment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create fee record">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setCreateForm({ ...createForm, scope: 'class' })} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${createForm.scope === 'class' ? 'bg-forest text-white border-forest' : 'border-border-strong text-ink-muted'}`}>Whole class</button>
            <button type="button" onClick={() => setCreateForm({ ...createForm, scope: 'single' })} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${createForm.scope === 'single' ? 'bg-forest text-white border-forest' : 'border-border-strong text-ink-muted'}`}>Single student</button>
          </div>
          <Select label="Class" required value={createForm.classSection} onChange={(e) => setCreateForm({ ...createForm, classSection: e.target.value })}>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
          </Select>
          {createForm.scope === 'single' && (
            <Select label="Student" required value={createForm.student} onChange={(e) => setCreateForm({ ...createForm, student: e.target.value })}>
              <option value="">Select student</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.user.name} ({s.rollNumber})</option>)}
            </Select>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Month" required value={createForm.month} onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
            <Input label="Year" type="number" required value={createForm.year} onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })} />
            <Input label="Amount (Rs)" type="number" required value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} />
            <Input label="Due date" type="date" required value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!payModal} onClose={() => setPayModal(null)} title={`Record payment — ${payModal?.student?.user?.name || ''}`}>
        {payModal && (
          <form onSubmit={handlePay} className="space-y-4">
            <p className="text-sm text-ink-muted">Outstanding: <span className="font-mono text-ink">Rs {(payModal.amount - payModal.paidAmount).toLocaleString()}</span></p>
            <Input label="Amount paid now (Rs)" type="number" required value={payForm.paidAmount} onChange={(e) => setPayForm({ ...payForm, paidAmount: e.target.value })} />
            <Select label="Payment method" value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="online">Online</option>
              <option value="cheque">Cheque</option>
            </Select>
            <Input label="Remarks (optional)" value={payForm.remarks} onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setPayModal(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Recording…' : 'Record payment & generate receipt'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={reportModal} onClose={() => setReportModal(false)} title="Monthly fee collection report" maxWidth="max-w-2xl">
        {report && (
          <div>
            <div className="grid grid-cols-3 gap-4 text-center mb-5">
              <div><p className="text-xs text-ink-muted mb-1">Expected</p><p className="font-display text-xl font-semibold">Rs {report.totalExpected.toLocaleString()}</p></div>
              <div><p className="text-xs text-ink-muted mb-1">Collected</p><p className="font-display text-xl font-semibold text-success">Rs {report.totalCollected.toLocaleString()}</p></div>
              <div><p className="text-xs text-ink-muted mb-1">Outstanding</p><p className="font-display text-xl font-semibold text-danger">Rs {report.totalOutstanding.toLocaleString()}</p></div>
            </div>
            <div className="flex gap-2 justify-center">
              <Badge tone="success">{report.byStatus.paid} paid</Badge>
              <Badge tone="warning">{report.byStatus.partial} partial</Badge>
              <Badge tone="danger">{report.byStatus.unpaid} unpaid</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fees/my').then((res) => setFees(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;

  const statusTone = { paid: 'success', partial: 'warning', unpaid: 'danger' };

  return (
    <Card>
      <CardHeader title="Your fee records" />
      {fees.length === 0 ? <EmptyState icon={Wallet} title="No fee records yet" /> : (
        <div className="divide-y divide-border">
          {fees.map((f) => (
            <div key={f._id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{f.month} {f.year}</p>
                <p className="text-xs text-ink-muted mt-0.5">Due {new Date(f.dueDate).toLocaleDateString()}{f.receiptNumber && ` · Receipt ${f.receiptNumber}`}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-ink">Rs {f.paidAmount.toLocaleString()} / {f.amount.toLocaleString()}</p>
                <Badge tone={statusTone[f.status]}>{f.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function FeesPage() {
  const { user } = useAuth();
  return (
    <DashboardLayout title={user.role === 'student' ? 'My Fees' : 'Fee Management'} subtitle={user.role === 'student' ? 'Your payment history' : 'Track collections and outstanding balances'}>
      {user.role === 'student' ? <StudentFees /> : <AdminFees />}
    </DashboardLayout>
  );
}
