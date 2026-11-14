"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export interface ActiveSessionItem {
  id: string;
  device: {
    browser: string;
    os: string;
    deviceType: string;
    ip: string;
    userAgent: string;
    fingerprintHash: string;
  };
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export function ActiveSessionsManager() {
  const [sessions, setSessions] = useState<ActiveSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{
        success: boolean;
        data: {
          currentSessionId: string | null;
          sessions: ActiveSessionItem[];
        };
      }>("/api/v1/auth/sessions");

      if (res?.success && res.data) {
        setSessions(res.data.sessions);
      }
    } catch {
      // fallback if offline or mock
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSingle = async (sessionId: string) => {
    setIsRevoking(true);
    setMessage(null);
    try {
      await api.del(`/api/v1/auth/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setMessage("Session successfully revoked.");
    } catch {
      setMessage("Failed to revoke session.");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRevokeOthers = async () => {
    setIsRevoking(true);
    setMessage(null);
    try {
      const res = await api.post<{ success: boolean; revokedCount: number }>(
        "/api/v1/auth/sessions/revoke-others",
        {}
      );
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setMessage(`Logged out ${res?.revokedCount ?? "all"} other devices.`);
    } catch {
      setMessage("Failed to log out other devices.");
    } finally {
      setIsRevoking(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Active Sessions & Devices</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your logged-in devices and revoke unauthorized access.
          </p>
        </div>
        {otherSessions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeOthers}
            disabled={isRevoking}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            {isRevoking ? "Revoking..." : "Log out other devices"}
          </Button>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/80" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-slate-400">No active sessions found.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-4 rounded-2xl border ${
                session.isCurrent
                  ? "bg-emerald-50/60 border-emerald-200"
                  : "bg-slate-50 border-slate-200/80"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    {session.device.browser} on {session.device.os}
                  </span>
                  {session.isCurrent && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      This device
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-medium">
                    {session.device.deviceType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                  <span>IP: {session.device.ip}</span>
                  <span>•</span>
                  <span>
                    Started {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSingle(session.id)}
                  disabled={isRevoking}
                  className="text-xs font-bold text-slate-600 hover:text-rose-600 hover:border-rose-300 rounded-xl"
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
