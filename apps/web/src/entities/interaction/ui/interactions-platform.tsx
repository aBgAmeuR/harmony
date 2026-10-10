import {
  AndroidIcon,
  AppleIcon,
  ComputerIcon,
  Icon,
  LaptopIcon,
  MoreHorizontalIcon,
  UnavailableIcon,
  WindowsOldIcon,
} from "@harmony/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";

type InteractionsPlatformProps = {
  platform?: "web_player" | "android" | "ios" | "linux" | "windows" | "not_applicable" | "other";
};

export const InteractionsPlatform = ({
  platform = "not_applicable",
}: InteractionsPlatformProps) => {
  const icon = platformIconMap[platform];
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1).replace("_", " ");

  return (
    <Tooltip>
      <TooltipTrigger render={<Icon icon={icon} />} />
      <TooltipContent>
        <p>{platformName}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const platformIconMap = {
  web_player: LaptopIcon,
  android: AndroidIcon,
  ios: AppleIcon,
  linux: ComputerIcon,
  windows: WindowsOldIcon,
  not_applicable: UnavailableIcon,
  other: MoreHorizontalIcon,
};
