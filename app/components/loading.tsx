import { cn } from "~/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({
  className,
  size = "md",
  text = "Loading...",
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn("flex flex-col items-center justify-center p-4", className)}
    >
      <div className="relative">
        <div
          className={cn(
            "animate-spin rounded-full border-t-2 border-b-2 border-primary",
            sizeClasses[size]
          )}
        ></div>
      </div>
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
