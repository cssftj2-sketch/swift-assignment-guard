import { QRCodeSVG } from "qrcode.react";
import signatureStamp from "@/assets/signature-stamp.jpeg";
import logo from "@/assets/logo.png";

interface AssignmentDocumentProps {
  data: {
    assignmentNumber: string;
    registrationNumber: string;
    fullName: string;
    title: string;
    organization: string;
    position: string;
    missionType: string;
    missionLocation: string;
    startDate: string;
    endDate: string;
    issuedBy: string;
    qrData: string;
  };
}

export function AssignmentDocument({ data }: AssignmentDocumentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ', { 
      year: 'numeric', 
      month: 'long', 
      day: '2-digit'
    });
  };

  return (
    <div className="bg-white text-black p-12 max-w-4xl mx-auto" id="assignment-document" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="border-b-[3px] border-gray-800 pb-3 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs space-y-0.5 text-left">
            <p className="font-semibold">Journal électronique <span className="font-bold">AlgerieDirect</span></p>
            <p>Édité par une entreprise <span className="font-semibold">EURLBC COMM</span></p>
            <p>Presse écrite et électronique</p>
          </div>
          <div className="text-center">
            <img 
              src={logo} 
              alt="الجزائر مباشر - Algerie Direct" 
              className="h-20 w-auto mx-auto"
            />
          </div>
        </div>
        <div className="text-center text-blue-900 underline text-base font-bold mt-2">
          www.algeriedirect.dz
        </div>
      </div>

      {/* Registration Number */}
      <div className="text-right mb-8">
        <p className="text-sm font-semibold">رقم التسجيل: <span className="font-bold">{data.registrationNumber}</span></p>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold inline-block pb-1 border-b-[3px] border-black">
          أمر بمهمة
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-4 mb-10 text-right" style={{ direction: 'rtl' }}>
        <div className="flex items-baseline">
          <span className="font-semibold text-base whitespace-nowrap ml-2">الاسم:</span>
          <span className="flex-1 border-b border-dotted border-gray-500 pb-1 text-center">{data.fullName}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-semibold text-base whitespace-nowrap ml-2">اللقب:</span>
          <span className="flex-1 border-b border-dotted border-gray-500 pb-1 text-center">{data.title}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-semibold text-base whitespace-nowrap ml-2">المؤسسة:</span>
          <span className="flex-1 border-b border-dotted border-gray-500 pb-1 text-center">{data.organization}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-semibold text-base whitespace-nowrap ml-2">الصفة:</span>
          <span className="flex-1 border-b border-dotted border-gray-500 pb-1 text-center">{data.position}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-semibold text-base whitespace-nowrap ml-2">المهمة:</span>
          <span className="flex-1 border-b border-dotted border-gray-500 pb-1 text-center">{data.missionType} في {data.missionLocation}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-semibold text-base whitespace-nowrap ml-2">تاريخ بداية المهمة:</span>
          <span className="flex-1 border-b border-dotted border-gray-500 pb-1 text-center">{formatDate(data.startDate)}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-semibold text-base whitespace-nowrap ml-2">تاريخ نهاية المهمة:</span>
          <span className="flex-1 border-b border-dotted border-gray-500 pb-1 text-center">{formatDate(data.endDate)}</span>
        </div>
      </div>

      {/* Note */}
      <div className="text-sm text-center mb-16 text-gray-700" style={{ direction: 'rtl' }}>
        ملاحظة: يرجى من السلطات المدنية والعسكرية تسهيل مهمة حامل صاحب هذه الوثيقة.
      </div>

      {/* Signature Section with QR Code */}
      <div className="mb-12">
        <div className="flex justify-between items-end">
          {/* Signature and Stamp on the left */}
          <div>
            <img 
              src={signatureStamp} 
              alt="التوقيع والختم الرسمي" 
              className="w-72 h-auto"
              onError={(e) => {
                console.error("Failed to load signature stamp");
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          {/* QR Code on the right */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-2 border-2 border-gray-300 rounded">
              <QRCodeSVG 
                value={data.qrData}
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-gray-600 text-center">امسح للتحقق</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-800 pt-3 mt-8">
        <div className="flex justify-between text-[10px] text-gray-700">
          <div className="text-left space-y-0.5">
            <p className="font-semibold">Siège social</p>
            <p>Villa 84, Cité Chahid Hamdi AEK</p>
            <p>35000 Boumerdes, Algerie.</p>
            <p>E-mail: bcinfo.dz@gmail.com</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="font-semibold">Le Directeur de Publication: ISLAM REKHILA</p>
            <p>Téléphone : +213 542 136 373</p>
            <p className="underline text-blue-900 font-semibold">www.algeriedirect.dz</p>
          </div>
        </div>
      </div>
    </div>
  );
}
