import { type ComponentPropsWithoutRef, type ReactNode } from "react";

type BreadcrumbItemBaseProps = {
  href?: string;
  children?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export type BreadcrumbItemProps = BreadcrumbItemBaseProps &
  Omit<ComponentPropsWithoutRef<"li">, keyof BreadcrumbItemBaseProps>;

export function BreadcrumbItem(_props: BreadcrumbItemProps) {
  return null;
}

BreadcrumbItem.displayName = "BreadcrumbItem";
