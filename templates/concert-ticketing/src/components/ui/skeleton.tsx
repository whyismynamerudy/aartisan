import { useAIEnhanced } from "aartisan/react";
import { cn } from "@/lib/utils";
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Skeleton", {
    purpose: "ui-component",
    interactions: []
  });
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} ref={ref} {...aiProps} />;
}
export { Skeleton };