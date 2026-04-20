import {
  forwardRef,
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import cx from "classnames";
import { IconUser } from "@natum/icons";
import { deriveInitials, pickColor, type HashPaletteColor } from "./utils";
import { AvatarGroupContext } from "./context";
import styles from "./Avatar.module.scss";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
export type AvatarColor =
  | "auto"
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  fallback?: ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  color?: AvatarColor;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className">;

const ICON_PX: Record<AvatarSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

function normalizeInitials(raw: string): string {
  return raw.trim().slice(0, 2).toUpperCase();
}

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    src,
    alt,
    name,
    initials,
    fallback,
    size: sizeProp,
    shape: shapeProp,
    color: colorProp = "auto",
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const groupCtx = useContext(AvatarGroupContext);
  const size: AvatarSize = sizeProp ?? groupCtx?.size ?? "md";
  const shape: AvatarShape = shapeProp ?? groupCtx?.shape ?? "circle";

  const [isBroken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
  }, [src]);

  const derivedInitials =
    initials !== undefined ? normalizeInitials(initials) : deriveInitials(name);

  const resolvedColor: HashPaletteColor | "neutral" | AvatarColor =
    colorProp === "auto" ? pickColor(name) : colorProp;

  const showImage = !!src && !isBroken;
  const showInitials = !showImage && derivedInitials.length > 0;
  const showCustomFallback = !showImage && !showInitials && fallback !== undefined;
  const showIconFallback = !showImage && !showInitials && !showCustomFallback;

  const fallbackKind = showImage
    ? "image"
    : showInitials
    ? "initials"
    : showCustomFallback
    ? "custom"
    : "icon";

  const wrapperAria = showImage
    ? {}
    : {
        role: "img" as const,
        "aria-label": ariaLabel ?? name ?? "User avatar",
      };

  return (
    <span
      ref={ref}
      {...rest}
      {...wrapperAria}
      className={cx(styles.avatar, className)}
      data-size={size}
      data-shape={shape}
      data-color={resolvedColor}
      data-fallback={fallbackKind}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name ?? ""}
          loading="lazy"
          onError={() => setBroken(true)}
          className={styles.image}
          aria-hidden={false}
        />
      ) : null}
      {showInitials ? (
        <span aria-hidden="true">{derivedInitials}</span>
      ) : null}
      {showCustomFallback ? (
        <span aria-hidden="true">{fallback}</span>
      ) : null}
      {showIconFallback ? (
        <IconUser size={ICON_PX[size]} aria-hidden="true" />
      ) : null}
    </span>
  );
});

Avatar.displayName = "Avatar";

export { Avatar };
