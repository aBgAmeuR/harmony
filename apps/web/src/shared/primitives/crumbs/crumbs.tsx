import type { ComponentProps, ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@harmony/ui/components/breadcrumb";
import { Children, Fragment } from "react";

const Root = ({ children }: { children: ReactNode }) => (
  <Breadcrumb data-slot="crumbs">
    <BreadcrumbList className="text-sm">
      {Children.toArray(children).map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? <BreadcrumbSeparator /> : null}
          {child}
        </Fragment>
      ))}
    </BreadcrumbList>
  </Breadcrumb>
);

const Item = (props: ComponentProps<typeof BreadcrumbLink>) => (
  <BreadcrumbItem>
    <BreadcrumbLink {...props} />
  </BreadcrumbItem>
);

const Here = ({ children }: { children: ReactNode }) => (
  <BreadcrumbItem>
    <BreadcrumbPage className="font-semibold tracking-tight">{children}</BreadcrumbPage>
  </BreadcrumbItem>
);

export const Crumbs = Object.assign(Root, { Item, Here });
