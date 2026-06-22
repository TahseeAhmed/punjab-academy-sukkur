import { useEffect, useState } from 'react';
import { Search, Plus, Pencil, UserX, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Button, Badge, EmptyState, Spinner, Input } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

const emptyForm = { name: '', email: '', password: '', phone: '', employeeId: '', qualification: '', assignedClasses: [] };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([
        api.get('/teachers', { params: search ? { search } : {} }),
        api.get('/classes'),
      ]);
      setTeachers(t.data);
      setClasses(c.data);
    } catch {
      toast.error('Could not load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.user.name, email: t.user.email, password: '', phone: t.user.phone || '',
      employeeId: t.employeeId, qualification: t.qualification || '',
      assignedClasses: t.assignedClasses.map((c) => c._id),
    });
    setModalOpen(true);
  };

  const toggleClass = (id) => {
    setForm((f) => ({
      ...f,
      assignedClasses: f.assignedClasses.includes(id)
        ? f.assignedClasses.filter((c) => c !== id)
        : [...f.assignedClasses, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/teachers/${editing._id}`, form);
        toast.success('Teacher updated');
      } else {
        await api.post('/teachers', form);
        toast.success('Teacher added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (t) => {
    if (!window.confirm(`Deactivate ${t.user.name}?`)) return;
    try {
      await api.delete(`/teachers/${t._id}`);
      toast.success('Teacher deactivated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not deactivate');
    }
  };

  return (
    <DashboardLayout title="Teachers" subtitle={`${teachers.length} teacher${teachers.length !== 1 ? 's' : ''}`}>
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-border">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, employee ID or email…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-strong bg-surface text-sm focus:border-forest outline-none"
            />
          </div>
          <Button onClick={openCreate}><Plus size={16} /> Add teacher</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-7 h-7" /></div>
        ) : teachers.length === 0 ? (
          <EmptyState icon={Users} title="No teachers found" description="Add your first teacher to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Employee ID</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Assigned classes</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teachers.map((t) => (
                  <tr key={t._id} className="hover:bg-paper/60">
                    <td className="px-6 py-3.5 font-mono text-xs text-ink-muted">{t.employeeId}</td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-ink">{t.user.name}</p>
                      <p className="text-xs text-ink-muted">{t.user.email}</p>
                    </td>
                    <td className="px-6 py-3.5 text-ink-muted">
                      {t.assignedClasses.length === 0 ? '—' : t.assignedClasses.map((c) => `${c.className}-${c.section}`).join(', ')}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge tone={t.status === 'active' ? 'success' : 'neutral'}>{t.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-paper text-ink-muted hover:text-forest" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDeactivate(t)} className="p-1.5 rounded-lg hover:bg-danger-50 text-ink-muted hover:text-danger" title="Deactivate">
                          <UserX size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit teacher' : 'Add new teacher'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Employee ID" required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input
              label={editing ? 'New password (leave blank to keep)' : 'Password'}
              type="password"
              required={!editing}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
          </div>

          <div>
            <span className="block text-sm font-medium text-ink mb-2">Assigned classes</span>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <button
                  type="button"
                  key={c._id}
                  onClick={() => toggleClass(c._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.assignedClasses.includes(c._id)
                      ? 'bg-forest text-white border-forest'
                      : 'bg-surface text-ink-muted border-border-strong hover:border-forest'
                  }`}
                >
                  {c.className} - {c.section}
                </button>
              ))}
              {classes.length === 0 && <p className="text-xs text-ink-muted">No classes created yet.</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add teacher'}</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
