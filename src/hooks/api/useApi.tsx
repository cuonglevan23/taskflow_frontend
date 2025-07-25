"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiHookReturn, ApiRequestConfig } from "@/types";

export function useApi<T = unknown>(
  url: string,
  config?: ApiRequestConfig
): ApiHookReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual fetch
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockData = { message: "Data loaded successfully" } as T;
      setData(mockData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, config]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}
