import { useEffect, useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, Button, Input, Select, EmptyState, Spinner } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classModal, setClassModal] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);
  const [classForm, setClassForm] = useState({ className: '', section: '', academicYear: '2025-2026', capacity: 50 });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', classSection: '', teacher: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, s, t] = await Promise.all([api.get('/classes'), api.get('/subjects'), api.get('/teachers')]);
      setClasses(c.data);
      setSubjects(s.data);
      setTeachers(t.data);
    } catch {
      toast.error('Could not load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/classes', classForm);
      toast.success('Class created');
      setClassModal(false);
      setClassForm({ className: '', section: '', academicYear: '2025-2026', capacity: 50 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create class');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Delete this class? This only works if no active students are assigned.')) return;
    try {
      await api.delete(`/classes/${id}`);
      toast.success('Class deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete class');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/subjects', subjectForm);
      toast.success('Subject created');
      setSubjectModal(false);
      setSubjectForm({ name: '', code: '', classSection: '', teacher: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      load();
    } catch {
      toast.error('Could not delete subject');
    }
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Classes & Subjects" subtitle="Set up the class structure your academy teaches">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Classes" action={<Button size="sm" onClick={() => setClassModal(true)}><Plus size={15} /> New class</Button>} />
          {classes.length === 0 ? (
            <EmptyState icon={BookOpen} title="No classes yet" description="Create your first class & section." />
          ) : (
            <div className="divide-y divide-border">
              {classes.map((c) => (
                <div key={c._id} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{c.className} — Section {c.section}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {c.academicYear} · {c.studentCount} student{c.studentCount !== 1 ? 's' : ''}
                      {c.classTeacher?.user && ` · Class teacher: ${c.classTeacher.user.name}`}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteClass(c._id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-ink-muted hover:text-danger">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Subjects" action={<Button size="sm" onClick={() => setSubjectModal(true)}><Plus size={15} /> New subject</Button>} />
          {subjects.length === 0 ? (
            <EmptyState icon={BookOpen} title="No subjects yet" description="Add subjects and assign teachers to them." />
          ) : (
            <div className="divide-y divide-border">
              {subjects.map((s) => (
                <div key={s._id} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{s.name} <span className="font-mono text-xs text-ink-muted">({s.code})</span></p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {s.classSection?.className}-{s.classSection?.section}
                      {s.teacher?.user && ` · ${s.teacher.user.name}`}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteSubject(s._id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-ink-muted hover:text-danger">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={classModal} onClose={() => setClassModal(false)} title="Create class & section">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <Input label="Class name" required placeholder="e.g. Class 9, FSC Part 1" value={classForm.className} onChange={(e) => setClassForm({ ...classForm, className: e.target.value })} />
          <Input label="Section" required placeholder="e.g. A" value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} />
          <Input label="Academic year" required value={classForm.academicYear} onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })} />
          <Input label="Capacity" type="number" value={classForm.capacity} onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setClassModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create class'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={subjectModal} onClose={() => setSubjectModal(false)} title="Create subject">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <Input label="Subject name" required placeholder="e.g. Mathematics" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
          <Input label="Subject code" required placeholder="e.g. MATH9" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} />
          <Select label="Class & Section" required value={subjectForm.classSection} onChange={(e) => setSubjectForm({ ...subjectForm, classSection: e.target.value })}>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
          </Select>
          <Select label="Teacher" value={subjectForm.teacher} onChange={(e) => setSubjectForm({ ...subjectForm, teacher: e.target.value })}>
            <option value="">Unassigned</option>
            {teachers.map((t) => <option key={t._id} value={t._id}>{t.user.name}</option>)}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setSubjectModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create subject'}</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
