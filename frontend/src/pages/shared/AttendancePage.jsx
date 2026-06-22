import { useEffect, useState } from 'react';
import { CalendarCheck, Check, X as XIcon, Clock3, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, Button, Select, Badge, EmptyState, Spinner } from '../../components/ui';

const STATUS_OPTS = [
  { key: 'present', label: 'Present', icon: Check, tone: 'success' },
  { key: 'absent', label: 'Absent', icon: XIcon, tone: 'danger' },
  { key: 'leave', label: 'Leave', icon: Clock3, tone: 'warning' },
  { key: 'late', label: 'Late', icon: Clock3, tone: 'warning' },
];

function StaffAttendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get('/classes').then((res) => setClasses(res.data));
  }, []);

  const loadClassForDate = async () => {
    if (!classId) return;
    setLoading(true);
    setReport(null);
    try {
      const [studentsRes, existingRes] = await Promise.all([
        api.get('/students', { params: { classSection: classId, status: 'active', limit: 200 } }),
        api.get(`/attendance/class/${classId}`, { params: { date } }),
      ]);
      setStudents(studentsRes.data.students);
      const existing = {};
      existingRes.data.forEach((r) => { existing[r.student._id] = r.status; });
      setMarks(existing);
    } catch {
      toast.error('Could not load class attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClassForDate(); /* eslint-disable-next-line */ }, [classId, date]);

  const setMark = (studentId, status) => setMarks((m) => ({ ...m, [studentId]: status }));

  const markAll = (status) => {
    const all = {};
    students.forEach((s) => { all[s._id] = status; });
    setMarks(all);
  };

  const handleSave = async () => {
    const records = students
      .filter((s) => marks[s._id])
      .map((s) => ({ student: s._id, status: marks[s._id] }));
    if (records.length === 0) {
      toast.error('Mark at least one student before saving');
      return;
    }
    setSaving(true);
    try {
      await api.post('/attendance/mark', { classSection: classId, date, records });
      toast.success(`Attendance saved for ${records.length} student${records.length !== 1 ? 's' : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save attendance');
    } finally {
      setSaving(false);
    }
  };

  const loadReport = async () => {
    if (!classId) { toast.error('Select a class first'); return; }
    try {
      const { data } = await api.get(`/attendance/report/${classId}`, { params: { month, year } });
      setReport(data);
    } catch {
      toast.error('Could not load report');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Mark daily attendance" />
        <div className="p-5 flex flex-wrap gap-3 items-end border-b border-border">
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)} className="min-w-[200px]">
            <option value="">Select a class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.className} - {c.section}</option>)}
          </Select>
          <label className="block">
            <span className="block text-sm font-medium text-ink mb-1.5">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} className="px-3 py-2 rounded-lg border border-border-strong bg-surface text-sm focus:border-forest outline-none" />
          </label>
          {students.length > 0 && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => markAll('present')}>Mark all present</Button>
              <Button onClick={handleSave} disabled={saving} size="sm">{saving ? 'Saving…' : 'Save attendance'}</Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-14"><Spinner className="w-7 h-7" /></div>
        ) : !classId ? (
          <EmptyState icon={CalendarCheck} title="Choose a class to begin" description="Select a class and date above to mark attendance." />
        ) : students.length === 0 ? (
          <EmptyState title="No active students in this class" />
        ) : (
          <div className="divide-y divide-border">
            {students.map((s) => (
              <div key={s._id} className="px-6 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{s.user.name}</p>
                  <p className="text-xs text-ink-muted font-mono">{s.rollNumber}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {STATUS_OPTS.map(({ key, label, icon: Icon, tone }) => (
                    <button
                      key={key}
                      onClick={() => setMark(s._id, key)}
                      title={label}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                        marks[s._id] === key
                          ? tone === 'success' ? 'bg-success text-white border-success'
                          : tone === 'danger' ? 'bg-danger text-white border-danger'
                          : 'bg-gold text-white border-gold'
                          : 'bg-surface text-ink-muted border-border-strong hover:border-forest'
                      }`}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Monthly attendance report" />
        <div className="p-5 flex flex-wrap gap-3 items-end border-b border-border">
          <Select label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </Select>
          <Select label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Button variant="outline" size="sm" onClick={loadReport}><FileText size={15} /> Generate report</Button>
        </div>
        {report && (
          report.length === 0 ? <EmptyState title="No data for this period" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-muted border-b border-border">
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium text-center">Present</th>
                    <th className="px-6 py-3 font-medium text-center">Absent</th>
                    <th className="px-6 py-3 font-medium text-center">Leave</th>
                    <th className="px-6 py-3 font-medium text-right">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.map((r) => (
                    <tr key={r.student._id}>
                      <td className="px-6 py-3">{r.student.name} <span className="text-xs text-ink-muted font-mono">({r.student.rollNumber})</span></td>
                      <td className="px-6 py-3 text-center">{r.present}</td>
                      <td className="px-6 py-3 text-center">{r.absent}</td>
                      <td className="px-6 py-3 text-center">{r.leave}</td>
                      <td className="px-6 py-3 text-right">
                        <Badge tone={r.percentage >= 75 ? 'success' : r.percentage >= 50 ? 'warning' : 'danger'}>{r.percentage}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>
    </div>
  );
}

function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student-summary').then(async ({ data: summary }) => {
      const { data: history } = await api.get(`/attendance/student/${summary.student._id}`);
      setData(history);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>;
  if (!data) return <EmptyState title="No attendance data found" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Attendance summary" />
        <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div><p className="text-xs text-ink-muted mb-1">Present</p><p className="font-display text-2xl font-semibold text-success">{data.summary.present}</p></div>
          <div><p className="text-xs text-ink-muted mb-1">Absent</p><p className="font-display text-2xl font-semibold text-danger">{data.summary.absent}</p></div>
          <div><p className="text-xs text-ink-muted mb-1">Leave</p><p className="font-display text-2xl font-semibold text-gold">{data.summary.leave}</p></div>
          <div><p className="text-xs text-ink-muted mb-1">Total days</p><p className="font-display text-2xl font-semibold text-ink">{data.summary.total}</p></div>
          <div><p className="text-xs text-ink-muted mb-1">Rate</p><p className="font-display text-2xl font-semibold text-forest">{data.summary.percentage}%</p></div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Recent history" />
        {data.records.length === 0 ? <EmptyState title="No records yet" /> : (
          <div className="divide-y divide-border">
            {data.records.slice(0, 30).map((r) => (
              <div key={r._id} className="px-6 py-3 flex items-center justify-between">
                <p className="text-sm text-ink">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <Badge tone={r.status === 'present' ? 'success' : r.status === 'absent' ? 'danger' : 'warning'}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();
  return (
    <DashboardLayout title={user.role === 'student' ? 'My Attendance' : 'Attendance'} subtitle={user.role === 'student' ? 'Your day-by-day record' : 'Mark attendance and generate reports'}>
      {user.role === 'student' ? <StudentAttendance /> : <StaffAttendance />}
    </DashboardLayout>
  );
}
