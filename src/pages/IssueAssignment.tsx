import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { AssignmentDocument } from "@/components/AssignmentDocument";

export default function IssueAssignment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    nationalId: "",
    phone: "",
    email: "",
    organization: "الجزائر مباشر",
    position: "مراسل صحفي",
    missionType: "",
    missionLocation: "",
    startDate: "",
    endDate: "",
    issuedBy: "الجزائر مباشر"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const generateSecureData = () => {
    const timestamp = new Date().toISOString();
    const randomKey = crypto.randomUUID();
    const signature = crypto.randomUUID();
    
    return {
      encryptionKey: randomKey,
      signatureHash: signature,
      timestamp
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create or get journalist
      let journalistId: string;
      const { data: existingJournalist } = await supabase
        .from("journalists")
        .select("id")
        .eq("national_id", formData.nationalId)
        .maybeSingle();

      if (existingJournalist) {
        journalistId = existingJournalist.id;
      } else {
        const { data: newJournalist, error: journalistError } = await supabase
          .from("journalists")
          .insert({
            full_name: formData.fullName,
            national_id: formData.nationalId,
            phone: formData.phone,
            email: formData.email
          })
          .select()
          .single();

        if (journalistError) throw journalistError;
        journalistId = newJournalist.id;
      }

      // Generate secure data
      const secureData = generateSecureData();
      const assignmentNumber = `AM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const year = new Date().getFullYear();
      const registrationNumber = `${year}/${Math.floor(Math.random() * 1000)}`;
      
      // Create QR code data
      const qrData = JSON.stringify({
        id: crypto.randomUUID(),
        assignmentNumber,
        registrationNumber,
        journalist: formData.fullName,
        title: formData.title,
        nationalId: formData.nationalId,
        organization: formData.organization,
        position: formData.position,
        mission: formData.missionType,
        location: formData.missionLocation,
        startDate: formData.startDate,
        endDate: formData.endDate,
        issuedBy: formData.issuedBy,
        signature: secureData.signatureHash,
        timestamp: secureData.timestamp
      });

      // Determine status based on dates
      const today = new Date();
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      let status = "active";
      if (start > today) status = "upcoming";
      if (end < today) status = "expired";

      // Insert assignment
      const { error: assignmentError } = await supabase
        .from("assignments")
        .insert({
          journalist_id: journalistId,
          assignment_number: assignmentNumber,
          mission_type: formData.missionType,
          mission_location: formData.missionLocation,
          start_date: formData.startDate,
          end_date: formData.endDate,
          issued_by: formData.issuedBy,
          status,
          qr_code_data: qrData,
          signature_hash: secureData.signatureHash,
          encryption_key: secureData.encryptionKey
        });

      if (assignmentError) throw assignmentError;

      setAssignmentData({
        assignmentNumber,
        registrationNumber,
        ...formData,
        qrData
      });
      setGeneratedQR(qrData);
      toast.success("تم إصدار أمر المهمة بنجاح!");
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      toast.error(error.message || "فشل إصدار أمر المهمة");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (generatedQR && assignmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <div className="container mx-auto max-w-6xl">
          {/* Print Controls - Hidden on print */}
          <div className="mb-6 print:hidden">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">تم إصدار أمر المهمة بنجاح!</CardTitle>
                    <CardDescription>يمكنك الآن طباعة الوثيقة</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handlePrint}
                      className="gap-2 bg-gradient-to-r from-primary to-primary-glow"
                    >
                      <Printer className="h-4 w-4" />
                      طباعة الوثيقة
                    </Button>
                    <Button
                      onClick={() => {
                        setGeneratedQR(null);
                        setAssignmentData(null);
                        setFormData({
                          fullName: "",
                          title: "",
                          nationalId: "",
                          phone: "",
                          email: "",
                          organization: "الجزائر مباشر",
                          position: "مراسل صحفي",
                          missionType: "",
                          missionLocation: "",
                          startDate: "",
                          endDate: "",
                          issuedBy: "الجزائر مباشر"
                        });
                      }}
                      variant="outline"
                    >
                      إصدار أمر جديد
                    </Button>
                    <Button
                      onClick={() => navigate("/")}
                      variant="outline"
                    >
                      العودة للرئيسية
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Document Preview */}
          <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
            <AssignmentDocument data={assignmentData} />
          </div>
        </div>
      </div>
    );
  }

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
        <Card className="max-w-3xl mx-auto border-2 animate-fadeIn">
          <CardHeader>
            <CardTitle className="text-2xl">إصدار أمر مهمة جديد</CardTitle>
            <CardDescription>املأ البيانات التالية لإصدار أمر مهمة للصحفي</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل الاسم"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">اللقب *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل اللقب"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">الرقم الوطني *</Label>
                  <Input
                    id="nationalId"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل الرقم الوطني"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="أدخل البريد الإلكتروني (اختياري)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">المؤسسة *</Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    required
                    placeholder="الجزائر مباشر"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">الصفة *</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    placeholder="مثال: مراسل صحفي"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionType">نوع المهمة *</Label>
                  <Input
                    id="missionType"
                    name="missionType"
                    value={formData.missionType}
                    onChange={handleInputChange}
                    required
                    placeholder="مثال: التغطية الصحفية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionLocation">موقع المهمة *</Label>
                  <Input
                    id="missionLocation"
                    name="missionLocation"
                    value={formData.missionLocation}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل موقع المهمة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">تاريخ البداية *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">تاريخ النهاية *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="issuedBy">صادر من *</Label>
                  <Input
                    id="issuedBy"
                    name="issuedBy"
                    value={formData.issuedBy}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل اسم الجهة المصدرة"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الإصدار...
                  </>
                ) : (
                  "إصدار أمر المهمة"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}