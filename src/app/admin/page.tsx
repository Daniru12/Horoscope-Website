"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Upload, Eye } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'payments'>('overview');

  // States for uploading result
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [resultImage, setResultImage] = useState<File | null>(null);
  const [uploadingResult, setUploadingResult] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRequests();
    }
  }, [status]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      } else if (res.status === 403) {
        alert("Access Denied. Admin only.");
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/requests/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Payment approved!");
        fetchRequests();
      } else {
        alert("Failed to approve payment.");
      }
    } catch (error) {
      console.error("Approval error", error);
    }
  };

  const handleResultImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResultImage(e.target.files[0]);
    }
  };

  const handleUploadResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setUploadingResult(true);
    try {
      let imageUrls: string[] = [];

      if (resultImage) {
        const formData = new FormData();
        formData.append("file", resultImage);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrls.push(uploadData.url);
        }
      }

      const res = await fetch(`/api/admin/requests/${selectedRequest}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultText,
          resultImageUrls: imageUrls,
        }),
      });

      if (res.ok) {
        alert("Result uploaded successfully!");
        setSelectedRequest(null);
        setResultText("");
        setResultImage(null);
        fetchRequests();
      } else {
        alert("Failed to upload result");
      }
    } catch (error) {
      console.error("Result upload error", error);
      alert("Error uploading result");
    } finally {
      setUploadingResult(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-gold-500" /></div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pendingPayments = requests.filter(r => r.paymentStatus === 'uploaded');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-1/4">
          <div className="bg-space-800/80 backdrop-blur-md rounded-3xl p-6 border border-space-700 shadow-xl sticky top-24">
            <h2 className="text-xl font-serif font-bold text-white mb-6 border-b border-space-700 pb-4">
              පරිපාලක පුවරුව (Admin)
            </h2>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium flex items-center gap-3 ${
                  activeTab === 'overview' ? 'bg-gold-500 text-space-900' : 'text-gray-300 hover:bg-space-700'
                }`}
              >
                දළ විශ්ලේෂණය (Overview)
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium flex items-center justify-between ${
                  activeTab === 'requests' ? 'bg-gold-500 text-space-900' : 'text-gray-300 hover:bg-space-700'
                }`}
              >
                <span>නව ඉල්ලුම් (Requests)</span>
                {pendingRequests.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'requests' ? 'bg-space-900 text-gold-400' : 'bg-gold-500 text-space-900'}`}>
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium flex items-center justify-between ${
                  activeTab === 'payments' ? 'bg-gold-500 text-space-900' : 'text-gray-300 hover:bg-space-700'
                }`}
              >
                <span>ගෙවීම් (Payments)</span>
                {pendingPayments.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'payments' ? 'bg-space-900 text-gold-400' : 'bg-gold-500 text-space-900'}`}>
                    {pendingPayments.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4">
          <div className="bg-space-800/60 backdrop-blur-md rounded-3xl p-8 border border-space-700 shadow-xl min-h-[600px]">
            
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-6">දළ විශ්ලේෂණය (Overview)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-space-900 p-6 rounded-2xl border border-space-700 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white mb-2">{requests.length}</span>
                    <span className="text-sm text-gray-400">මුළු ඉල්ලුම් (Total Requests)</span>
                  </div>
                  <div className="bg-space-900 p-6 rounded-2xl border border-yellow-500/30 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-yellow-400 mb-2">{pendingRequests.length}</span>
                    <span className="text-sm text-yellow-400/80">පොරොත්තු ඉල්ලුම් (Pending)</span>
                  </div>
                  <div className="bg-space-900 p-6 rounded-2xl border border-green-500/30 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-green-400 mb-2">{completedRequests.length}</span>
                    <span className="text-sm text-green-400/80">සම්පූර්ණයි (Completed)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-6">සේවා ඉල්ලුම් (Service Requests)</h3>
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">නව ඉල්ලුම් නොමැත.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((req) => (
                      <div key={req._id} className="bg-space-900/50 rounded-2xl p-6 border border-space-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <h4 className="text-lg font-medium text-white">{req.user?.name}</h4>
                          <p className="text-xs text-gray-400 mb-2">{req.user?.email}</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>උපන් දිනය: {req.birthDate} | වේලාව: {req.birthTime}</p>
                            <p>ස්ථානය: {req.birthPlace}</p>
                          </div>
                          {req.horoscopeImageUrl && (
                            <a href={req.horoscopeImageUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 text-xs flex items-center gap-1 mt-3 hover:underline">
                              <Eye className="w-3 h-3" /> කේන්දර සටහන බලන්න
                            </a>
                          )}
                        </div>
                        <button 
                          onClick={() => setSelectedRequest(req._id)}
                          className="bg-gold-500 hover:bg-gold-400 text-space-900 text-sm font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                        >
                          ප්‍රතිඵල යොමු කරන්න (Upload Result)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-6">ගෙවීම් තහවුරු කිරීම් (Payment Approvals)</h3>
                {pendingPayments.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">තහවුරු කිරීමට ගෙවීම් නොමැත.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((req) => (
                      <div key={req._id} className="bg-space-900/50 rounded-2xl p-6 border border-blue-500/30 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <h4 className="text-lg font-medium text-white">{req.user?.name}</h4>
                          <p className="text-xs text-gray-400 mb-2">ඉල්ලුම් කළ දිනය: {new Date(req.createdAt).toLocaleDateString()}</p>
                          <a href={req.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm flex items-center gap-1 mt-2 hover:underline">
                            <Eye className="w-4 h-4" /> ගෙවීම් රිසිට්පත බලන්න (View Receipt)
                          </a>
                        </div>
                        <button 
                          onClick={() => handleApprovePayment(req._id)}
                          className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> තහවුරු කරන්න (Approve)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Upload Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-space-900 border border-space-700 rounded-3xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-white">ප්‍රතිඵල යොමු කරන්න</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleUploadResult} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">පලාපල වාර්තාව (Text)</label>
                <textarea 
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  rows={6}
                  className="w-full bg-space-800 border border-space-600 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">අමතර ඡායාරූප (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleResultImageChange}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-space-800 file:text-gold-400 hover:file:bg-space-700"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingResult}
                className="w-full bg-gold-500 hover:bg-gold-400 text-space-900 font-bold py-3 rounded-xl transition-colors mt-4 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {uploadingResult ? <><Loader2 className="w-5 h-5 animate-spin" /> යොමු කරමින් පවතී...</> : "යොමු කරන්න (Submit)"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
