import { useEffect, useState } from 'react';
import { Search, Plus, Pencil, UserX, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Select, Badge, EmptyState, Spinner } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

const emptyForm = {
  name: '', email: '', password: '', phone: '', rollNumber: '', classSection: '',
  dateOfBirth: '', gender: '', address: '', guardianName: '', guardianPhone: '', guardianEmail: '', bloodGroup: '',
};

export default function StudentsPage() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadClasses = () => api.get('/classes').then((res) => setClasses(res.data));

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (classFilter) params.classSection = classFilter;
      const { data } = await api.get('/students', { params });
      setStudents(data.students);
    } catch {
      toast.error('Could not load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => {
    const t = setTimeout(loadStudents, 300);
    return () => clearTimeout(t);
  }, [search, classFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (st) => {
    setEditing(st);
    setForm({
      name: st.user.name, email: st.user.email, password: '', phone: st.user.phone || '',
      rollNumber: st.rollNumber, classSection: st.classSection._id,
      dateOfBirth: st.dateOfBirth ? st.dateOfBirth.slice(0, 10) : '',
      gender: st.gender || '', address: st.address || '', guardianName: st.guardianName || '',
      guardianPhone: st.guardianPhone || '', guardianEmail: st.guardianEmail || '', bloodGroup: st.bloodGroup || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, form);
        toast.success('Student updated');
      } else {
        await api.post('/students', form);
        toast.success('Student registered');
      }
      setModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (st) => {
    if (!window.confirm(`Deactivate ${st.user.name}? They will no longer be able to log in.`)) return;
    try {
      await api.delete(`/students/${st._id}`);
      toast.success('Student deactivated');
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not deactivate');
    }
  };

  return (
    <DashboardLayout title={isAdmin ? 'Students' : 'My Students'} subtitle={`${students.length} student${students.length !== 1 ? 's' : ''}`}>
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-border">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll number or email…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-strong bg-surface text-sm focus:border-forest outline-none"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border-strong bg-surface text-sm focus:border-forest outline-none"
          >
            <option value="">All classes</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
          </select>
          {isAdmin && (
            <Button onClick={openCreate}><Plus size={16} /> Add student</Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-7 h-7" /></div>
        ) : students.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students found" description="Try a different search or add a new student." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Roll No.</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Class</th>
                  <th className="px-6 py-3 font-medium">Guardian</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  {isAdmin && <th className="px-6 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-paper/60">
                    <td className="px-6 py-3.5 font-mono text-xs text-ink-muted">{st.rollNumber}</td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-ink">{st.user.name}</p>
                      <p className="text-xs text-ink-muted">{st.user.email}</p>
                    </td>
                    <td className="px-6 py-3.5 text-ink-muted">{st.classSection?.className} - {st.classSection?.section}</td>
                    <td className="px-6 py-3.5 text-ink-muted">
                      {st.guardianName || '—'}
                      {st.guardianPhone && <span className="block text-xs">{st.guardianPhone}</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge tone={st.status === 'active' ? 'success' : 'neutral'}>{st.status}</Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(st)} className="p-1.5 rounded-lg hover:bg-paper text-ink-muted hover:text-forest" title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDeactivate(st)} className="p-1.5 rounded-lg hover:bg-danger-50 text-ink-muted hover:text-danger" title="Deactivate">
                            <UserX size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit student' : 'Register new student'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Roll number" required value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input
              label={editing ? 'New password (leave blank to keep)' : 'Password'}
              type="password"
              required={!editing}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Select label="Class & Section" required value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value })}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
            </Select>
            <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
            <Input label="Blood group" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-ink mb-3">Guardian details</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Guardian name" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
              <Input label="Guardian phone" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
              <Input label="Guardian email" value={form.guardianEmail} onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })} />
              <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Register student'}</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
