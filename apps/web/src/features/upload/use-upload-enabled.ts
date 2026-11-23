import { useQuery } from "@tanstack/react-query";

import { serverConfigQuery } from "./queries";

export const useUploadEnabled = () => {
  const { data } = useQuery(serverConfigQuery());
  return data?.uploadEnabled !== false;
};
