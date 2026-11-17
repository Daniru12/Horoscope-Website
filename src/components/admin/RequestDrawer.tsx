"use client";

import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import { Camera, CheckCircle2, ExternalLink, FileText, ImageIcon, Loader2, Send, X, Copy, Mail, Phone } from "lucide-react";
import {
  Sheet, ConfirmDialog, StageBadge, STAGE_META, stageOf, priceOf, fmtDate, timeAgo, Avatar,
  card, textareaCls, btnPrimary, btnSecondary, btnGreen,
} from "./ui";

/* Thumbnail that creates and frees its own object URL. */
function FileThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="relative shrink-0">
      {url && <img src={url} alt="" className="h-20 w-20 object-cover rounded-xl" />}
      <button
        type="button"
        onClick={onRemove}
        aria-label="ඉවත් කරන්න"
        className="absolute -top-2 -right-2 grid place-items-center w-7 h-7 bg-red-500 text-white rounded-full shadow-lg"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Attachment({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return (
      <div className="h-14 rounded-2xl border border-dashed border-white/10 grid place-items-center text-center px-3">
        <span className="text-sm text-gray-500">{label} නැත</span>
      </div>
    );
  }
  const isPdf = /\.pdf($|\?)/i.test(href);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl overflow-hidden bg-[#0d1426] border border-white/[0.07]">
      <div className="aspect-[4/3] relative bg-black/30">
        {isPdf ? (
          <div className="absolute inset-0 grid place-items-center text-gold-300">
            <FileText className="w-10 h-10" />
          </div>
        ) : (
          <img src={href} alt={label} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <span className="absolute right-2 top-2 grid place-items-center w-8 h-8 rounded-full bg-black/60 text-white">
          <ExternalLink className="w-4 h-4" />
        </span>
      </div>
      <div className="px-3 py-2.5 text-sm text-gray-200">{label}</div>
    </a>
  );
}

async function imagesToPdfBlob(images: File[]) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (let i = 0; i < images.length; i++) {
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(images[i]);
    });
    const img = new window.Image();
    img.src = dataUrl;
    await new Promise((r) => (img.onload = r));
    if (i > 0) pdf.addPage();
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = img.width / img.height;
    let w = pw;
    let h = pw / ratio;
    if (h > ph) {
      h = ph;
      w = ph * ratio;
    }
    pdf.addImage(dataUrl, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
  }
  return pdf.output("blob");
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()).url;
}

const FORM_ID = "send-result-form";

export default function RequestDrawer({
  request,
  services,
  onClose,
  onChanged,
}: {
  request: any | null;
  services: any[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
}) {
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [approving, setApproving] = useState(false);

  const [resultText, setResultText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function stopCamera() {
    const v = videoRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    setCameraOn(false);
  }

  // Reset the form whenever a different record is opened.
  useEffect(() => {
    setResultText("");
    setImages([]);
    setProgress("");
    stopCamera();
  }, [request?._id]);

  useEffect(() => () => stopCamera(), []);

  const stage = request ? stageOf(request) : null;
  const canSendResult = stage === "in_progress" || stage === "verify_payment" || stage === "awaiting_payment";

  async function approve() {
    if (!request) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/requests/${request._id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("ගෙවීම අනුමත කරන ලදී");
      setConfirmApprove(false);
      await onChanged();
    } catch {
      toast.error("ගෙවීම අනුමත කිරීම අසාර්ථකයි");
    } finally {
      setApproving(false);
    }
  }

  async function startCamera() {
    try {
      setCameraOn(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      toast.error("කැමරාවට පිවිසීමේදී දෝෂයක් ඇති විය.");
      setCameraOn(false);
    }
  }

  function capture() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(
      (blob) => {
        if (!blob) return;
        setImages((prev) => [...prev, new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" })]);
        toast.success("ඡායාරූපය එක් කළා");
      },
      "image/jpeg",
      0.85
    );
  }

  async function sendResult(e: React.FormEvent) {
    e.preventDefault();
    if (!request || !resultText.trim()) return;
    setSending(true);
    try {
      let resultPdfUrl: string | null = null;
      const resultImageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        setProgress(`ඡායාරූප ${i + 1}/${images.length}`);
        resultImageUrls.push(await uploadFile(images[i]));
      }
      if (images.length) {
        setProgress("PDF සකසමින්…");
        const blob = await imagesToPdfBlob(images);
        resultPdfUrl = await uploadFile(new File([blob], "report.pdf", { type: "application/pdf" }));
      }
      setProgress("සුරකිමින්…");
      const res = await fetch(`/api/admin/requests/${request._id}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultText, resultPdfUrl, resultImageUrls }),
      });
      if (!res.ok) throw new Error();
      toast.success("ප්‍රතිඵල යවන ලදී");
      stopCamera();
      await onChanged();
    } catch (err) {
      console.error(err);
      toast.error("ප්‍රතිඵල යැවීම අසාර්ථකයි");
    } finally {
      setSending(false);
      setProgress("");
    }
  }

  const copyDetails = () => {
    if (!request) return;
    const text = `${request.user?.name || ""}\n${request.serviceName}\nඋපන් දිනය: ${request.birthDate}\nවේලාව: ${request.birthTime}\nස්ථානය: ${request.birthPlace}`;
    navigator.clipboard.writeText(text).then(() => toast.success("විස්තර පිටපත් කළා"));
  };

  // The one main action for this record, pinned at the bottom of the sheet.
  const footer =
    stage === "verify_payment" ? (
      <button onClick={() => setConfirmApprove(true)} className={`${btnGreen} w-full`}>
        <CheckCircle2 className="w-5 h-5" /> ගෙවීම අනුමත කරන්න
      </button>
    ) : canSendResult ? (
      <button type="submit" form={FORM_ID} disabled={sending || !resultText.trim()} className={`${btnPrimary} w-full`}>
        {sending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> {progress || "යවමින්…"}
          </>
        ) : (
          <>
            <Send className="w-5 h-5" /> ප්‍රතිඵල යවන්න
          </>
        )}
      </button>
    ) : undefined;

  return (
    <>
      <Sheet
        open={!!request}
        onClose={onClose}
        footer={footer}
        title={
          request && (
            <div className="flex items-center gap-3">
              <Avatar name={request.user?.name} image={request.user?.image} size={44} />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">{request.user?.name || "නොදන්නා පරිශීලකයා"}</h2>
                <p className="text-sm text-gray-400 truncate">{request.serviceName}</p>
              </div>
            </div>
          )
        }
      >
        {request && stage && (
          <div className="space-y-6">
            {/* Stage + next step */}
            <div className={`${card} p-4`}>
              <div className="flex items-center justify-between gap-3">
                <StageBadge stage={stage} />
                <span className="text-lg font-semibold text-white tabular-nums">{priceOf(request, services)}</span>
              </div>
              {STAGE_META[stage].hint && <p className="text-sm text-gray-300 mt-3">{STAGE_META[stage].hint}</p>}
            </div>

            {/* Contact */}
            {request.user?.email && (
              <div className="grid grid-cols-2 gap-3">
                <a href={`mailto:${request.user.email}`} className={`${btnSecondary} !h-11 text-sm`}>
                  <Mail className="w-4 h-4" /> ඊමේල්
                </a>
                <button onClick={copyDetails} className={`${btnSecondary} !h-11 text-sm`}>
                  <Copy className="w-4 h-4" /> පිටපත් කරන්න
                </button>
              </div>
            )}

            {/* Details */}
            <section>
              <h3 className="text-xs font-semibold tracking-wide text-gray-500 mb-2">උපත් විස්තර</h3>
              <dl className={`${card} divide-y divide-white/[0.06]`}>
                {[
                  ["උපන් දිනය", request.birthDate],
                  ["උපන් වේලාව", request.birthTime],
                  ["උපන් ස්ථානය", request.birthPlace],
                  ["ලැබුණේ", `${fmtDate(request.createdAt, true)} · ${timeAgo(request.createdAt)}`],
                  ["ඊමේල්", request.user?.email],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-4 px-4 py-3.5">
                    <dt className="text-sm text-gray-400 shrink-0">{k}</dt>
                    <dd className="text-sm text-white text-right break-all">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Attachments */}
            <section>
              <h3 className="text-xs font-semibold tracking-wide text-gray-500 mb-2">ඇමුණුම්</h3>
              <div className="grid grid-cols-2 gap-3">
                <Attachment href={request.horoscopeImageUrl} label="කේන්දර සටහන" />
                <Attachment href={request.paymentReceiptUrl} label="ගෙවීම් රිසිට්පත" />
              </div>
            </section>

            {/* Result already sent */}
            {stage === "completed" && (
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-gray-500 mb-2">යැවූ ප්‍රතිඵලය · {fmtDate(request.updatedAt)}</h3>
                <div className={`${card} p-4 space-y-4`}>
                  <p className="text-[15px] text-gray-100 whitespace-pre-wrap leading-relaxed">{request.resultText || "ප්‍රතිඵල විස්තරයක් නොමැත."}</p>
                  {request.resultPdfUrl && (
                    <a href={request.resultPdfUrl} target="_blank" rel="noopener noreferrer" className={`${btnSecondary} w-full !h-11 text-sm`}>
                      <FileText className="w-4 h-4" /> PDF වාර්තාව බලන්න
                    </a>
                  )}
                  {request.resultImageUrls?.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {request.resultImageUrls.map((u: string, i: number) => (
                        <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          <img src={u} alt={`ප්‍රතිඵල ${i + 1}`} className="h-20 w-20 object-cover rounded-xl" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Send result */}
            {canSendResult && (
              <section>
                <h3 className="text-xs font-semibold tracking-wide text-gray-500 mb-2">ප්‍රතිඵල යවන්න</h3>
                {stage !== "in_progress" && (
                  <p className="text-sm text-amber-300/90 mb-3">සටහන: මෙම ඉල්ලීමේ ගෙවීම තවම අනුමත කර නැත.</p>
                )}
                <form id={FORM_ID} onSubmit={sendResult} className="space-y-3">
                  <textarea
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    rows={6}
                    placeholder="පලාපල වාර්තාව මෙහි ලියන්න…"
                    className={textareaCls}
                  />

                  {!cameraOn ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={startCamera} className={`${btnSecondary} !h-11 text-sm`}>
                        <Camera className="w-4 h-4" /> කැමරාව
                      </button>
                      <label className={`${btnSecondary} !h-11 text-sm cursor-pointer`}>
                        <ImageIcon className="w-4 h-4" /> ඡායාරූප
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files?.length) setImages((p) => [...p, ...Array.from(files)]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className={`${card} p-2`}>
                      <video ref={videoRef} className="w-full aspect-[4/3] object-cover rounded-xl bg-black" autoPlay playsInline muted />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="grid grid-cols-[1fr_auto] gap-2 mt-2">
                        <button type="button" onClick={capture} className={btnPrimary}>
                          <Camera className="w-5 h-5" /> ඡායාරූපය ගන්න
                        </button>
                        <button type="button" onClick={stopCamera} aria-label="කැමරාව වසන්න" className={`${btnSecondary} !px-4`}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {images.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ඡායාරූප {images.length}ක් — එක PDF එකක් ලෙස යැවේ.</p>
                      <div className="flex gap-3 overflow-x-auto pt-2.5 pb-1">
                        {images.map((f, i) => (
                          <FileThumb key={`${f.name}-${i}`} file={f} onRemove={() => setImages((p) => p.filter((_, j) => j !== i))} />
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </section>
            )}

            {request.user?.phone && (
              <a href={`tel:${request.user.phone}`} className={`${btnSecondary} w-full`}>
                <Phone className="w-4 h-4" /> {request.user.phone}
              </a>
            )}
          </div>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmApprove}
        title="ගෙවීම අනුමත කරන්නද?"
        message={
          request && (
            <>
              <strong className="text-white">{request.user?.name}</strong> ගේ <strong className="text-white">{priceOf(request, services)}</strong> ගෙවීම
              අනුමත කෙරේ. ඊළඟට ප්‍රතිඵල යැවිය හැක.
            </>
          )
        }
        confirmLabel="අනුමත කරන්න"
        tone="green"
        busy={approving}
        onConfirm={approve}
        onCancel={() => setConfirmApprove(false)}
      />
    </>
  );
}
