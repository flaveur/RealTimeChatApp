// app/lib/utils/id.ts

import { nanoid } from "nanoid";

export const createId = (): string => {
  return nanoid();
};
