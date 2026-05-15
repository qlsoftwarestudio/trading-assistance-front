import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface Props {
  data: { value: number }[];
  positive?: boolean;
  height?: number;
}

export const Sparkline = ({ data, positive = true, height = 40 }: Props) => {
  const color = positive ? "hsl(var(--success))" : "hsl(var(--destructive))";
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${positive ? "up" : "dn"}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#spark-${positive ? "up" : "dn"})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
