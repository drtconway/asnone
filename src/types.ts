export type Type =
  | "NULL"
  | "BOOLEAN"
  | "REAL"
  | "OBJECT IDENTIFIER"
  | "OCTET STRING"
  | "EXTERNAL"
  | { INTEGER: [string, bigint][] }
  | { ENUMERATED: [string, bigint][] }
  | { BIT_STRING: [string, bigint][] }
  | { SEQUENCE: NamedType[] }
  | { SEQUENCE_OF: Type }
  | { SET: NamedType[] }
  | { SET_OF: Type }
  | { CHOICE: NamedType[] }
  | { TAGGED: TaggedType }
  | { DEFINED: { module?: string; name: string } }
  | { String: string }
  | { SELECTION: { name: string; type: Type } };

export type Value =
  | "NULL"
  | { BOOLEAN: boolean }
  | { OCTET_STRING: Uint8Array }
  | { INTEGER: bigint }
  | { REAL: number }
  | { BIT_STRING: bigint }
  | { DEFINED: { module?: string; name: string } }
  | { CHOICE: { name: string; value: Value } }
  | { OBJECT_IDENTIFIER: OidComponent[] }
  | { CHARACTER_STRING: CharacterStringComponent };

export type TagClass = "UNIVERSAL" | "APPLICATION" | "PRIVATE";
export type TagPlicity = "EXPLICIT" | "IMPLICIT";
export type TaggedType = {
  class?: TagClass;
  value: number;
  plicity?: TagPlicity;
  type: Type;
};

export type NamedType = { name: string; type: Type; value?: OptionalOrDefault };
export type NamedValue = { name: string; value: Value };
export type OptionalOrDefault = "OPTIONAL" | { DEFAULT: Value };

export type OidComponent = string | bigint | [string, bigint];

export type CharacterStringComponent =
  | { atom: string }
  | { tuple: [bigint, bigint] }
  | { quad: [bigint, bigint, bigint, bigint] }
  | { group: CharacterStringComponent[] };
