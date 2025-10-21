import { QRCodeSVG } from "qrcode.react";
import signatureStamp from "@/assets/signature-stamp.jpeg";

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
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto" id="assignment-document">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-sm space-y-1">
            <p className="font-semibold">Journal électronique AlgerieDirect</p>
            <p>Édité par une entreprise EURLBC COMM</p>
            <p>Presse écriteet électronique</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-red-600 to-blue-900 text-white px-6 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">الجزائر</span>
                <span className="text-2xl font-bold">مباشر</span>
              </div>
              <p className="text-xs mt-1">ALGERIE DIRECT</p>
            </div>
          </div>
        </div>
        <div className="text-center text-blue-800 underline text-lg font-semibold">
          www.algeriedirect.dz
        </div>
      </div>

      {/* Registration Number */}
      <div className="text-left mb-6">
        <p className="text-sm font-semibold">رقم التسجيل: {data.registrationNumber}</p>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold border-b-4 border-black inline-block pb-2">
          أمر بمهمة
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-6 mb-8" style={{ fontFamily: 'Cairo, sans-serif' }}>
        <div className="flex items-center border-b border-dotted border-gray-400 py-2">
          <span className="font-semibold ml-4">الاسم:</span>
          <span className="flex-1 text-center">{data.fullName}</span>
        </div>

        <div className="flex items-center border-b border-dotted border-gray-400 py-2">
          <span className="font-semibold ml-4">اللقب:</span>
          <span className="flex-1 text-center">{data.title}</span>
        </div>

        <div className="flex items-center border-b border-dotted border-gray-400 py-2">
          <span className="font-semibold ml-4">المؤسسة:</span>
          <span className="flex-1 text-center">{data.organization}</span>
        </div>

        <div className="flex items-center border-b border-dotted border-gray-400 py-2">
          <span className="font-semibold ml-4">الصفة:</span>
          <span className="flex-1 text-center">{data.position}</span>
        </div>

        <div className="flex items-center border-b border-dotted border-gray-400 py-2">
          <span className="font-semibold ml-4">المهمة:</span>
          <span className="flex-1 text-center">{data.missionType} في {data.missionLocation}</span>
        </div>

        <div className="flex items-center border-b border-dotted border-gray-400 py-2">
          <span className="font-semibold ml-4">تاريخ بداية المهمة:</span>
          <span className="flex-1 text-center">{formatDate(data.startDate)}</span>
        </div>

        <div className="flex items-center border-b border-dotted border-gray-400 py-2">
          <span className="font-semibold ml-4">تاريخ نهاية المهمة:</span>
          <span className="flex-1 text-center">{formatDate(data.endDate)}</span>
        </div>
      </div>

      {/* Note */}
      <div className="text-sm italic text-center mb-12 text-gray-700">
        ملاحظة: يرجى من السلطات المدنية والعسكرية تسهيل مهمة حامل صاحب هذه الوثيقة.
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-end mb-8">
        <div className="w-48">
          {/* QR Code */}
          <div className="bg-white p-2 border-2 border-blue-900 rounded-lg inline-block">
            <QRCodeSVG value={data.qrData} size={120} level="H" />
          </div>
        </div>
        
        <div className="text-center">
          <div className="mb-4">
            {/* Signature and stamp image */}
            <img 
              src={signatureStamp} 
              alt="التوقيع والختم الرسمي" 
              className="w-64 h-auto mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 mt-8">
        <div className="flex justify-between text-xs text-gray-600">
          <div>
            <p className="font-semibold">Siègesocial</p>
            <p>Villa84,CitéChahidHamdiAEK</p>
            <p>35000 Boumerdes, Algerie.</p>
            <p>E-mail:bcinfo.dz@gmail.com</p>
          </div>
          <div className="text-left">
            <p className="font-semibold">LeDirecteurdePublication:ISLAMREKHILA</p>
            <p>Téléphone : +213 542 136 373</p>
            <p className="underline text-blue-800">www.algeriedirect.dz</p>
          </div>
        </div>
      </div>
    </div>
  );
}
