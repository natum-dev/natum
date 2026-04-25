import { forwardRef, type HTMLAttributes } from "react";
import { IconStar, IconPencil, IconEye } from "@natum/icons";
import type { IconProps } from "@natum/icons";
import { Badge } from "../Badge";
import type { BadgeColor, BadgeSize } from "../Badge";

export type PermissionLevel = "owner" | "editor" | "viewer";

type PermissionBadgeBaseProps = {
  level: PermissionLevel;
  size?: BadgeSize;
  className?: string;
};

export type PermissionBadgeProps = PermissionBadgeBaseProps &
  Omit<HTMLAttributes<HTMLSpanElement>, "children" | keyof PermissionBadgeBaseProps>;

type LevelConfig = {
  color: BadgeColor;
  icon: React.ComponentType<IconProps>;
  label: string;
};

const LEVEL_CONFIG: Record<PermissionLevel, LevelConfig> = {
  owner: { color: "primary", icon: IconStar, label: "Owner" },
  editor: { color: "secondary", icon: IconPencil, label: "Editor" },
  viewer: { color: "neutral", icon: IconEye, label: "Viewer" },
};

const ICON_SIZE: Record<BadgeSize, "xs" | "sm"> = {
  sm: "xs",
  md: "sm",
};

const PermissionBadge = forwardRef<HTMLSpanElement, PermissionBadgeProps>(
  ({ level, size = "sm", className, ...rest }, ref) => {
    const config = LEVEL_CONFIG[level];
    const Icon = config.icon;

    return (
      <Badge
        {...rest}
        ref={ref}
        color={config.color}
        variant="soft"
        size={size}
        leftSection={<Icon size={ICON_SIZE[size]} color="currentColor" />}
        className={className}
      >
        {config.label}
      </Badge>
    );
  }
);

PermissionBadge.displayName = "PermissionBadge";

export { PermissionBadge };
