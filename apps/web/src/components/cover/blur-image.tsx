type BlurImageProps = {
  src: string;
};

export function BlurImage({ src }: BlurImageProps) {
  return (
    <div
      className="absolute bottom-0.75 left-0 size-full origin-bottom scale-90 opacity-20 blur-lg saturate-200"
      aria-hidden
    >
      <img src={src} alt="" className="size-full" />
    </div>
  );
}
