import { nanoid } from "nanoid";

export function newTraceId(): string {
  return `trace_${nanoid(16)}`;
}
