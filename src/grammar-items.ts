import { NamedType, NamedValue, OptionalOrDefault, Type, Value } from "./types";

export type Item =
| { kind: "type"; value: Type }
| { kind: "value", value: Value }
| { kind: "identifier"; value: string }
| { kind: "number", value: number }
| { kind: "named type", value: NamedType }
| { kind: "named value", value: NamedValue }
| { kind: "optional or default", value: OptionalOrDefault}
| { kind: "atom", value: string }
| { kind: "mark" };