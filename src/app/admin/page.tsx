"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AdminApp, { type AdminData } from "@/components/admin/AdminApp";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AdminData>({ requests: [], services: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    const res = await fetch("/api/admin/requests");
    if (res.status === 403) {
      toast.error("පරිපාලකයින්ට පමණි");
      router.push("/");
      return;
    }
    if (res.ok) {
      const { requests } = await res.json();
      setData((d) => ({ ...d, requests: requests || [] }));
    }
  }, [router]);

  const fetchServices = useCallback(async () => {
    const res = await fetch("/api/services?all=true");
    if (res.ok) {
      const { services } = await res.json();
      setData((d) => ({ ...d, services: services || [] }));
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const { users } = await res.json();
      setData((d) => ({ ...d, users: users || [] }));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchRequests(), fetchServices(), fetchUsers()]);
    } catch (e) {
      console.error(e);
      toast.error("දත්ත ලබා ගැනීමට නොහැකි විය");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchRequests, fetchServices, fetchUsers]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") refreshAll();
  }, [status, router, refreshAll]);

  // Pick up new customer requests without a manual refresh (every 60s, only while the tab is visible).
  useEffect(() => {
    if (status !== "authenticated") return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchRequests().catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, [status, fetchRequests]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-[100dvh] bg-[#060a14] grid place-items-center">
        <Loader2 className="w-9 h-9 animate-spin text-gold-400" />
      </div>
    );
  }

  return (
    <AdminApp
      data={data}
      admin={{ name: session?.user?.name, image: session?.user?.image }}
      refreshing={refreshing}
      onRefresh={refreshAll}
      reloadRequests={fetchRequests}
      reloadServices={fetchServices}
    />
  );
}
