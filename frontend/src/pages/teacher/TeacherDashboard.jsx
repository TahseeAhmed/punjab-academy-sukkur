import { useEffect, useState, useCallback } from "react";
import { Users, BookOpen, ClipboardList } from "lucide-react";
import api from "../../api/axios";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, Spinner, EmptyState } from "../../components/ui";
import { LoadError } from "../../components/ui/LoadError";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get("/dashboard/teacher-summary")
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Could not load your dashboard.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data || !data.teacher) {
    return (
      <DashboardLayout title="Overview">
        <LoadError
          message={error || "No teacher profile found for this account."}
          onRetry={load}
        />
      </DashboardLayout>
    );
  }

  const teacher = data.teacher;
  const firstName = teacher.user?.name
    ? teacher.user.name.split(" ")[0]
    : "there";
  const assignedClasses = (teacher.assignedClasses || []).filter(Boolean);
  const subjects = (teacher.subjects || []).filter(Boolean);
  const upcomingAssignments = (data.upcomingAssignments || []).filter(Boolean);

  return (
    <DashboardLayout
      title={`Welcome back, ${firstName}`}
      subtitle="Here's what's happening across your classes"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Assigned classes"
          value={data.classCount ?? assignedClasses.length}
          icon={BookOpen}
          tone="forest"
        />
        <StatCard
          label="Students taught"
          value={data.studentCount ?? 0}
          icon={Users}
          tone="forest"
        />
        <StatCard
          label="Subjects"
          value={subjects.length}
          icon={ClipboardList}
          tone="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Your classes" />
          <div className="divide-y divide-border">
            {assignedClasses.length === 0 && (
              <EmptyState
                title="No classes assigned yet"
                description="Ask an admin to assign you to a class."
              />
            )}
            {assignedClasses.map((c) => (
              <div
                key={c._id}
                className="px-6 py-3.5 text-sm font-medium text-ink"
              >
                {c.className ?? "Untitled class"} — Section {c.section ?? "—"}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Upcoming assignment deadlines" />
          <div className="divide-y divide-border">
            {upcomingAssignments.length === 0 && (
              <EmptyState
                title="Nothing due soon"
                description="Assignments you create will show up here."
              />
            )}
            {upcomingAssignments.map((a) => (
              <div
                key={a._id}
                className="px-6 py-3.5 flex items-center justify-between"
              >
                <p className="text-sm font-medium text-ink">
                  {a.title ?? "Untitled assignment"}
                </p>
                <p className="text-xs text-ink-muted">
                  {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
