import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AssignmentDocument } from "@/components/AssignmentDocument";
import { ArrowRight, Printer } from "lucide-react";
import { toast } from "sonner";

export default function ViewAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          journalist:journalists(full_name, national_id, phone, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setAssignmentData({
          assignmentNumber: data.assignment_number,
          registrationNumber: data.journalist.national_id,
          fullName: data.journalist.full_name,
          title: data.journalist.full_name.split(' ')[0] || '',
          organization: "الجزائر مباشر",
          position: "مراسل صحفي",
          missionType: data.mission_type,
          missionLocation: data.mission_location,
          startDate: data.start_date,
          endDate: data.end_date,
          issuedBy: data.issued_by,
          qrData: data.qr_code_data
        });
      }
    } catch (error) {
      console.error("Error loading assignment:", error);
      toast.error("فشل تحميل أمر المهمة");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!assignmentData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">لم يتم العثور على أمر المهمة</p>
        <Button onClick={() => navigate("/assignments")}>
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى القائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="no-print container mx-auto px-4 py-6">
        <div className="flex gap-4 justify-center mb-6">
          <Button onClick={() => navigate("/assignments")} variant="outline">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى القائمة
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <AssignmentDocument data={assignmentData} />
      </div>
    </div>
  );
}
