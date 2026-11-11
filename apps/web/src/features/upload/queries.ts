import { serverConfig } from "@harmony/upload";

import { query } from "@/shared/lib/query";

export const serverConfigQuery = query("upload-config", serverConfig);
