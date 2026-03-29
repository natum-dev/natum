import { type SVGProps, forwardRef } from "react";

type EmptyStateProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const EmptyState = forwardRef<SVGSVGElement, EmptyStateProps>(
  ({ size = 120, ...rest }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <rect x="16" y="40" width="88" height="56" rx="6" fill="var(--neutral-bg-inset)" stroke="var(--border-color-subtle)" strokeWidth="2" />
      <path d="M16 40V34a6 6 0 0 1 6-6h20l8 12h54a6 6 0 0 1 6 6v0H16z" fill="var(--neutral-bg-inset)" stroke="var(--border-color-subtle)" strokeWidth="2" />
      <rect x="36" y="56" width="48" height="24" rx="4" stroke="var(--disabled-border)" strokeWidth="2" strokeDasharray="6 4" fill="none" />
      <path d="M60 62v12M54 68h12" stroke="var(--disabled-text)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
);

EmptyState.displayName = "EmptyState";

export { EmptyState };
export type { EmptyStateProps };
