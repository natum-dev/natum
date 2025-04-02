import {
  ClassAttributes,
  createElement,
  HTMLAttributes,
  PropsWithChildren,
  ReactHTML,
} from "react";
import styles from "./Container.module.scss";
import classNames from "classnames";

export type ContainerProps<
  P extends HTMLAttributes<T>,
  T extends HTMLElement,
> = PropsWithChildren<
  (ClassAttributes<T> & P) & {
    className?: string;
    as?: keyof ReactHTML;
  }
>;

const Container = <P extends HTMLAttributes<T>, T extends HTMLElement>({
  as = "div",
  className,
  children,
  ...rest
}: ContainerProps<P, T>) => {
  return createElement(
    as,
    {
      className: classNames(className, styles.container),
      ...rest,
    },
    children
  );
};

export default Container;
