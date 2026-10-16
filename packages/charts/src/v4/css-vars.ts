import "react";

declare module "react" {
  // Lets style props carry CSS custom properties, such as the tooltip tokens.
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
