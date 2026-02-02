"use client";

import { useState, useEffect, useCallback } from "react";

interface JobberStatus {
  connected: boolean;
  expiresAt: number | null;
}

export function useJobberStatus() {
  const [status, setStatus] = useState<JobberStatus>({ connected: false, expiresAt: null });
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/jobber/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false, expiresAt: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const disconnect = async () => {
    await fetch("/api/jobber/disconnect", { method: "POST" });
    setStatus({ connected: false, expiresAt: null });
  };

  return { ...status, loading, refresh: checkStatus, disconnect };
}

export function useJobberData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
