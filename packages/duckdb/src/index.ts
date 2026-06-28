import { useDbStore } from "./store";

export const db = {
  async init(packageId: string) {
    return await useDbStore.getState().initialize(packageId);
  },
  async query<T>(query: string): Promise<T[]> {
    const conn = useDbStore.getState().conn;
    if (!conn) {
      throw new Error("Database not initialized");
    }
    return (await conn.query(query)).toArray() as T[];
  },
  status: () => useDbStore.getState().status,
};
