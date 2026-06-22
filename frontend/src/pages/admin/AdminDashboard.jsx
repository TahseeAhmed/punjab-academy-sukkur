import { useEffect, useState, useCallback } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  Pin,
} from "lucide-react";
import api from "../../api/axios";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, Spinner } from "../../components/ui";
import { LoadError } from "../../components/ui/LoadError";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get("/dashboard/summary")
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Could not load the dashboard.",
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

  if (error || !data) {
    return (
      <DashboardLayout title="Overview">
        <LoadError message={error || "No data found."} onRetry={load} />
      </DashboardLayout>
    );
  }

  const collectionPct =
    data.currentMonthFees.totalExpected > 0
      ? Math.round(
          (data.currentMonthFees.totalCollected /
            data.currentMonthFees.totalExpected) *
            100,
        )
      : 0;

  return (
    <DashboardLayout
      title="Overview"
      subtitle={`${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active students"
          value={data.studentCount}
          icon={GraduationCap}
          tone="forest"
        />
        <StatCard
          label="Active teachers"
          value={data.teacherCount}
          icon={Users}
          tone="forest"
        />
        <StatCard
          label="Classes"
          value={data.classCount}
          icon={BookOpen}
          tone="forest"
        />
        <StatCard
          label="Present today"
          value={
            data.todayAttendance.marked > 0
              ? `${data.todayAttendance.present}/${data.todayAttendance.marked}`
              : "—"
          }
          sub={data.todayAttendance.marked === 0 ? "Not marked yet" : undefined}
          icon={CalendarCheck}
          tone="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title={`Fee collection — ${data.currentMonthFees.month} ${data.currentMonthFees.year}`}
            subtitle={`${collectionPct}% collected so far`}
          />
          <div className="p-6">
            <div className="w-full h-3 rounded-full bg-paper overflow-hidden mb-5">
              <div
                className="h-full bg-forest rounded-full transition-all"
                style={{ width: `${collectionPct}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-ink-muted mb-1">Expected</p>
                <p className="font-display text-xl font-semibold text-ink">
                  Rs {data.currentMonthFees.totalExpected.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-muted mb-1">Collected</p>
                <p className="font-display text-xl font-semibold text-success">
                  Rs {data.currentMonthFees.totalCollected.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-muted mb-1">Outstanding</p>
                <p className="font-display text-xl font-semibold text-danger">
                  Rs {data.currentMonthFees.outstanding.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent notices" />
          <div className="divide-y divide-border">
            {data.recentNotices.length === 0 && (
              <p className="text-sm text-ink-muted px-6 py-6">
                No notices posted yet.
              </p>
            )}
            {data.recentNotices.map((n) => (
              <div key={n._id} className="px-6 py-3.5">
                <div className="flex items-start gap-2">
                  {n.isPinned && (
                    <Pin size={13} className="text-gold mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {n.title}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {n.postedBy?.name} ·{" "}
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
