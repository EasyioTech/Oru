export const pgClient = {
  query: async <T = any>(...args: any[]) => ({ rows: [] as T[] }),
};
export const queryOne = async <T = any>(...args: any[]) => null as unknown as T;
export const queryMany = async <T = any>(...args: any[]) => [] as T[];
export const execute = async <T = any>(...args: any[]) => null as unknown as T;
