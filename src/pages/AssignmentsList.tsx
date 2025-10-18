import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AssignmentsList() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = assignments.filter(a => 
        a.journalist?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.assignment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.mission_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.mission_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssignments(filtered);
    } else {
      setFilteredAssignments(assignments);
    }
  }, [searchTerm, assignments]);

  const loadAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          journalist:journalists(full_name, national_id, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
      setFilteredAssignments(data || []);
    } catch (error) {
      console.error("Error loading assignments:", error);
      toast.error("فشل تحميل قائمة الأوامر");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-secondary bg-secondary/10 border-secondary/20";
      case "expired": return "text-destructive bg-destructive/10 border-destructive/20";
      case "upcoming": return "text-accent bg-accent/10 border-accent/20";
      default: return "text-muted-foreground bg-muted border-muted";
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
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-2 animate-fadeIn">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">جميع أوامر المهمات</CardTitle>
                <CardDescription>
                  {filteredAssignments.length} أمر مهمة
                </CardDescription>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو رقم الأمر أو نوع المهمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
            ) : filteredAssignments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد أوامر مهمات بعد"}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-6 rounded-lg border-2 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{assignment.journalist?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          الرقم الوطني: {assignment.journalist?.national_id}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(assignment.status)}`}>
                        {getStatusText(assignment.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">رقم الأمر</p>
                        <p className="font-semibold text-sm">{assignment.assignment_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">نوع المهمة</p>
                        <p className="font-semibold text-sm">{assignment.mission_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">موقع المهمة</p>
                        <p className="font-semibold text-sm">{assignment.mission_location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">تاريخ البداية</p>
                        <p className="font-semibold text-sm">{assignment.start_date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">تاريخ النهاية</p>
                        <p className="font-semibold text-sm">{assignment.end_date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">صادر من</p>
                        <p className="font-semibold text-sm">{assignment.issued_by}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        تاريخ الإصدار: {new Date(assignment.created_at).toLocaleDateString('ar-EG')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        هاتف: {assignment.journalist?.phone}
                      </p>
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