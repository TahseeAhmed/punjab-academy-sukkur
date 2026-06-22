import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Pin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, Button, Input, Select, Textarea, EmptyState, Spinner } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', audience: 'all', classSection: '', isPinned: false });

  const canPost = user.role === 'admin' || user.role === 'teacher';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notices');
      setNotices(data);
      if (canPost) {
        const c = await api.get('/classes');
        setClasses(c.data);
      }
    } catch {
      toast.error('Could not load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/notices', form);
      toast.success('Notice posted');
      setModalOpen(false);
      setForm({ title: '', content: '', audience: 'all', classSection: '', isPinned: false });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success('Notice deleted');
      load();
    } catch {
      toast.error('Could not delete notice');
    }
  };

  return (
    <DashboardLayout title="Notices" subtitle="Announcements from the academy">
      <Card>
        <CardHeader title="All notices" action={canPost && <Button size="sm" onClick={() => setModalOpen(true)}><Plus size={15} /> New notice</Button>} />
        {loading ? (
          <div className="flex justify-center py-14"><Spinner className="w-7 h-7" /></div>
        ) : notices.length === 0 ? (
          <EmptyState icon={Megaphone} title="No notices yet" />
        ) : (
          <div className="divide-y divide-border">
            {notices.map((n) => (
              <div key={n._id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {n.isPinned && <Pin size={13} className="text-gold shrink-0" />}
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                  </div>
                  <p className="text-sm text-ink-muted mt-1.5 whitespace-pre-wrap">{n.content}</p>
                  <p className="text-xs text-ink-muted mt-2">
                    {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString()} · audience: {n.audience}
                    {n.classSection && ` (${n.classSection.className}-${n.classSection.section})`}
                  </p>
                </div>
                {canPost && (user.role === 'admin' || n.postedBy?._id === user._id) && (
                  <button onClick={() => handleDelete(n._id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-ink-muted hover:text-danger shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post a notice">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Content" rows={4} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <Select label="Audience" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            <option value="all">Everyone</option>
            <option value="teachers">Teachers only</option>
            <option value="students">Students only</option>
            <option value="class">A specific class</option>
          </Select>
          {form.audience === 'class' && (
            <Select label="Class" required value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value })}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
            </Select>
          )}
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="rounded border-border-strong" />
            Pin to top
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Posting…' : 'Post notice'}</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
