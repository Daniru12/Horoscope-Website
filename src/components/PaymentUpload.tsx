"use client";

interface PaymentUploadProps {
  requestId: string;
}

export default function PaymentUpload({ requestId }: PaymentUploadProps) {
  return (
    <form action="/api/upload-payment-action" method="POST" className="flex items-center gap-2" encType="multipart/form-data">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="cursor-pointer bg-space-700 hover:bg-space-600 px-3 py-2 rounded text-sm text-white transition-colors">
        රිසිට්පත තෝරන්න (Select Receipt)
        <input 
          type="file" 
          name="paymentReceipt" 
          accept="image/*" 
          className="hidden" 
          required 
          onChange={(e) => {
            const form = e.target.closest('form');
            if (form) form.requestSubmit();
          }} 
        />
      </label>
    </form>
  );
}
