"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Loader2, CheckCircle2, XCircle, Upload, Eye, EyeOff,
  TrendingUp, DollarSign, Users, FileText, Clock,
  ArrowUpRight, CalendarDays, BarChart3, Activity,
  Camera, X, Image as ImageIcon, Settings
} from "lucide-react";
import { jsPDF } from "jspdf";
import AdminSettings from "@/components/AdminSettings";
import toast from "react-hot-toast";

const getFallbackPrice = (serviceName: string, services: any[] = []) => {
  if (services && services.length > 0) {
    const found = services.find(s => s.title === serviceName);
    if (found && found.price) return found.price;
  }
  if (!serviceName) return "රු. 3000";
  if (serviceName.includes("පොරොන්දම්")) return "රු. 4500";
  if (serviceName.includes("නාමකරණය")) return "රු. 2500";
  if (serviceName.includes("වාර්ෂික")) return "රු. 4000";
  return "රු. 3000";
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'payments' | 'services' | 'users' | 'settings'>('overview');

  // Sub-tab for payments and requests
  const [paymentSubTab, setPaymentSubTab] = useState<'pending' | 'history'>('pending');
  const [requestSubTab, setRequestSubTab] = useState<'pending' | 'completed'>('pending');

  // States for uploading result
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [resultImages, setResultImages] = useState<File[]>([]);
  const [uploadingResult, setUploadingResult] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States for dynamic services
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("");
  const [newServiceIcon, setNewServiceIcon] = useState("Sparkles");
  const [addingService, setAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // States for dynamic users
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserForRequests, setSelectedUserForRequests] = useState<any | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRequests();
      fetchServices();
      fetchUsers();
    }
  }, [status]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      } else if (res.status === 403) {
        toast.error("Access Denied. Admin only.");
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await fetch("/api/services?all=true");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingService(true);
    try {
      const isEditing = !!editingServiceId;
      const url = "/api/admin/services";
      const method = isEditing ? "PUT" : "POST";
      const body = {
        title: newServiceTitle,
        description: newServiceDescription,
        price: newServicePrice,
        duration: newServiceDuration,
        iconName: newServiceIcon,
        ...(isEditing ? { id: editingServiceId } : {})
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(isEditing ? "Service updated successfully!" : "Service created successfully!");
        setNewServiceTitle("");
        setNewServiceDescription("");
        setNewServicePrice("");
        setNewServiceDuration("");
        setNewServiceIcon("Sparkles");
        setEditingServiceId(null);
        fetchServices();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save service");
      }
    } catch (error) {
      console.error("Save service error", error);
      toast.error("Error saving service");
    } finally {
      setAddingService(false);
    }
  };
  const handleToggleServiceActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      if (res.ok) {
        fetchServices();
        toast.success("Service status updated.");
      } else {
        toast.error("Failed to toggle service status.");
      }
    } catch (error) {
      console.error("Toggle service error", error);
    }
  };

  const handleEditClick = (service: any) => {
    setEditingServiceId(service._id);
    setNewServiceTitle(service.title);
    setNewServiceDescription(service.description);
    setNewServicePrice(service.price);
    setNewServiceDuration(service.duration);
    setNewServiceIcon(service.iconName || "Sparkles");
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
    setNewServiceTitle("");
    setNewServiceDescription("");
    setNewServicePrice("");
    setNewServiceDuration("");
    setNewServiceIcon("Sparkles");
  };

  const handleApprovePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/requests/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Payment approved!");
        fetchRequests();
      } else {
        toast.error("Failed to approve payment.");
      }
    } catch (error) {
      console.error("Approval error", error);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("කැමරාවට පිවිසීමේදී දෝෂයක් ඇති විය.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
            setResultImages(prev => [...prev, file]);
            toast.success("ඡායාරූපය ලබාගන්නා ලදී (Photo Captured)");
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const removeImage = (index: number) => {
    setResultImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleResultImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResultImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleUploadResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setUploadingResult(true);
    try {
      let resultPdfUrl = null;
      let imageUrls: string[] = [];

      if (resultImages.length > 0) {
        // Upload Individual Images to Cloudinary
        for (const img of resultImages) {
          const formData = new FormData();
          formData.append("file", img);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            imageUrls.push(uploadData.url);
          }
        }

        // Generate PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        for (let i = 0; i < resultImages.length; i++) {
          const img = resultImages[i];
          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(img);
          });
          
          if (i > 0) pdf.addPage();

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          const imageObj = new window.Image();
          imageObj.src = imgData;
          await new Promise((resolve) => { imageObj.onload = resolve; });

          const imgRatio = imageObj.width / imageObj.height;
          const pdfRatio = pdfWidth / pdfHeight;

          let finalWidth = pdfWidth;
          let finalHeight = pdfWidth / imgRatio;

          if (finalHeight > pdfHeight) {
            finalHeight = pdfHeight;
            finalWidth = pdfHeight * imgRatio;
          }

          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;

          pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
        }

        const pdfBlob = pdf.output("blob");

        const formData = new FormData();
        formData.append("file", new File([pdfBlob], "report.pdf", { type: "application/pdf" }));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          resultPdfUrl = uploadData.url;
        } else {
          throw new Error("Failed to upload PDF");
        }
      }

      const res = await fetch(`/api/admin/requests/${selectedRequest}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultText,
          resultPdfUrl,
          resultImageUrls: imageUrls,
        }),
      });

      if (res.ok) {
        toast.success("Result uploaded successfully!");
        setSelectedRequest(null);
        setResultText("");
        setResultImages([]);
        if (showCamera) stopCamera();
        fetchRequests();
      } else {
        toast.error("Failed to upload result");
      }
    } catch (error) {
      console.error("Result upload error", error);
      toast.error("Error uploading result");
    } finally {
      setUploadingResult(false);
    }
  };

  // Helper: parse price string "රු. 3000" → number
  const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const noCommas = priceStr.replace(/,/g, '');
    const match = noCommas.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Computed data
  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);
  const pendingPayments = useMemo(() => requests.filter(r => r.paymentStatus === 'uploaded'), [requests]);
  const approvedPayments = useMemo(() => requests.filter(r => r.paymentStatus === 'approved'), [requests]);
  const completedRequests = useMemo(() => requests.filter(r => r.status === 'completed'), [requests]);

  // Income calculations
  const totalIncome = useMemo(() => {
    return approvedPayments.reduce((sum, req) => {
      const price = req.service?.price || getFallbackPrice(req.serviceName, services);
      return sum + parsePrice(price);
    }, 0);
  }, [approvedPayments, services]);

  const thisMonthIncome = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    return approvedPayments
      .filter(req => {
        const d = new Date(req.updatedAt || req.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, req) => {
        const price = req.service?.price || getFallbackPrice(req.serviceName, services);
        return sum + parsePrice(price);
      }, 0);
  }, [approvedPayments, services]);

  // Recent activity (last 5 requests)
  const recentActivity = useMemo(() => requests.slice(0, 5), [requests]);

  if (loading || status === "loading") {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-gold-500" /></div>;
  }

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
                <BarChart3 className="w-4 h-4" />
                දළ විශ්ලේෂණය (Overview)
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium flex items-center justify-between ${
                  activeTab === 'requests' ? 'bg-gold-500 text-space-900' : 'text-gray-300 hover:bg-space-700'
                }`}
              >
                <span className="flex items-center gap-3"><FileText className="w-4 h-4" /> නව ඉල්ලුම් (Requests)</span>
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
                <span className="flex items-center gap-3"><DollarSign className="w-4 h-4" /> ගෙවීම් (Payments)</span>
                {pendingPayments.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'payments' ? 'bg-space-900 text-gold-400' : 'bg-gold-500 text-space-900'}`}>
                    {pendingPayments.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium flex items-center gap-3 ${
                  activeTab === 'services' ? 'bg-gold-500 text-space-900' : 'text-gray-300 hover:bg-space-700'
                }`}
              >
                <Activity className="w-4 h-4" />
                සේවාවන් (Services)
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium flex items-center justify-between ${
                  activeTab === 'users' ? 'bg-gold-500 text-space-900' : 'text-gray-300 hover:bg-space-700'
                }`}
              >
                <span className="flex items-center gap-3"><Users className="w-4 h-4" /> පරිශීලකයින් (Users)</span>
                {users.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'users' ? 'bg-space-900 text-gold-400' : 'bg-gold-500 text-space-900'}`}>
                    {users.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium flex items-center gap-3 ${
                  activeTab === 'settings' ? 'bg-gold-500 text-space-900' : 'text-gray-300 hover:bg-space-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                සැකසුම් (Settings)
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4">
          <div className="bg-space-800/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-space-700 shadow-xl min-h-[600px]">
            
            {/* =================== OVERVIEW TAB =================== */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-8">දළ විශ්ලේෂණය (Dashboard)</h3>
                
                {/* Top Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  {/* Total Income */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-5 rounded-2xl border border-emerald-500/20 group hover:border-emerald-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-500/20 rounded-xl">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-xs text-emerald-300/80 font-medium uppercase tracking-wider">මුළු ආදායම</span>
                    </div>
                    <span className="text-2xl font-bold text-white block">රු. {totalIncome.toLocaleString()}</span>
                    <span className="text-xs text-emerald-400/60 mt-1 block">Total Income</span>
                  </div>

                  {/* This Month Income */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 rounded-2xl border border-blue-500/20 group hover:border-blue-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <CalendarDays className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-xs text-blue-300/80 font-medium uppercase tracking-wider">මාසික ආදායම</span>
                    </div>
                    <span className="text-2xl font-bold text-white block">රු. {thisMonthIncome.toLocaleString()}</span>
                    <span className="text-xs text-blue-400/60 mt-1 block">This Month</span>
                  </div>

                  {/* Pending Requests */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-5 rounded-2xl border border-amber-500/20 group hover:border-amber-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-500/20 rounded-xl">
                        <Clock className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-xs text-amber-300/80 font-medium uppercase tracking-wider">පොරොත්තු</span>
                    </div>
                    <span className="text-2xl font-bold text-white block">{pendingRequests.length}</span>
                    <span className="text-xs text-amber-400/60 mt-1 block">Pending Requests</span>
                  </div>

                  {/* Total Users */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5 rounded-2xl border border-purple-500/20 group hover:border-purple-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-xl">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-xs text-purple-300/80 font-medium uppercase tracking-wider">පරිශීලකයින්</span>
                    </div>
                    <span className="text-2xl font-bold text-white block">{users.length}</span>
                    <span className="text-xs text-purple-400/60 mt-1 block">Total Users</span>
                  </div>
                </div>

                {/* Bottom Row: Summary Cards + Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Stats */}
                  <div className="bg-space-900/50 p-6 rounded-2xl border border-space-700">
                    <h4 className="text-lg font-serif font-bold text-white mb-5 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gold-400" />
                      සාරාංශය (Summary)
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-space-800">
                        <span className="text-gray-400 text-sm">මුළු ඉල්ලුම් (Total Requests)</span>
                        <span className="text-white font-bold text-lg">{requests.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-space-800">
                        <span className="text-gray-400 text-sm">අනුමත ගෙවීම් (Approved Payments)</span>
                        <span className="text-emerald-400 font-bold text-lg">{approvedPayments.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-space-800">
                        <span className="text-gray-400 text-sm">පොරොත්තු ගෙවීම් (Pending Payments)</span>
                        <span className="text-amber-400 font-bold text-lg">{pendingPayments.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-400 text-sm">සම්පූර්ණ කළ (Completed)</span>
                        <span className="text-blue-400 font-bold text-lg">{completedRequests.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-space-900/50 p-6 rounded-2xl border border-space-700">
                    <h4 className="text-lg font-serif font-bold text-white mb-5 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-gold-400" />
                      මෑත ක්‍රියාකාරකම් (Recent Activity)
                    </h4>
                    {recentActivity.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-8">ක්‍රියාකාරකම් නොමැත.</p>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.map((req) => (
                          <div key={req._id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-space-950/40 border border-space-850 hover:border-space-700 transition-colors">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              req.status === 'pending' ? 'bg-amber-400' :
                              req.paymentStatus === 'approved' ? 'bg-emerald-400' :
                              'bg-blue-400'
                            }`} />
                            <div className="flex-grow min-w-0">
                              <p className="text-white text-sm font-medium truncate">{req.user?.name || 'Unknown'}</p>
                              <p className="text-gray-500 text-xs truncate">{req.serviceName || 'ජ්‍යෝතිෂ්‍ය කියවීම'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                req.status === 'pending' ? 'bg-amber-500/10 text-amber-300' :
                                req.paymentStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-300' :
                                'bg-blue-500/10 text-blue-300'
                              }`}>
                                {req.status === 'pending' ? 'Pending' : 
                                 req.paymentStatus === 'approved' ? 'Paid' : 'Completed'}
                              </span>
                              <p className="text-gray-600 text-[10px] mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =================== REQUESTS TAB =================== */}
            {activeTab === 'requests' && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-6">සේවා ඉල්ලුම් (Service Requests)</h3>
                
                {/* Sub-tab switcher for Requests */}
                <div className="flex gap-2 mb-6 bg-space-900/60 p-1.5 rounded-xl border border-space-700 w-fit">
                  <button
                    onClick={() => setRequestSubTab('pending')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      requestSubTab === 'pending'
                        ? 'bg-gold-500 text-space-900 shadow-lg shadow-gold-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-space-800'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    නව ඉල්ලුම් (Pending)
                    {pendingRequests.length > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        requestSubTab === 'pending' ? 'bg-space-900 text-gold-400' : 'bg-gold-500/20 text-gold-400'
                      }`}>
                        {pendingRequests.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setRequestSubTab('completed')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      requestSubTab === 'completed'
                        ? 'bg-gold-500 text-space-900 shadow-lg shadow-gold-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-space-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    සම්පූර්ණ කළ (Completed)
                    {completedRequests.length > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        requestSubTab === 'completed' ? 'bg-space-900 text-gold-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {completedRequests.length}
                      </span>
                    )}
                  </button>
                </div>

                {requestSubTab === 'pending' && (
                  <>
                    {pendingRequests.length === 0 ? (
                      <p className="text-gray-400 text-center py-10">නව ඉල්ලුම් නොමැත.</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingRequests.map((req) => (
                          <div key={req._id} className="bg-space-900/50 rounded-2xl p-6 border border-space-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-300 border border-gold-500/20">
                                  {req.serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ලැබුණු දිනය: {new Date(req.createdAt).toLocaleString('si-LK')}
                                </span>
                              </div>
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
                  </>
                )}

                {requestSubTab === 'completed' && (
                  <>
                    {completedRequests.length === 0 ? (
                      <p className="text-gray-400 text-center py-10">සම්පූර්ණ කළ ඉල්ලුම් නොමැත.</p>
                    ) : (
                      <div className="space-y-4">
                        {completedRequests.map((req) => (
                          <div key={req._id} className="bg-space-900/50 rounded-2xl p-6 border border-green-500/30 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-space-800 pb-3 gap-3">
                              <div>
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-300 border border-gold-500/20 mb-2">
                                  {req.serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම"}
                                </span>
                                <h4 className="text-lg font-medium text-white">{req.user?.name}</h4>
                                <p className="text-xs text-gray-400">{req.user?.email}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  ලැබුණු දිනය: {new Date(req.createdAt).toLocaleString('si-LK')} <br/>
                                  අවසන් කළ දිනය: {new Date(req.updatedAt || req.createdAt).toLocaleString('si-LK')}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-semibold">
                                Completed
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300 bg-space-950/40 p-3 rounded-xl border border-space-850">
                              <p><strong>උපන් දිනය:</strong> {req.birthDate}</p>
                              <p><strong>වේලාව:</strong> {req.birthTime}</p>
                              <p><strong>ස්ථානය:</strong> {req.birthPlace}</p>
                            </div>

                            {req.horoscopeImageUrl && (
                              <div>
                                <span className="text-xs text-gray-400 block mb-1">කේන්දර සටහන:</span>
                                <a href={req.horoscopeImageUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 text-xs hover:underline flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" /> රූපය බලන්න (View Image)
                                </a>
                              </div>
                            )}

                            <div className="bg-space-950/60 p-4 rounded-xl border border-space-850 mt-2">
                              <h5 className="text-gold-400 text-xs font-bold mb-2">පලාපල වාර්තාව (Uploaded Result)</h5>
                              <p className="text-gray-300 text-sm whitespace-pre-wrap">{req.resultText || "ප්‍රතිඵල විස්තරයක් නොමැත."}</p>
                              {req.resultPdfUrl && (
                                <a href={req.resultPdfUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors w-fit">
                                  <FileText className="w-3.5 h-3.5" /> PDF වාර්තාව බලන්න (View PDF)
                                </a>
                              )}
                              {req.resultImageUrls && req.resultImageUrls.length > 0 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                  {req.resultImageUrls.map((url: string, index: number) => (
                                    <img key={index} src={url} alt="Result Upload" className="h-24 w-auto rounded border border-space-700" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* =================== PAYMENTS TAB (with sub-tabs) =================== */}
            {activeTab === 'payments' && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-6">ගෙවීම් (Payments)</h3>
                
                {/* Sub-tab switcher */}
                <div className="flex gap-2 mb-6 bg-space-900/60 p-1.5 rounded-xl border border-space-700 w-fit">
                  <button
                    onClick={() => setPaymentSubTab('pending')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      paymentSubTab === 'pending'
                        ? 'bg-gold-500 text-space-900 shadow-lg shadow-gold-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-space-800'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    තහවුරු කිරීමට (Pending)
                    {pendingPayments.length > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        paymentSubTab === 'pending' ? 'bg-space-900 text-gold-400' : 'bg-gold-500/20 text-gold-400'
                      }`}>
                        {pendingPayments.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setPaymentSubTab('history')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      paymentSubTab === 'history'
                        ? 'bg-gold-500 text-space-900 shadow-lg shadow-gold-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-space-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    ඉතිහාසය (History)
                    {approvedPayments.length > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        paymentSubTab === 'history' ? 'bg-space-900 text-gold-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {approvedPayments.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Pending Payments Sub-Tab */}
                {paymentSubTab === 'pending' && (
                  <>
                    {pendingPayments.length === 0 ? (
                      <p className="text-gray-400 text-center py-10">තහවුරු කිරීමට ගෙවීම් නොමැත.</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingPayments.map((req) => (
                          <div key={req._id} className="bg-space-900/50 rounded-2xl p-6 border border-blue-500/30 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-300 border border-gold-500/20 mb-3">
                                {req.serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම"}
                              </span>
                              <h4 className="text-lg font-medium text-white">{req.user?.name}</h4>
                              <p className="text-xs text-gray-400 mb-2">ඉල්ලුම් කළ දිනය: {new Date(req.createdAt).toLocaleDateString()}</p>
                              <p className="text-sm text-emerald-400 font-semibold mb-2">
                                මුදල: {req.service?.price || getFallbackPrice(req.serviceName, services)}
                              </p>
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
                  </>
                )}

                {/* Payment History Sub-Tab */}
                {paymentSubTab === 'history' && (
                  <>
                    {approvedPayments.length === 0 ? (
                      <p className="text-gray-400 text-center py-10">ගෙවීම් ඉතිහාසයක් නොමැත.</p>
                    ) : (
                      <div>
                        {/* History Summary */}
                        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-4 rounded-xl border border-emerald-500/20 mb-6 flex flex-wrap items-center gap-6">
                          <div>
                            <span className="text-xs text-emerald-300/70 uppercase tracking-wider block">මුළු ආදායම (Total)</span>
                            <span className="text-xl font-bold text-white">රු. {totalIncome.toLocaleString()}</span>
                          </div>
                          <div className="w-px h-10 bg-space-700 hidden sm:block" />
                          <div>
                            <span className="text-xs text-blue-300/70 uppercase tracking-wider block">මාසික (This Month)</span>
                            <span className="text-xl font-bold text-white">රු. {thisMonthIncome.toLocaleString()}</span>
                          </div>
                          <div className="w-px h-10 bg-space-700 hidden sm:block" />
                          <div>
                            <span className="text-xs text-purple-300/70 uppercase tracking-wider block">ගෙවීම් ගණන (Count)</span>
                            <span className="text-xl font-bold text-white">{approvedPayments.length}</span>
                          </div>
                        </div>

                        {/* History Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-space-700">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase">පරිශීලකයා</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase">සේවාව</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase">මුදල</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase">දිනය</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase">තත්ත්වය</th>
                              </tr>
                            </thead>
                            <tbody>
                              {approvedPayments.map((req) => (
                                <tr key={req._id} className="border-b border-space-800/50 hover:bg-space-900/30 transition-colors">
                                  <td className="py-3.5 px-4">
                                    <div>
                                      <p className="text-white font-medium">{req.user?.name || 'Unknown'}</p>
                                      <p className="text-gray-500 text-xs">{req.user?.email || ''}</p>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-gray-300">{req.serviceName || 'ජ්‍යෝතිෂ්‍ය කියවීම'}</td>
                                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{req.service?.price || getFallbackPrice(req.serviceName, services)}</td>
                                  <td className="py-3.5 px-4 text-gray-400">{new Date(req.updatedAt || req.createdAt).toLocaleDateString()}</td>
                                  <td className="py-3.5 px-4">
                                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                                      <CheckCircle2 className="w-3 h-3" /> Approved
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}



            {/* =================== SERVICES TAB =================== */}
            {activeTab === 'services' && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-6">සේවාවන් කළමනාකරණය (Manage Services)</h3>
                
                {/* Add Service Form */}
                <form onSubmit={handleSaveService} className="bg-space-900/40 p-6 rounded-2xl border border-space-700 mb-8 space-y-4">
                  <h4 className="text-lg font-bold text-white mb-2">
                    {editingServiceId ? "සේවාව සංස්කරණය කරන්න (Edit Service)" : "නව සේවාවක් එක් කරන්න (Add New Service)"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">සේවා නාමය (Service Title)</label>
                      <input 
                        type="text" 
                        value={newServiceTitle}
                        onChange={(e) => setNewServiceTitle(e.target.value)}
                        className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                        placeholder="උදා: පොරොන්දම් ගැලපීම"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">මිල (Price)</label>
                      <input 
                        type="text" 
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                        placeholder="උදා: රු. 3000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">කාලසීමාව (Duration)</label>
                      <input 
                        type="text" 
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                        placeholder="උදා: විනාඩි 60"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">රූපකය (Icon)</label>
                      <select 
                        value={newServiceIcon}
                        onChange={(e) => setNewServiceIcon(e.target.value)}
                        className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                      >
                        <option value="Star" className="bg-space-900">Star (තරුව)</option>
                        <option value="Heart" className="bg-space-900">Heart (හෘදය)</option>
                        <option value="Book" className="bg-space-900">Book (පොත)</option>
                        <option value="Sparkles" className="bg-space-900">Sparkles (දීප්තිය)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">විස්තරය (Description)</label>
                    <textarea 
                      value={newServiceDescription}
                      onChange={(e) => setNewServiceDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-space-850 border border-space-600 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                      placeholder="සේවාව පිළිබඳ කෙටි හැඳින්වීමක්..."
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={addingService}
                      className="flex-grow bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-space-900 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                      {addingService ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingServiceId ? "යාවත්කාලීන කරන්න (Update)" : "එක් කරන්න (Add Service)")}
                    </button>
                    {editingServiceId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-space-700 hover:bg-space-600 text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer"
                      >
                        අවලංගු කරන්න (Cancel)
                      </button>
                    )}
                  </div>
                </form>

                {/* Services List */}
                <h4 className="text-lg font-bold text-white mb-4">පවතින සේවාවන් (Current Services)</h4>
                {servicesLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
                ) : services.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">කිසිදු සේවාවක් නොමැත.</p>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service._id} className={`p-4 rounded-xl border flex justify-between items-center gap-4 transition-all ${
                        service.isActive !== false ? 'bg-space-900/30 border-space-700/60' : 'bg-space-900/10 border-space-800/50 opacity-70 grayscale'
                      }`}>
                        <div className="flex-grow">
                          <h5 className="font-serif font-bold text-white text-lg flex items-center gap-2">
                            {service.title}
                            {service.isActive === false && (
                              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 font-sans tracking-wide">
                                INACTIVE
                              </span>
                            )}
                          </h5>
                          <p className="text-xs text-gray-400 mt-0.5">{service.duration} | {service.price}</p>
                          <p className="text-sm text-gray-300 mt-2 leading-relaxed">{service.description}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0">
                          <span className="text-xs px-2.5 py-1 rounded bg-space-800 text-gold-400 font-semibold border border-space-700 hidden sm:block">
                            {service.iconName}
                          </span>
                          
                          <button
                            onClick={() => handleToggleServiceActive(service._id, service.isActive !== false)}
                            className={`flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer border ${
                              service.isActive !== false 
                                ? 'bg-space-800 hover:bg-space-700 text-gray-400 hover:text-white border-space-700' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                            title={service.isActive !== false ? "Deactivate Service" : "Activate Service"}
                          >
                            {service.isActive !== false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleEditClick(service)}
                            className="bg-gold-500/10 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            සංස්කරණය (Edit)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =================== USERS TAB =================== */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mb-6">ලියාපදිංචි පරිශීලකයින් (Registered Users)</h3>
                
                {usersLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
                ) : users.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">කිසිදු පරිශීලකයෙකු ලියාපදිංචි වී නොමැත.</p>
                ) : (
                  <div className="space-y-4">
                    {users.map((usr) => {
                      const userRequests = requests.filter(r => r.user?._id === usr._id || r.user === usr._id);
                      return (
                        <div key={usr._id} className="bg-space-900/30 p-4 rounded-xl border border-space-700/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div>
                            <h5 className="font-serif font-bold text-white text-lg">{usr.name}</h5>
                            <p className="text-xs text-gray-400 mt-0.5">{usr.email} | Joined: {new Date(usr.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gold-400 mt-1 font-semibold">Role: {usr.role}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs px-2.5 py-1 rounded bg-space-800 text-gold-400 font-semibold border border-space-700">
                              Requests: {userRequests.length}
                            </span>
                            {userRequests.length > 0 && (
                              <button
                                onClick={() => setSelectedUserForRequests(usr)}
                                className="bg-gold-500 hover:bg-gold-400 text-space-900 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                View Requests (ඉල්ලුම් බලන්න)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =================== SETTINGS TAB =================== */}
            {activeTab === 'settings' && (
              <AdminSettings />
            )}
          </div>
        </div>
      </div>

      {/* User Requests Modal */}
      {selectedUserForRequests && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-space-900 border border-space-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-space-800 pb-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-gold-400">{selectedUserForRequests.name} ගේ ඉල්ලීම්</h3>
                <p className="text-xs text-gray-400">{selectedUserForRequests.email}</p>
              </div>
              <button onClick={() => setSelectedUserForRequests(null)} className="text-gray-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
            </div>

            <div className="space-y-6">
              {requests
                .filter(r => r.user?._id === selectedUserForRequests._id || r.user === selectedUserForRequests._id)
                .map((req) => (
                  <div key={req._id} className="bg-space-950/50 p-5 rounded-2xl border border-space-850">
                    <div className="flex justify-between items-start mb-3 border-b border-space-850 pb-3">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">
                          ඉල්ලුම් කළ දිනය: {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                        <h4 className="text-md font-bold text-white">{req.serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම"}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                        req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' :
                        req.status === 'completed' ? 'bg-green-500/10 text-green-300 border border-green-500/20' :
                        'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300 mb-4 bg-space-900/40 p-3 rounded-xl border border-space-850">
                      <p><strong>උපන් දිනය:</strong> {req.birthDate}</p>
                      <p><strong>වේලාව:</strong> {req.birthTime}</p>
                      <p><strong>ස්ථානය:</strong> {req.birthPlace}</p>
                    </div>

                    {req.horoscopeImageUrl && (
                      <div className="mb-4">
                        <span className="text-xs text-gray-400 block mb-1">කේන්දර සටහන:</span>
                        <a href={req.horoscopeImageUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 text-xs hover:underline flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> රූපය බලන්න (View Image)
                        </a>
                      </div>
                    )}

                    {req.status === 'completed' && (
                      <div className="bg-space-900/60 p-4 rounded-xl border border-space-850 mt-2">
                        <h5 className="text-gold-400 text-xs font-bold mb-2">පලාපල වාර්තාව (Uploaded Result)</h5>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{req.resultText}</p>
                        {req.resultPdfUrl && (
                          <a href={req.resultPdfUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors w-fit">
                            <FileText className="w-3.5 h-3.5" /> PDF වාර්තාව බලන්න (View PDF)
                          </a>
                        )}
                        {req.resultImageUrls && req.resultImageUrls.length > 0 && (
                          <div className="mt-2 flex gap-2 overflow-x-auto">
                            {req.resultImageUrls.map((url: string, index: number) => (
                              <img key={index} src={url} alt="Result Upload" className="h-16 w-auto rounded border border-space-700" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-sm font-medium text-gray-300 mb-2">ප්‍රතිඵල ඡායාරූප (Result Images)</label>
                
                {!showCamera ? (
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 bg-space-800 hover:bg-space-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-space-600 transition-colors"
                    >
                      <Camera className="w-5 h-5 text-gold-400" />
                      කැමරාවෙන් ලබාගන්න
                    </button>
                    
                    <label className="flex-1 bg-space-800 hover:bg-space-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-space-600 transition-colors cursor-pointer">
                      <ImageIcon className="w-5 h-5 text-gold-400" />
                      උපාංගයෙන් තෝරන්න
                      <input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleResultImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mb-4 bg-space-950 p-3 rounded-2xl border border-space-700 relative">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <Camera className="w-5 h-5" /> ඡායාරූපය ගන්න (Capture)
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-space-800 hover:bg-space-700 text-white p-3 rounded-xl transition-colors border border-space-600"
                        title="Close Camera"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected Images Preview */}
                {resultImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">තෝරාගත් ඡායාරූප ({resultImages.length}): මෙම ඡායාරූප සියල්ල PDF වාර්තාවක් ලෙස පරිශීලකයාට යැවේ.</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {resultImages.map((img, index) => (
                        <div key={index} className="relative shrink-0">
                          <img 
                            src={URL.createObjectURL(img)} 
                            alt={`Upload ${index + 1}`} 
                            className="h-24 w-24 object-cover rounded-xl border border-space-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
