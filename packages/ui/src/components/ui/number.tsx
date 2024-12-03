import NumberFlowPrimitive from "@number-flow/react";

type NumberFlowProps = {
  value: number | string;
};

export const NumberFlow = ({ value }: NumberFlowProps) => {
  return (
    <NumberFlowPrimitive
      transformTiming={{ duration: 500, easing: "ease-out" }}
      value={Number(value)}
    />
  )
}
