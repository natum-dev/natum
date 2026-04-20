import { createContext } from "react";
import type { AvatarSize, AvatarShape } from "./Avatar";

export type AvatarGroupContextValue = {
  size?: AvatarSize;
  shape?: AvatarShape;
};

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(
  null
);
