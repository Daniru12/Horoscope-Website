import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { User, Calendar, MapPin, Clock, FileText } from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import PaymentUpload from "@/components/PaymentUpload";
import Service from "@/models/Service";

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

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session as any).user.role === "admin") {
    redirect("/admin");
  }

  await connectToDatabase();
  const requests = await ServiceRequest.find({ user: session.user.id })
    .populate('service')
    .sort({ createdAt: -1 });

  const allServices = await Service.find({ isActive: { $ne: false } });

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-1/3">
          <div className="bg-space-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-space-700 shadow-2xl text-center sticky top-24">
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-gold-500/50 mb-6 overflow-hidden bg-space-900 flex items-center justify-center">
              {session.user.image ? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-gold-400" />
              )}
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">{session.user.name}</h2>
            <p className="text-gray-400 mb-6">{session.user.email}</p>
            <Link 
              href="/service-request" 
              className="inline-block w-full bg-gold-500 hover:bg-gold-400 text-space-900 font-bold py-3 rounded-xl transition-colors"
            >
              නව සේවා ඉල්ලුමක්
            </Link>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <div className="bg-space-800/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-space-700 shadow-xl min-h-[500px]">
            <h3 className="text-2xl font-serif font-bold text-white mb-6 border-b border-space-700 pb-4">
              ඔබගේ සේවා ඉල්ලුම් (Service Requests)
            </h3>

            {requests.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-space-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">ඔබට දැනට කිසිදු සේවා ඉල්ලුමක් නොමැත.</p>
                <Link href="/service-request" className="text-gold-400 hover:text-gold-300 mt-2 inline-block">
                  පළමු ඉල්ලුම යොමු කරන්න
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {requests.map((req) => (
                  <div key={req._id.toString()} className="bg-space-900/50 rounded-2xl p-6 border border-space-700">
                    {/* Status mapping */}
                    <div className="flex justify-between items-start mb-4 border-b border-space-800 pb-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">
                          ඉල්ලුම් කළ දිනය: {new Date(req.createdAt).toLocaleDateString('si-LK')}
                        </span>
                        <h4 className="text-lg font-medium text-white">{req.serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම"}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium block mb-2 ${
                          req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          req.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {req.status === 'pending' ? 'පොරොත්තු (Pending)' : 
                          req.status === 'completed' ? 'සම්පූර්ණයි (Ready)' : 'අවලංගුයි (Cancelled)'}
                        </span>
                        {req.status === 'completed' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium block ${
                            req.paymentStatus === 'approved' ? 'bg-green-500/20 text-green-300' :
                            req.paymentStatus === 'uploaded' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {req.paymentStatus === 'approved' ? 'Payment Approved' :
                            req.paymentStatus === 'uploaded' ? 'Payment Verifying' : 'Payment Required'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-gold-400" />
                        <span>උපන් දිනය: {req.birthDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-gold-400" />
                        <span>උපන් වේලාව: {req.birthTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-gold-400" />
                        <span>උපන් ස්ථානය: {req.birthPlace}</span>
                      </div>
                    </div>

                    {req.horoscopeImageUrl && (
                      <div className="mt-4 pt-4 border-t border-space-800">
                        <span className="text-sm text-gray-400 block mb-2">උඩුගත කළ කේන්දර සටහන:</span>
                        <a href={req.horoscopeImageUrl} target="_blank" rel="noopener noreferrer">
                          <img src={req.horoscopeImageUrl} alt="Horoscope" className="h-24 w-auto rounded-lg border border-space-700 hover:border-gold-500 transition-colors cursor-pointer" />
                        </a>
                      </div>
                    )}

                    {/* Result and Payment Section */}
                    {req.status === 'completed' && (
                      <div className="mt-6 pt-4 border-t border-space-800 bg-space-950/50 p-4 rounded-xl relative overflow-hidden">
                        
                        <h4 className="text-gold-400 font-bold mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> පලාපල වාර්තාව (Horoscope Result)
                        </h4>

                        {req.paymentStatus === 'approved' ? (
                          <div>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{req.resultText || "පලාපල වාර්තාවක් නොමැත."}</p>
                            {req.resultPdfUrl && (
                              <a 
                                href={req.resultPdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                              >
                                <FileText className="w-5 h-5" /> PDF වාර්තාව බාගත කරන්න (Download PDF Report)
                              </a>
                            )}
                            {req.resultImageUrls && req.resultImageUrls.length > 0 && (
                              <ImageLightbox images={req.resultImageUrls} />
                            )}
                          </div>
                        ) : (
                          <div className="blur-sm select-none pointer-events-none">
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{req.resultText || "පලාපල වාර්තාවක් නොමැත."}</p>
                            {req.resultPdfUrl && (
                              <button className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl">
                                <FileText className="w-5 h-5" /> PDF වාර්තාව බාගත කරන්න (Download PDF Report)
                              </button>
                            )}
                            {req.resultImageUrls && req.resultImageUrls.length > 0 && (
                              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                {req.resultImageUrls.map((img: string, idx: number) => (
                                  <img key={idx} src={img} alt="Result" className="h-32 w-auto rounded border border-space-700" />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {req.paymentStatus === 'pending' && (
                          <div className="absolute inset-0 bg-space-900/60 flex flex-col items-center justify-center p-4 backdrop-blur-[2px]">
                            <p className="text-white font-medium mb-3 text-center">
                              වාර්තාව බැලීම සඳහා ගෙවීම් රිසිට්පත උඩුගත කරන්න.
                              <span className="block text-gold-400 font-bold mt-1 text-sm">
                                ගෙවිය යුතු මුදල: {(req.service as any)?.price || getFallbackPrice(req.serviceName, allServices)}
                              </span>
                            </p>
                            <PaymentUpload requestId={req._id.toString()} />
                          </div>
                        )}

                        {req.paymentStatus === 'uploaded' && (
                          <div className="absolute inset-0 bg-space-900/60 flex flex-col items-center justify-center p-4 backdrop-blur-[2px]">
                            <p className="text-gold-400 font-medium text-center">
                              ඔබගේ ගෙවීම් රිසිට්පත පරිපාලක විසින් තහවුරු කරන තෙක් රැඳී සිටින්න. (Awaiting Admin Approval)
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
