import { cn } from "@harmony/ui/lib/utils";

type LandingLogoProps = {
  className?: string;
};

const BARS = [
  {
    animateClassName: "animate-[logo-bar_1.2s_ease-in-out_infinite]",
    d: "m9.292 17.838-1.5451 0.1081c-0.58857 0.0411-1.0288 0.6008-0.98337 1.2499l0.40003 5.7208c0.0454 0.6492 0.5592 1.1421 1.1478 1.101l1.545-0.1081c0.58859-0.0411 1.0288-0.6008 0.98339-1.25l-0.4001-5.7207c-0.0453-0.6492-0.55915-1.1421-1.1477-1.101z",
  },
  {
    animateClassName: "animate-[logo-bar_1.6s_ease-in-out_infinite]",
    d: "m13.59 6.7296-1.5451 0.10804c-0.5885 0.04115-1.0287 0.60079-0.9834 1.25l1.1522 16.476c0.0454 0.6491 0.5592 1.1421 1.1478 1.1009l1.545-0.108c0.5886-0.0412 1.0288-0.6008 0.9834-1.25l-1.1522-16.476c-0.0454-0.64921-0.5592-1.1421-1.1477-1.101z",
  },
  {
    animateClassName: "animate-[logo-bar_1.4s_ease-in-out_infinite]",
    d: "m19.149 13.663-1.5451 0.108c-0.5885 0.0412-1.043 0.3971-1.0152 0.7951l0.7063 10.1c0.0278 0.3979 0.5274 0.6871 1.1159 0.646l1.5451-0.1081c0.5885-0.0411 1.043-0.3971 1.0152-0.795l-0.7063-10.1c-0.0278-0.3979-0.5274-0.6872-1.1159-0.646z",
  },
  {
    animateClassName: "animate-[logo-bar_1.3s_ease-in-out_infinite]",
    d: "m23.924 9.3848-1.5451 0.10804c-0.5885 0.04115-1.0225 0.69003-0.9694 1.4492l0.8892 12.716c0.0531 0.7592 0.5732 1.3414 1.1617 1.3002l1.5451-0.108c0.5885-0.0412 1.0225-0.6901 0.9694-1.4492l-0.8892-12.716c-0.0531-0.75928-0.5732-1.3414-1.1617-1.3003z",
  },
] as const;

/** Wordmark mark — bars bounce async while parent has `group/logo` + hover. */
export function LandingLogo({ className }: LandingLogoProps) {
  return (
    <svg
      viewBox="0 0 32 33"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-6", className)}
    >
      <rect
        transform="rotate(-4 0 2.0908)"
        y="2.0908"
        width="29.979"
        height="30.024"
        rx="4.0258"
        fill="#141414"
      />
      <g fill="#1ED760" clipPath="url(#landing-logo-clip)">
        {BARS.map((bar) => (
          <path
            key={bar.animateClassName}
            d={bar.d}
            className={cn(
              "origin-bottom [transform-box:fill-box]",
              "[animation-play-state:paused] group-hover/logo:[animation-play-state:running] group-focus-visible/logo:[animation-play-state:running]",
              "motion-reduce:animate-none!",
              bar.animateClassName,
            )}
          />
        ))}
      </g>
      <defs>
        <clipPath id="landing-logo-clip">
          <rect width="32" height="33" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
