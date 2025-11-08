import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle, XCircle, Loader2, QrCode, Camera, FileText } from "lucide-react";
import { toast } from "sonner";
import { Scanner } from '@yudiel/react-qr-scanner';

export default function VerifyAssignment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [scanMode, setScanMode] = useState<"manual" | "camera">("manual");

  const handleVerify = async () => {
    if (!qrData.trim()) {
      toast.error("الرجاء إدخال بيانات QR Code");
      return;
    }

    setLoading(true);
    try {
      // Find assignment
      const { data: assignment, error } = await supabase
        .from("assignments")
        .select(`
          *,
          journalist:journalists(full_name, national_id, phone)
        `)
        .eq("qr_code_data", qrData)
        .maybeSingle();

      if (error) throw error;

      if (!assignment) {
        // Log failed verification
        await supabase.from("verification_logs").insert({
          assignment_id: null,
          verification_result: "failed",
          notes: "QR Code غير موجود في النظام"
        });

        setVerificationResult({
          success: false,
          message: "QR Code غير صالح أو غير موجود في النظام"
        });
        return;
      }

      // Check expiry
      const today = new Date();
      const endDate = new Date(assignment.end_date);
      const isExpired = endDate < today;

      // Update verification count
      const { data: logs } = await supabase
        .from("verification_logs")
        .select("verification_count")
        .eq("assignment_id", assignment.id)
        .order("verified_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const verificationCount = (logs?.verification_count || 0) + 1;

      // Log verification
      await supabase.from("verification_logs").insert({
        assignment_id: assignment.id,
        verification_count: verificationCount,
        verification_result: isExpired ? "expired" : "success",
        notes: isExpired ? "محاولة استخدام أمر منتهي الصلاحية" : "تم التحقق بنجاح"
      });

      setVerificationResult({
        success: !isExpired,
        message: isExpired ? "أمر المهمة منتهي الصلاحية" : "تم التحقق بنجاح",
        assignment: {
          ...assignment,
          verificationCount
        }
      });

      if (isExpired) {
        toast.error("أمر المهمة منتهي الصلاحية");
      } else {
        toast.success("تم التحقق من أمر المهمة بنجاح");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "فشل التحقق من أمر المهمة");
      setVerificationResult({
        success: false,
        message: error.message || "حدث خطأ أثناء التحقق"
      });
    } finally {
      setLoading(false);
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
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-2 animate-fadeIn">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">التحقق من أمر المهمة</CardTitle>
                  <CardDescription>امسح أو الصق بيانات QR Code للتحقق من صحته</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={scanMode === "manual" ? "default" : "outline"}
                  onClick={() => setScanMode("manual")}
                  className="flex-1 gap-2"
                >
                  <FileText className="h-4 w-4" />
                  إدخال يدوي
                </Button>
                <Button
                  variant={scanMode === "camera" ? "default" : "outline"}
                  onClick={() => setScanMode("camera")}
                  className="flex-1 gap-2"
                >
                  <Camera className="h-4 w-4" />
                  مسح بالكاميرا
                </Button>
              </div>

              {scanMode === "manual" ? (
                <Textarea
                  placeholder="الصق بيانات QR Code هنا..."
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
              ) : (
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <Scanner
                    onScan={(detectedCodes) => {
                      console.log("Scanner detected:", detectedCodes);
                      if (detectedCodes && detectedCodes.length > 0) {
                        const scannedData = detectedCodes[0].rawValue;
                        console.log("Scanned QR data:", scannedData);
                        setQrData(scannedData);
                        toast.success("تم مسح QR Code بنجاح!");
                        setScanMode("manual");
                      }
                    }}
                    onError={(error) => {
                      console.error("QR Scanner error:", error);
                    }}
                    allowMultiple={true}
                    scanDelay={1000}
                    styles={{
                      container: {
                        width: "100%",
                        height: "400px"
                      }
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-primary rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                  </div>
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={loading || !qrData.trim()}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "التحقق من الأمر"
                )}
              </Button>
            </CardContent>
          </Card>

          {verificationResult && (
            <Card className={`border-2 animate-fadeIn ${
              verificationResult.success 
                ? "border-secondary bg-secondary/5" 
                : "border-destructive bg-destructive/5"
            }`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {verificationResult.success ? (
                    <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-secondary" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                  )}
                  <div>
                    <CardTitle className={verificationResult.success ? "text-secondary" : "text-destructive"}>
                      {verificationResult.message}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              {verificationResult.assignment && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">الصحفي</p>
                      <p className="font-semibold">{verificationResult.assignment.journalist.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الأمر</p>
                      <p className="font-semibold">{verificationResult.assignment.assignment_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">نوع المهمة</p>
                      <p className="font-semibold">{verificationResult.assignment.mission_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الموقع</p>
                      <p className="font-semibold">{verificationResult.assignment.mission_location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ البداية</p>
                      <p className="font-semibold">{verificationResult.assignment.start_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ النهاية</p>
                      <p className="font-semibold">{verificationResult.assignment.end_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">عدد مرات التحقق</p>
                      <p className="font-semibold">{verificationResult.assignment.verificationCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">صادر من</p>
                      <p className="font-semibold">{verificationResult.assignment.issued_by}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}