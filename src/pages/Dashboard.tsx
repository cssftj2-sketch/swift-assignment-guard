import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertCircle, Plus, QrCode, List } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0
  });
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentAssignments();
  }, []);

  const loadStats = async () => {
    try {
      const { data: assignments, error } = await supabase
        .from("assignments")
        .select("status");

      if (error) throw error;

      const total = assignments?.length || 0;
      const active = assignments?.filter(a => a.status === "active").length || 0;
      const expired = assignments?.filter(a => a.status === "expired").length || 0;
      const upcoming = assignments?.filter(a => a.status === "upcoming").length || 0;

      setStats({ total, active, expired, upcoming });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("فشل تحميل الإحصائيات");
    }
  };

  const loadRecentAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          journalist:journalists(full_name, national_id)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentAssignments(data || []);
    } catch (error) {
      console.error("Error loading recent assignments:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-secondary bg-secondary/10";
      case "expired": return "text-destructive bg-destructive/10";
      case "upcoming": return "text-accent bg-accent/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "نشط";
      case "expired": return "منتهي";
      case "upcoming": return "قادم";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">نظام إدارة أوامر المهمات</h1>
                <p className="text-sm text-muted-foreground">لوحة التحكم الرئيسية</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
          <StatCard
            title="إجمالي الأوامر"
            value={stats.total}
            icon={FileText}
            variant="default"
          />
          <StatCard
            title="الأوامر النشطة"
            value={stats.active}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="الأوامر المنتهية"
            value={stats.expired}
            icon={AlertCircle}
            variant="warning"
          />
          <StatCard
            title="الأوامر القادمة"
            value={stats.upcoming}
            icon={Clock}
            variant="primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slideIn">
          <Button
            size="lg"
            className="h-auto py-6 bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all"
            onClick={() => navigate("/issue")}
          >
            <Plus className="ml-2 h-5 w-5" />
            إصدار أمر مهمة جديد
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 border-2 hover:bg-secondary/10 hover:border-secondary transition-all"
            onClick={() => navigate("/verify")}
          >
            <QrCode className="ml-2 h-5 w-5" />
            التحقق من QR Code
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 border-2 hover:bg-primary/10 hover:border-primary transition-all"
            onClick={() => navigate("/assignments")}
          >
            <List className="ml-2 h-5 w-5" />
            عرض جميع الأوامر
          </Button>
        </div>

        {/* Recent Assignments */}
        <Card className="animate-fadeIn border-2">
          <CardHeader>
            <CardTitle>أحدث الأوامر الصادرة</CardTitle>
            <CardDescription>آخر 5 أوامر مهمات تم إصدارها</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد أوامر صادرة بعد</p>
            ) : (
              <div className="space-y-4">
                {recentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{assignment.journalist?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.mission_type} - {assignment.mission_location}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        رقم الأمر: {assignment.assignment_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-sm font-medium">{assignment.start_date}</p>
                        <p className="text-xs text-muted-foreground">إلى {assignment.end_date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assignment.status)}`}>
                        {getStatusText(assignment.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}