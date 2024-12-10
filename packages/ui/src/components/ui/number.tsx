import NumberFlowPrimitive from "@number-flow/react";
import { format, localeFormat } from "light-date";

type NumberFlowProps = Omit<Parameters<typeof NumberFlowPrimitive>[0], 'value'> & {
  value: number | string;
};

export const NumberFlow = ({ value, ...props }: NumberFlowProps) => {
  return (
    <NumberFlowPrimitive
      transformTiming={{ duration: 500, easing: "ease-in-out" }}
      value={Number(value)}
      {...props}
    />
  )
}

type NumbersFlowDateProps = {
  value: Date;
  showTime?: boolean;
}

export const NumbersFlowDate = ({ value, showTime }: NumbersFlowDateProps) => {
  const month = localeFormat(value, "{MMMM}")
  const day = format(value, "{dd}")
  const year = format(value, "{yyyy}")
  const hour = format(value, "{HH}")
  const minute = format(value, "{mm}")

  return (
    <span>{month}
      <NumberFlow
        value={day}
        format={{ notation: "standard" }}
        locales="en-US"
        prefix=" "
        suffix=", "
      />
      <NumberFlow
        value={year}
        prefix=""
        format={{ useGrouping: false }}
        suffix={showTime ? " at " : ""}
      />
      {showTime && (
        <>
          <NumberFlow
            value={hour}        
            locales="en-US"
            prefix=""
            suffix=":"
          />
          <NumberFlow
            value={minute}
            format={{ notation: "standard" }}
            locales="en-US"
            prefix=""
          />
        </>
      )}
    </span>
  )
}