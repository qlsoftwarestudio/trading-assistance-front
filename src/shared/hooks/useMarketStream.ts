import { useEffect, useState } from "react";
import { isMockMode } from "@/shared/api/client";
import { subscribeMarket } from "@/shared/api/mockData";
import type { MarketCondition } from "@/shared/types";

/**
 * useMarketStream — exponential-backoff WebSocket consumer for /ws/market.
 * In mock mode, subscribes to the in-memory ticker.
 * In live mode, connects to VITE_WS_URL with reconnect.
 */
export function useMarketStream() {
  const [data, setData] = useState<MarketCondition | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isMockMode) {
      setConnected(true);
      const unsub = subscribeMarket(setData);
      return () => { setConnected(false); unsub(); };
    }

    let ws: WebSocket | null = null;
    let timer: number | null = null;
    let attempts = 0;
    const MAX = 5;
    const wsUrl = (import.meta.env.VITE_WS_URL as string | undefined) ?? "";

    const connect = () => {
      try {
        ws = new WebSocket(`${wsUrl}/ws/market`);
        ws.onopen = () => { setConnected(true); attempts = 0; };
        ws.onmessage = (e) => { try { setData(JSON.parse(e.data)); } catch { /* ignore */ } };
        ws.onclose = () => {
          setConnected(false);
          if (attempts < MAX) {
            timer = window.setTimeout(() => { attempts++; connect(); }, Math.min(1000 * 2 ** attempts, 30_000));
          }
        };
        ws.onerror = () => ws?.close();
      } catch { /* swallow */ }
    };
    connect();
    return () => { ws?.close(); if (timer) clearTimeout(timer); };
  }, []);

  return { data, connected };
}
