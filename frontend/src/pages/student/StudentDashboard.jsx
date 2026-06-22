import { useEffect, useState, useCallback } from "react";
import { CalendarCheck, Wallet, ClipboardList } from "lucide-react";
import api from "../../api/axios";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, Spinner, EmptyState } from "../../components/ui";
import { LoadError } from "../../components/ui/LoadError";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get("/dashboard/student-summary")
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

  if (error || !data || !data.student) {
    return (
      <DashboardLayout title="Overview">
        <LoadError
          message={error || "No student profile found for this account."}
          onRetry={load}
        />
      </DashboardLayout>
    );
  }

  const student = data.student;
  const firstName = student.user?.name
    ? student.user.name.split(" ")[0]
    : "there";
  const upcomingAssignments = (data.upcomingAssignments || []).filter(Boolean);

  return (
    <DashboardLayout
      title={`Hi, ${firstName}`}
      subtitle={`${student.classSection?.className ?? "No class assigned"}${student.classSection?.section ? ` — Section ${student.classSection.section}` : ""} · Roll No. ${student.rollNumber ?? "—"}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Attendance rate"
          value={`${data.attendancePercentage ?? 0}%`}
          icon={CalendarCheck}
          tone="forest"
        />
        <StatCard
          label="Pending fee months"
          value={data.pendingFeesCount ?? 0}
          icon={Wallet}
          tone={(data.pendingFeesCount ?? 0) > 0 ? "danger" : "forest"}
        />
        <StatCard
          label="Upcoming assignments"
          value={upcomingAssignments.length}
          icon={ClipboardList}
          tone="gold"
        />
      </div>

      <Card>
        <CardHeader title="Upcoming assignments" />
        <div className="divide-y divide-border">
          {upcomingAssignments.length === 0 && (
            <EmptyState
              title="You're all caught up"
              description="No assignments due right now."
            />
          )}
          {upcomingAssignments.map((a) => (
            <div
              key={a._id}
              className="px-6 py-3.5 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {a.title ?? "Untitled assignment"}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {a.subject?.name ?? ""}
                </p>
              </div>
              <p className="text-xs text-ink-muted">
                {a.dueDate
                  ? `Due ${new Date(a.dueDate).toLocaleDateString()}`
                  : ""}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
