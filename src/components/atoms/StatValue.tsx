import { cn } from "@/lib/utils";

interface Props {
  value: number | string;
  className?: string;
  mono?: boolean;
}

export const StatValue = ({ value, className, mono = true }: Props) => (
  <span className={cn("font-semibold tabular-nums", mono && "font-mono", className)}>
    {value}
  </span>
);
