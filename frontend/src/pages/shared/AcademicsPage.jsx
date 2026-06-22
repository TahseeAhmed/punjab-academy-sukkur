import { useEffect, useState } from 'react';
import { ClipboardList, Plus, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, Button, Input, Select, Textarea, Badge, EmptyState, Spinner } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

const EXAM_TYPES = ['quiz', 'midterm', 'final', 'assignment'];

function AssignmentsPanel({ role }) {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', classSection: '', dueDate: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [a, c, s] = await Promise.all([api.get('/assignments'), api.get('/classes'), api.get('/subjects')]);
      setAssignments(a.data);
      setClasses(c.data);
      setSubjects(s.data);
    } catch {
      toast.error('Could not load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/assignments', form);
      toast.success('Assignment posted');
      setModalOpen(false);
      setForm({ title: '', description: '', subject: '', classSection: '', dueDate: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted');
      load();
    } catch {
      toast.error('Could not delete');
    }
  };

  const canCreate = role === 'admin' || role === 'teacher';
  const filteredSubjects = subjects.filter((s) => !form.classSection || s.classSection?._id === form.classSection);

  return (
    <Card>
      <CardHeader
        title="Assignments"
        action={canCreate && <Button size="sm" onClick={() => setModalOpen(true)}><Plus size={15} /> New assignment</Button>}
      />
      {loading ? (
        <div className="flex justify-center py-14"><Spinner className="w-7 h-7" /></div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments yet" />
      ) : (
        <div className="divide-y divide-border">
          {assignments.map((a) => (
            <div key={a._id} className="px-6 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{a.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {a.subject?.name} · {a.classSection?.className}-{a.classSection?.section} · Due {new Date(a.dueDate).toLocaleDateString()}
                </p>
                {a.description && <p className="text-sm text-ink-muted mt-1.5">{a.description}</p>}
              </div>
              {canCreate && (
                <button onClick={() => handleDelete(a._id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-ink-muted hover:text-danger shrink-0">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post new assignment">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Class" required value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value, subject: '' })}>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
          </Select>
          <Select label="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
            <option value="">Select subject</option>
            {filteredSubjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </Select>
          <Input label="Due date" type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Posting…' : 'Post assignment'}</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

function ResultsEntryPanel() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('midterm');
  const [term, setTerm] = useState('Term 1 2026');
  const [totalMarks, setTotalMarks] = useState(100);
  const [marksMap, setMarksMap] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/classes'), api.get('/subjects')]).then(([c, s]) => { setClasses(c.data); setSubjects(s.data); });
  }, []);

  useEffect(() => {
    if (classId) {
      api.get('/students', { params: { classSection: classId, status: 'active', limit: 200 } }).then((res) => setStudents(res.data.students));
    } else {
      setStudents([]);
    }
  }, [classId]);

  const filteredSubjects = subjects.filter((s) => s.classSection?._id === classId);

  const handleSaveAll = async () => {
    if (!subjectId) { toast.error('Select a subject first'); return; }
    const entries = Object.entries(marksMap).filter(([, v]) => v !== '' && v !== undefined);
    if (entries.length === 0) { toast.error('Enter marks for at least one student'); return; }
    setSaving(true);
    try {
      await Promise.all(entries.map(([studentId, marks]) =>
        api.post('/results', {
          student: studentId, subject: subjectId, classSection: classId,
          examType, term, marksObtained: Number(marks), totalMarks: Number(totalMarks),
        })
      ));
      toast.success(`Results saved for ${entries.length} student(s)`);
      setMarksMap({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save results');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Enter exam results" />
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-border">
        <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setSubjectId(''); }}>
          <option value="">Select class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
        </Select>
        <Select label="Subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">Select subject</option>
          {filteredSubjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </Select>
        <Select label="Exam type" value={examType} onChange={(e) => setExamType(e.target.value)}>
          {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Term" value={term} onChange={(e) => setTerm(e.target.value)} />
        <Input label="Total marks" type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
      </div>

      {classId && students.length > 0 && (
        <>
          <div className="divide-y divide-border">
            {students.map((s) => (
              <div key={s._id} className="px-6 py-2.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{s.user.name}</p>
                  <p className="text-xs text-ink-muted font-mono">{s.rollNumber}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={totalMarks}
                  value={marksMap[s._id] ?? ''}
                  onChange={(e) => setMarksMap({ ...marksMap, [s._id]: e.target.value })}
                  placeholder="Marks"
                  className="w-24 px-2 py-1.5 rounded-lg border border-border-strong text-sm text-right focus:border-forest outline-none"
                />
              </div>
            ))}
          </div>
          <div className="p-5 flex justify-end">
            <Button onClick={handleSaveAll} disabled={saving}>{saving ? 'Saving…' : 'Save results'}</Button>
          </div>
        </>
      )}
      {classId && students.length === 0 && <EmptyState title="No active students in this class" />}
    </Card>
  );
}

function StudentResultsPanel() {
  const [term, setTerm] = useState('Term 1 2026');
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (t) => {
    setLoading(true);
    try {
      const { data: summary } = await api.get('/dashboard/student-summary');
      const { data } = await api.get(`/results/card/${summary.student._id}`, { params: { term: t } });
      setCard(data);
    } catch {
      toast.error('Could not load result card');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(term); /* eslint-disable-next-line */ }, []);

  return (
    <Card>
      <CardHeader
        title="Result card"
        action={
          <div className="flex gap-2 items-center">
            <Input value={term} onChange={(e) => setTerm(e.target.value)} className="w-40" />
            <Button size="sm" variant="outline" onClick={() => load(term)}>Load</Button>
          </div>
        }
      />
      {loading ? (
        <div className="flex justify-center py-14"><Spinner className="w-7 h-7" /></div>
      ) : !card || card.results.length === 0 ? (
        <EmptyState icon={Award} title="No results for this term" description="Try a different term, e.g. Term 1 2026." />
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium">Exam</th>
                  <th className="px-6 py-3 font-medium text-right">Marks</th>
                  <th className="px-6 py-3 font-medium text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {card.results.map((r) => (
                  <tr key={r._id}>
                    <td className="px-6 py-3">{r.subject?.name}</td>
                    <td className="px-6 py-3 text-ink-muted capitalize">{r.examType}</td>
                    <td className="px-6 py-3 text-right font-mono text-xs">{r.marksObtained}/{r.totalMarks}</td>
                    <td className="px-6 py-3 text-right"><Badge tone="gold">{r.grade}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end gap-8">
            <p className="text-sm text-ink-muted">Total: <span className="font-mono text-ink">{card.totalObtained}/{card.totalMax}</span></p>
            <p className="text-sm text-ink-muted">Percentage: <span className="font-display font-semibold text-forest">{card.percentage}%</span></p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AcademicsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Academics" subtitle={user.role === 'student' ? 'Assignments and your results' : 'Assignments and exam results'}>
      <div className="space-y-6">
        <AssignmentsPanel role={user.role} />
        {(user.role === 'admin' || user.role === 'teacher') && <ResultsEntryPanel />}
        {user.role === 'student' && <StudentResultsPanel />}
      </div>
    </DashboardLayout>
  );
}
