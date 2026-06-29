import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

interface Props {
  symbol: string;
  exchange?: string;
  interval?: string;
}

export const TradingViewChart = ({
  symbol,
  exchange = "BINANCE",
  interval = "5",
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerId = `tv_chart_${symbol}_${Date.now()}`;

    // Clear previous widget container
    if (widgetRef.current) {
      widgetRef.current.remove();
    }

    const widgetContainer = document.createElement("div");
    widgetContainer.id = containerId;
    widgetContainer.style.width = "100%";
    widgetContainer.style.height = "100%";
    containerRef.current.appendChild(widgetContainer);
    widgetRef.current = widgetContainer;

    const isFutures = exchange === "BINANCE" && symbol.endsWith("USDT");
    const fullSymbol = `${exchange}:${symbol}${isFutures ? ".P" : ""}`;

    const initWidget = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: fullSymbol,
          interval: interval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "es",
          toolbar_bg: "#1a1a1a",
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          save_image: true,
          container_id: containerId,
          studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
        });
      }
    };

    if (!window.TradingView) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol, exchange, interval]);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
