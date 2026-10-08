import { Children } from "react";

export const childrenByType = (children, component) =>
  Children.toArray(children).find((child) => child.type === component) ?? false;
