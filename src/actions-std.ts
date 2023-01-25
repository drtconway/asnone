import { apply, Lazy, State } from "./peg2";
import {
  asn1identifier,
  AtomicCharacterString,
  BitStringType,
  BitStringTypeIntroducer,
  BitStringValue,
  BooleanType,
  BooleanValue,
  bstring,
  BuiltinType,
  BuiltinValue,
  CharacterStringList,
  CharacterStringListIntroducer,
  ChoiceType,
  ChoiceTypeIntroducer,
  ChoiceValue,
  cstring,
  DateTimeType,
  DateType,
  DefaultComponentTypeQualifier,
  DefinedType,
  DefinedValue,
  DurationType,
  EncodingReference,
  encodingreference,
  EnumeratedType,
  EnumeratedTypeIntroducer,
  EnumeratedValue,
  EnumerationItem,
  ExplicitTag,
  ExternalTypeReference,
  ExternalValueReference,
  hstring,
  IdentifierListIntroducer,
  ImplicitTag,
  IntegerType,
  IntegerTypeIntroducer,
  IntegerValue,
  LowerEndValueValue,
  LowerLess,
  modulereference,
  NameAndNumberForm,
  NamedBit,
  NamedNumber,
  NamedNumberItem,
  NamedType,
  NamedValue,
  NameForm,
  NegatedNumber,
  NegatedNumericRealValue,
  NullType,
  NullValue,
  number,
  NumberForm,
  NumberOrReference,
  NumericRealValue,
  ObjectIdentifierType,
  ObjectIdentifierValueIntroducer,
  OctetStringType,
  OctetStringValue,
  OptionalComponentTypeQualifier,
  psname,
  Quadruple,
  realnumber,
  RealType,
  RealValue,
  RestrictedCharacterStringType,
  SelectionType,
  SequenceOfType,
  SequenceOfValue,
  SequenceOfValueIntroducer,
  SequenceType,
  SequenceTypeIntroducer,
  SequenceValue,
  SequenceValueIntroducer,
  SetOfType,
  SetOfValue,
  SetOfValueIntroducer,
  SetType,
  SetTypeIntroducer,
  SetValue,
  SetValueIntroducer,
  SingleValue,
  SpecialRealValue,
  TagClass,
  TagClassNumber,
  TaggedType,
  TagIntroducer,
  TimeOfDayType,
  TimeType,
  tstring,
  Tuple,
  TypeAssignment,
  typereference,
  UnrestrictedCharacterStringType,
  UpperEndValueValue,
  UpperLess,
  ValueAssignment,
  ValueRange,
  ValueRangeIntroducer,
  valuereference,
} from "./grammar-std";
import { cons, pop1, pop2, pop3, pop4, Stack, toArray } from "./stack";
import type {
  CharacterStringComponent,
  NamedValue as NamedValueType,
  OidComponent,
  OptionalOrDefault,
  TagClass as TagClassType,
  TagPlicity,
  Type,
  Value,
} from "./types";

export type BitString = { length: number; bits: bigint };

export type AbstractType =
  | "NULL"
  | "BOOLEAN"
  | "REAL"
  | "OBJECT IDENTIFIER"
  | "OCTET STRING"
  | "EXTERNAL"
  | "TIME"
  | "DATE"
  | "TIME-OF-DAY"
  | "DATE-TIME"
  | "DURATION"
  | { INTEGER: NamedValueType[] }
  | { ENUMERATED: { name: string; value?: Value }[] }
  | { BIT_STRING: NamedValueType[] }
  | { SEQUENCE: AbstractNamedType[] }
  | { SEQUENCE_OF: { name?: string; type: AbstractType } }
  | { SET: AbstractNamedType[] }
  | { SET_OF: { name?: string; type: AbstractType } }
  | { CHOICE: AbstractNamedType[] }
  | { TAGGED: AbstractTaggedType }
  | { DEFINED: { module?: string; name: string } }
  | { SELECTION: { name: string; type: AbstractType } }
  | { String: string };

export type AbstractNamedType = {
  name: string;
  type: AbstractType;
  value?: OptionalOrDefault;
};

export type AbstractTaggedType = {
  class?: TagClassType;
  value: Value;
  plicity?: TagPlicity;
  type: AbstractType;
};

export type AbstractConstraint =
  | { kind: "Value"; value: Value }
  | { kind: "Union"; value: AbstractConstraint[] }
  | { kind: "Intersection"; value: AbstractConstraint[] }
  | { kind: "Except"; value: AbstractConstraint; except: AbstractConstraint }
  | { kind: "Range"; min: Value | "MIN"; minIncluded: boolean; max: Value | "MAX"; maxIncluded: boolean };

export type Item =
  | { kind: "typereference"; value: string }
  | { kind: "valuereference"; value: string }
  | { kind: "modulereference"; value: string }
  | { kind: "encodingreference"; value: string }
  | { kind: "identifier"; value: string }
  | { kind: "number"; value: bigint }
  | { kind: "realnumber"; value: number }
  | { kind: "bstring"; value: BitString }
  | { kind: "hstring"; value: BitString }
  | { kind: "cstring"; value: string }
  | { kind: "tstring"; value: string }
  | { kind: "psname"; value: string }
  | { kind: "Type"; value: AbstractType }
  | { kind: "Value"; value: Value }
  | { kind: "TypeAssignment"; value: { name: string; type: AbstractType } }
  | { kind: "ValueAssignment"; value: { name: string; value: Value } }
  | { kind: "NamedType"; value: AbstractNamedType }
  | { kind: "NamedValue"; value: NamedValueType }
  | { kind: "IntegerType"; value: NamedValueType[] }
  | { kind: "EnumeratedType"; value: { name: string; value?: Value }[] }
  | { kind: "BitStringType"; value: NamedValueType[] }
  | { kind: "BitStringValue"; value: BitString | string[] }
  | { kind: "SequenceType"; value: AbstractNamedType[] }
  | { kind: "SequenceValue"; value: NamedValueType[] }
  | { kind: "SequenceOfValue"; value: Value[] | NamedValueType[] }
  | { kind: "SetType"; value: AbstractNamedType[] }
  | { kind: "SetValue"; value: NamedValueType[] }
  | { kind: "SetOfValue"; value: Value[] | NamedValueType[] }
  | { kind: "ChoiceType"; value: AbstractNamedType[] }
  | { kind: "TaggedType"; value: AbstractTaggedType }
  | { kind: "OidValue"; value: OidComponent[] }
  | { kind: "CharacterStringList"; value: CharacterStringComponent[] }
  | { kind: "Unions"; value: AbstractConstraint[] }
  | { kind: "Intersections"; value: AbstractConstraint[] }
  | { kind: "Constraint"; value: AbstractConstraint }
  | { kind: "ValueRange"; min: Value | "MIN"; minIncluded: boolean; max: Value | "MAX"; maxIncluded: boolean };

export class Asn1State implements State {
  stack: Stack<Item>;

  constructor() {
    this.stack = [];
  }

  save(): any {
    return this.stack;
  }

  restore(saved: any): void {
    this.stack = saved as Stack<Item>;
  }
}

let applied: boolean = false;

export function actions(): void {
  if (applied == true) {
    return;
  }
  applied = true;

  console.log("Applying actions.");

  // Clause 12
  //

  apply(typereference, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "typereference", value: txt.get() }, state.stack);
    }
  });

  apply(valuereference, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "valuereference", value: txt.get() }, state.stack);
    }
  });

  apply(modulereference, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "modulereference", value: txt.get() }, state.stack);
    }
  });

  apply(encodingreference, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "encodingreference", value: txt.get() }, state.stack);
    }
  });

  apply(asn1identifier, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "identifier", value: txt.get() }, state.stack);
    }
  });

  apply(number, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "number", value: BigInt(txt.get()) }, state.stack);
    }
  });

  apply(realnumber, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "realnumber", value: Number(txt.get()) }, state.stack);
    }
  });

  apply(bstring, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let n: number = 0;
      let bits: bigint = 0n;
      const src = txt.get();
      for (let i = 0; i < src.length; ++i) {
        switch (src[i]) {
          case "0":
          case "1": {
            n += 1;
            bits = (bits << 1n) | BigInt(src[i]);
            break;
          }
        }
      }
      const res: BitString = { length: n, bits: bits };
      state.stack = cons({ kind: "bstring", value: res }, state.stack);
    }
  });

  const char_0 = "0".charCodeAt(0);
  const char_9 = "9".charCodeAt(0);
  const char_a = "a".charCodeAt(0);
  const char_f = "f".charCodeAt(0);
  const char_A = "A".charCodeAt(0);
  const char_F = "F".charCodeAt(0);
  apply(hstring, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let n: number = 0;
      let bits: bigint = 0n;
      const src = txt.get();
      for (let i = 0; i < src.length; ++i) {
        const c = src.charCodeAt(i);
        if (char_0 <= c && c <= char_9) {
          n += 4;
          bits = (bits << 4n) | BigInt(c - char_0);
        } else if (char_a <= c && c <= char_f) {
          n += 4;
          bits = (bits << 4n) | BigInt(c - char_a + 10);
        } else if (char_A <= c && c <= char_F) {
          n += 4;
          bits = (bits << 4n) | BigInt(c - char_A + 10);
        }
      }
      const res: BitString = { length: n, bits: bits };
      state.stack = cons({ kind: "hstring", value: res }, state.stack);
    }
  });

  apply(cstring, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let src = txt.get().slice(1, -1);
      src = src.replaceAll('""', '"');
      src = src.replaceAll(/[ \t\v\f\r\n]*\n[ \t\v\f\r\n]*/g, "");
      state.stack = cons({ kind: "cstring", value: src }, state.stack);
    }
  });

  apply(tstring, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const src = txt.get().slice(1, -1);
      state.stack = cons({ kind: "cstring", value: src }, state.stack);
    }
  });

  apply(psname, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "psname", value: txt.get() }, state.stack);
    }
  });

  // Clause 14
  //

  apply(ExternalTypeReference, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [mItem, tItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (mItem.kind == "modulereference" && tItem.kind == "typereference") {
        state.stack = cons(
          {
            kind: "Type",
            value: { DEFINED: { module: mItem.value, name: tItem.value } },
          },
          stk
        );
      } else {
        throw new Error(`internal error at ExternalTypeReference: [${mItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  apply(ExternalValueReference, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [mItem, vItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (mItem.kind == "modulereference" && vItem.kind == "valuereference") {
        state.stack = cons(
          {
            kind: "Value",
            value: { DEFINED: { module: mItem.value, name: vItem.value } },
          },
          stk
        );
      } else {
        throw new Error(`internal error at ExternalValueReference: [${mItem.kind}, ${vItem.kind}]`);
      }
    }
  });

  apply(DefinedType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "Type") {
        state.stack = cons(item, stk);
      } else if (item.kind == "typereference") {
        state.stack = cons({ kind: "Type", value: { DEFINED: { name: item.value } } }, stk);
      } else {
        throw new Error(`internal error at DefinedType: [${item.kind}]`);
      }
    }
  });

  apply(DefinedValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "Value") {
        state.stack = cons(item, stk);
      } else if (item.kind == "valuereference") {
        state.stack = cons({ kind: "Value", value: { DEFINED: { name: item.value } } }, stk);
      } else {
        throw new Error(`internal error at DefinedValue: [${item.kind}]`);
      }
    }
  });

  // Clause 16
  //

  apply(TypeAssignment, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [nItem, tItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (nItem.kind == "typereference" && tItem.kind == "Type") {
        state.stack = cons(
          {
            kind: "TypeAssignment",
            value: { name: nItem.value, type: tItem.value },
          },
          stk
        );
      } else {
        throw new Error(`internal error at TypeAssignment: [${nItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  apply(ValueAssignment, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [nItem, vItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (nItem.kind == "typereference" && vItem.kind == "Value") {
        state.stack = cons(
          {
            kind: "ValueAssignment",
            value: { name: nItem.value, value: vItem.value },
          },
          stk
        );
      } else {
        throw new Error(`internal error at TypeAssignment: [${nItem.kind}, ${vItem.kind}]`);
      }
    }
  });

  // Clause 17
  //

  apply(NamedType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [nItem, tItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (nItem.kind == "identifier" && tItem.kind == "Type") {
        state.stack = cons(
          {
            kind: "NamedType",
            value: { name: nItem.value, type: tItem.value },
          },
          stk
        );
      } else {
        throw new Error(`internal error at NamedType: [${nItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  apply(NamedValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [nItem, tItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (nItem.kind == "identifier" && tItem.kind == "Value") {
        state.stack = cons(
          {
            kind: "NamedValue",
            value: { name: nItem.value, value: tItem.value },
          },
          stk
        );
      } else {
        throw new Error(`internal error at NamedValue: [${nItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  apply(BuiltinType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      switch (item.kind) {
        case "IntegerType": {
          state.stack = cons({ kind: "Type", value: { INTEGER: item.value } }, stk);
          return;
        }
        case "EnumeratedType": {
          state.stack = cons({ kind: "Type", value: { ENUMERATED: item.value } }, stk);
          return;
        }
        case "BitStringType": {
          state.stack = cons({ kind: "Type", value: { BIT_STRING: item.value } }, stk);
          return;
        }
        case "SequenceType": {
          state.stack = cons({ kind: "Type", value: { SEQUENCE: item.value } }, stk);
          return;
        }
        case "SetType": {
          state.stack = cons({ kind: "Type", value: { SET: item.value } }, stk);
          return;
        }
        case "ChoiceType": {
          state.stack = cons({ kind: "Type", value: { CHOICE: item.value } }, stk);
          return;
        }
        case "Type": {
          // we're good!
          return;
        }
        default: {
          throw new Error(`internal error at BuiltinType: [${item.kind}]`);
        }
      }
    }
  });

  apply(BuiltinValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      switch (item.kind) {
        case "number": {
          state.stack = cons({ kind: "Value", value: { INTEGER: item.value } }, stk);
          return;
        }
        case "Value": {
          // we're good!
          return;
        }
        default: {
          throw new Error(`internal error at BuiltinType: [${item.kind}]`);
        }
      }
    }
  });
  // Clause 18 Booleans
  //

  apply(BooleanType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "BOOLEAN" }, state.stack);
    }
  });

  apply(BooleanValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const src = txt.get();
      let value: boolean;
      /* istanbul ignore else */
      if (src == "TRUE") {
        value = true;
      } else if (src == "FALSE") {
        value = false;
      } else {
        throw new Error(`internal error at BooleanValue: "${src}"`);
      }
      state.stack = cons({ kind: "Value", value: { BOOLEAN: value } }, state.stack);
    }
  });

  // Clause 19 Integers
  //

  apply(NegatedNumber, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "number") {
        state.stack = cons({ kind: "number", value: -item.value }, stk);
      } else {
        throw new Error(`internal error at NegatedNumber: [${item.kind}]`);
      }
    }
  });

  apply(NumberOrReference, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "number") {
        state.stack = cons({ kind: "Value", value: { INTEGER: item.value } }, stk);
      } else if (item.kind == "Value") {
        state.stack = cons(item, stk);
      } else {
        throw new Error(`internal error at NumberOrReference: [${item.kind}]`);
      }
    }
  });

  apply(NamedNumber, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [nItem, vItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (nItem.kind == "identifier" && vItem.kind == "Value") {
        const res: Item = {
          kind: "NamedValue",
          value: { name: nItem.value, value: vItem.value },
        };
        state.stack = cons(res, stk);
      } else {
        throw new Error(`internal error at NamedNumber: [${nItem.kind}, ${vItem.kind}]`);
      }
    }
  });

  apply(NamedNumberItem, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [iItem, nItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (iItem.kind == "IntegerType" && nItem.kind == "NamedValue") {
        const res: Item = {
          kind: "IntegerType",
          value: [...iItem.value, nItem.value],
        };
        state.stack = cons(res, stk);
      } else {
        throw new Error(`internal error at NamedNumberItem: [${iItem.kind}, ${nItem.kind}]`);
      }
    }
  });

  apply(IntegerTypeIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const res: Item = { kind: "IntegerType", value: [] };
      state.stack = cons(res, state.stack);
    }
  });

  apply(IntegerValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "number") {
        state.stack = cons({ kind: "Value", value: { INTEGER: item.value } }, stk);
      } else if (item.kind == "identifier") {
        state.stack = cons({ kind: "Value", value: { DEFINED: { name: item.value } } }, stk);
      } else {
        throw new Error(`internal error at IntegerValue: [${item.kind}]`);
      }
    }
  });

  // Clause 20: Enumerations

  apply(EnumerationItem, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [eItem, nItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (eItem.kind == "EnumeratedType" && nItem.kind == "NamedValue") {
        const res: Item = {
          kind: "EnumeratedType",
          value: [...eItem.value, nItem.value],
        };
        state.stack = cons(res, stk);
      } else if (eItem.kind == "EnumeratedType" && nItem.kind == "identifier") {
        const res: Item = {
          kind: "EnumeratedType",
          value: [...eItem.value, { name: nItem.value }],
        };
        state.stack = cons(res, stk);
      } else {
        throw new Error(`internal error at EnumerationItem: [${eItem.kind}, ${nItem.kind}]`);
      }
    }
  });

  apply(EnumeratedTypeIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const res: Item = { kind: "EnumeratedType", value: [] };
      state.stack = cons(res, state.stack);
    }
  });

  apply(EnumeratedValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "identifier") {
        const res: Item = {
          kind: "Value",
          value: { DEFINED: { name: item.value } },
        };
        state.stack = cons(res, state.stack);
      } else {
        throw new Error(`internal error at EnumeratedValue: [${item.kind}]`);
      }
    }
  });

  // Clause 21: REAL
  //

  apply(RealType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "REAL" }, state.stack);
    }
  });

  apply(NegatedNumericRealValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "realnumber") {
        state.stack = cons({ kind: "realnumber", value: -item.value }, stk);
      } else {
        throw new Error(`internal error at NegatedNumericRealValue: [${item.kind}]`);
      }
    }
  });

  apply(NumericRealValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "realnumber") {
        state.stack = cons({ kind: "Value", value: { REAL: item.value } }, stk);
      } else {
        throw new Error(`internal error at NumericRealValue: [${item.kind}]`);
      }
    }
  });

  apply(SpecialRealValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const src = txt.get();
      let val: number;
      /* istanbul ignore else */
      if (src == "PLUS-INFINITY") {
        val = Number.POSITIVE_INFINITY;
      } else if (src == "MINUS-INFINITY") {
        val = Number.NEGATIVE_INFINITY;
      } else if (src == "NOT-A-NUMBER") {
        val = NaN;
      } else {
        throw new Error(`internal error at SpecialRealValue: "${src}"`);
      }
      state.stack = cons({ kind: "Value", value: { REAL: val } }, state.stack);
    }
  });

  // Clause 22 Bitstrings
  //

  apply(NamedBit, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [nItem, vItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (nItem.kind == "identifier" && vItem.kind == "Value") {
        const res: Item = {
          kind: "NamedValue",
          value: { name: nItem.value, value: vItem.value },
        };
        state.stack = cons(res, stk);
      } else if (nItem.kind == "identifier" && vItem.kind == "number") {
        const res: Item = {
          kind: "NamedValue",
          value: { name: nItem.value, value: { INTEGER: vItem.value } },
        };
        state.stack = cons(res, stk);
      } else {
        throw new Error(`internal error at NamedBit: [${nItem.kind}, ${vItem.kind}]`);
      }
    }
  });

  apply(BitStringTypeIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "BitStringType", value: [] }, state.stack);
    }
  });

  apply(BitStringType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const bits: NamedValueType[] = [];
      let stack = state.stack;
      while (true) {
        const [item, stk] = pop1(stack);
        /* istanbul ignore else */
        if (item.kind == "BitStringType") {
          bits.reverse();
          state.stack = cons({ kind: "BitStringType", value: bits }, stk);
          return;
        } else if (item.kind == "NamedValue") {
          bits.push(item.value);
          stack = stk;
        } else {
          throw new Error(`internal error at BitStringType: [${item.kind}]`);
        }
      }
    }
  });

  apply(IdentifierListIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "BitStringValue", value: [] }, state.stack);
    }
  });

  apply(BitStringValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const bits: NamedValueType[] = [];
      let [item, stack] = pop1(state.stack);
      if (item.kind == "bstring") {
        state.stack = cons({ kind: "BitStringValue", value: item.value }, stack);
        return;
      } else if (item.kind == "hstring") {
        state.stack = cons({ kind: "BitStringValue", value: item.value }, stack);
        return;
      }
      const ids: string[] = [];
      while (true) {
        /* istanbul ignore else */
        if (item.kind == "BitStringValue") {
          ids.reverse();
          state.stack = cons({ kind: "BitStringValue", value: ids }, stack);
          return;
        } else if (item.kind == "identifier") {
          ids.push(item.value);
          [item, stack] = pop1(stack);
        } else {
          throw new Error(`internal error at BitStringValue: [${item.kind}]`);
        }
      }
    }
  });

  // Clause 23: OCTET STRING

  apply(OctetStringType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "OCTET STRING" }, state.stack);
    }
  });

  apply(OctetStringValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      let val: BitString;
      /* istanbul ignore else */
      if (item.kind == "bstring") {
        val = item.value;
      } else if (item.kind == "hstring") {
        val = item.value;
      } else {
        throw new Error(`internal error at NumericRealValue: [${item.kind}]`);
      }
      // Apply clauses 23.6 and 23.7
      const padded: BitString = { ...val };
      while (padded.length % 8 != 0) {
        padded.length += 1;
        padded.bits <<= 1n;
      }
      const octets: number[] = [];
      while (padded.length > 0) {
        octets.push(Number(padded.bits & 0xffn));
        padded.length -= 8;
        padded.bits >>= 8n;
      }
      octets.reverse();
      state.stack = cons({ kind: "Value", value: { OCTET_STRING: new Uint8Array(octets) } }, stk);
    }
  });

  // Clause 24: NULL

  apply(NullType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "NULL" }, state.stack);
    }
  });

  apply(NullValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Value", value: "NULL" }, state.stack);
    }
  });

  // Clause 25: Sequences

  apply(OptionalComponentTypeQualifier, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "NamedType") {
        const res: Item = { ...item };
        res.value.value = "OPTIONAL";
        state.stack = cons(res, stk);
      } else {
        throw new Error(`internal error at OptionalComponentTypeQualifier: [${item.kind}]`);
      }
    }
  });

  apply(DefaultComponentTypeQualifier, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, dItem, stk] = pop2(state.stack);
      /* istanbul ignore else */
      if (item.kind == "NamedType" && dItem.kind == "Value") {
        const res: Item = { ...item };
        res.value.value = { DEFAULT: dItem.value };
        state.stack = cons(res, stk);
      } else {
        console.log(toArray(state.stack));
        throw new Error(`internal error at DefaultComponentTypeQualifier: [${item.kind}, ${dItem.kind}]`);
      }
    }
  });

  apply(SequenceTypeIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "SequenceType", value: [] }, state.stack);
    }
  });

  apply(SequenceType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      const components: AbstractNamedType[] = [];
      while (true) {
        /* istanbul ignore else */
        if (item.kind == "SequenceType") {
          components.reverse();
          state.stack = cons({ kind: "SequenceType", value: components }, stack);
          return;
        } else if (item.kind == "NamedType") {
          components.push(item.value);
          [item, stack] = pop1(stack);
        } else {
          throw new Error(`internal error at SequenceType: [${item.kind}]`);
        }
      }
    }
  });

  apply(SequenceValueIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "SequenceValue", value: [] }, state.stack);
    }
  });

  apply(SequenceValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      const components: NamedValueType[] = [];
      while (true) {
        /* istanbul ignore else */
        if (item.kind == "SequenceValue") {
          components.reverse();
          state.stack = cons({ kind: "SequenceValue", value: components }, stack);
          return;
        } else if (item.kind == "NamedValue") {
          components.push(item.value);
          [item, stack] = pop1(stack);
        } else {
          throw new Error(`internal error at SequenceType: [${item.kind}]`);
        }
      }
    }
  });

  // Clause 26 SEQUENCE OF
  //

  apply(SequenceOfType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "Type") {
        state.stack = cons({ kind: "Type", value: { SEQUENCE_OF: { type: item.value } } }, stack);
      } else if (item.kind == "NamedType") {
        state.stack = cons(
          {
            kind: "Type",
            value: {
              SEQUENCE_OF: { name: item.value.name, type: item.value.type },
            },
          },
          stack
        );
      } else {
        throw new Error(`internal error at SequenceOfType: [${item.kind}]`);
      }
    }
  });

  apply(SequenceOfValueIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "SequenceOfValue", value: [] }, state.stack);
    }
  });

  apply(SequenceOfValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "SequenceOfValue") {
        return;
      } else if (item.kind == "Value") {
        const items: Value[] = [];
        while (true) {
          /* istanbul ignore else */
          if (item.kind == "SequenceOfValue") {
            items.reverse();
            state.stack = cons({ kind: "SequenceOfValue", value: items }, stack);
            return;
          } else if (item.kind == "Value") {
            items.push(item.value);
            [item, stack] = pop1(stack);
          } else {
            throw new Error(`internal error at SequenceOfValue (Value) [${item.kind}]`);
          }
        }
      } else if (item.kind == "NamedValue") {
        const items: NamedValueType[] = [];
        while (true) {
          /* istanbul ignore else */
          if (item.kind == "SequenceOfValue") {
            items.reverse();
            state.stack = cons({ kind: "SequenceOfValue", value: items }, stack);
            return;
          } else if (item.kind == "NamedValue") {
            items.push(item.value);
            [item, stack] = pop1(stack);
          } else {
            throw new Error(`internal error at SequenceOfValue (NamedValue) [${item.kind}]`);
          }
        }
      } else {
        throw new Error(`internal error at SequenceOfValue: [${item.kind}]`);
      }
    }
  });

  // Clause 27 SET
  //

  apply(SetTypeIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "SetType", value: [] }, state.stack);
    }
  });

  apply(SetType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      const components: AbstractNamedType[] = [];
      while (true) {
        /* istanbul ignore else */
        if (item.kind == "SetType") {
          components.reverse();
          state.stack = cons({ kind: "SetType", value: components }, stack);
          return;
        } else if (item.kind == "NamedType") {
          components.push(item.value);
          [item, stack] = pop1(stack);
        } else {
          throw new Error(`internal error at SetType: [${item.kind}]`);
        }
      }
    }
  });

  apply(SetValueIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "SetValue", value: [] }, state.stack);
    }
  });

  apply(SetValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      const components: NamedValueType[] = [];
      while (true) {
        if (item.kind == /* istanbul ignore else */ "SetValue") {
          components.reverse();
          state.stack = cons({ kind: "SetValue", value: components }, stack);
          return;
        } else if (item.kind == "NamedValue") {
          components.push(item.value);
          [item, stack] = pop1(stack);
        } else {
          throw new Error(`internal error at SetValue: [${item.kind}]`);
        }
      }
    }
  });

  // Clause 28 SET OF
  //

  apply(SetOfType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "Type") {
        state.stack = cons({ kind: "Type", value: { SET_OF: { type: item.value } } }, stack);
      } else if (item.kind == "NamedType") {
        state.stack = cons(
          {
            kind: "Type",
            value: { SET_OF: { name: item.value.name, type: item.value.type } },
          },
          stack
        );
      } else {
        throw new Error(`internal error at SetOfType: [${item.kind}]`);
      }
    }
  });

  apply(SetOfValueIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "SetOfValue", value: [] }, state.stack);
    }
  });

  apply(SetOfValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (item.kind == "SetOfValue") {
        return;
      } else if (item.kind == "Value") {
        const items: Value[] = [];
        while (true) {
          /* istanbul ignore else */
          if (item.kind == "SetOfValue") {
            items.reverse();
            state.stack = cons({ kind: "SetOfValue", value: items }, stack);
            return;
          } else if (item.kind == "Value") {
            items.push(item.value);
            [item, stack] = pop1(stack);
          } else {
            throw new Error(`internal error at SetOfValue (Value) [${item.kind}]`);
          }
        }
      } else if (item.kind == "NamedValue") {
        const items: NamedValueType[] = [];
        while (true) {
          /* istanbul ignore else */
          if (item.kind == "SetOfValue") {
            items.reverse();
            state.stack = cons({ kind: "SetOfValue", value: items }, stack);
            return;
          } else if (item.kind == "NamedValue") {
            items.push(item.value);
            [item, stack] = pop1(stack);
          } else {
            throw new Error(`internal error at SetOfValue (NamedValue) [${item.kind}]`);
          }
        }
      } else {
        throw new Error(`internal error at SetOfValue: [${item.kind}]`);
      }
    }
  });

  // Clause 29 CHOICE
  //

  apply(ChoiceTypeIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "ChoiceType", value: [] }, state.stack);
    }
  });

  apply(ChoiceType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      const components: AbstractNamedType[] = [];
      while (true) {
        /* istanbul ignore else */
        if (item.kind == "ChoiceType") {
          components.reverse();
          state.stack = cons({ kind: "ChoiceType", value: components }, stack);
          return;
        } else if (item.kind == "NamedType") {
          components.push(item.value);
          [item, stack] = pop1(stack);
        } else {
          throw new Error(`internal error at ChoiceType: [${item.kind}]`);
        }
      }
    }
  });

  apply(ChoiceValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [iItem, vItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (iItem.kind == "identifier" && vItem.kind == "Value") {
        state.stack = cons(
          {
            kind: "Value",
            value: { CHOICE: { name: iItem.value, value: vItem.value } },
          },
          stack
        );
      } else {
        throw new Error(`internal error at ChoiceValue: [${iItem.kind}, ${vItem.kind}]`);
      }
    }
  });

  // Clause 30 Selection types
  //

  apply(SelectionType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [iItem, tItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (iItem.kind == "identifier" && tItem.kind == "Type") {
        state.stack = cons(
          {
            kind: "Type",
            value: { SELECTION: { name: iItem.value, type: tItem.value } },
          },
          stack
        );
      } else {
        throw new Error(`internal error at ChoiceValue: [${iItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  // Clause 31 Tags
  //

  apply(TagIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "TaggedType", value: { value: "NULL", type: "NULL" } }, state.stack);
    }
  });

  apply(TagClassNumber, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [tItem, cItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (tItem.kind == "TaggedType" && cItem.kind == "number") {
        const t: AbstractTaggedType = {
          ...tItem.value,
          value: { INTEGER: cItem.value },
        };
        state.stack = cons({ kind: "TaggedType", value: t }, stack);
      } else if (tItem.kind == "TaggedType" && cItem.kind == "Value") {
        const t: AbstractTaggedType = {
          ...tItem.value,
          value: cItem.value,
        };
        state.stack = cons({ kind: "TaggedType", value: t }, stack);
      } else {
        throw new Error(`internal error at TagClassNumber: [${tItem.kind}, ${cItem.kind}]`);
      }
    }
  });

  apply(TagClass, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [tItem, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (tItem.kind == "TaggedType") {
        const t: AbstractTaggedType = {
          ...tItem.value,
        };
        const src = txt.get();
        switch (src) {
          case "UNIVERSAL":
          case "APPLICATION":
          case "PRIVATE": {
            t.class = src;
            break;
          }
          default: {
            throw new Error(`internal error at TagClass (1): [${tItem.kind}, "${txt.get()}"]`);
          }
        }
        state.stack = cons({ kind: "TaggedType", value: t }, stack);
      } else {
        throw new Error(`internal error at TagClass (2): [${tItem.kind}, "${txt.get()}"]`);
      }
    }
  });

  // EncodingRegerence ignored.

  apply(ExplicitTag, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [tItem, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (tItem.kind == "TaggedType") {
        const t: AbstractTaggedType = {
          ...tItem.value,
          plicity: "EXPLICIT",
        };
        state.stack = cons({ kind: "TaggedType", value: t }, stack);
      } else {
        throw new Error(`internal error at ExplicitTag: [${tItem.kind}]`);
      }
    }
  });

  apply(ImplicitTag, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [tItem, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (tItem.kind == "TaggedType") {
        const t: AbstractTaggedType = {
          ...tItem.value,
          plicity: "IMPLICIT",
        };
        state.stack = cons({ kind: "TaggedType", value: t }, stack);
      } else {
        throw new Error(`internal error at ImplicitTag: [${tItem.kind}]`);
      }
    }
  });

  apply(TaggedType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [tItem, uItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (tItem.kind == "TaggedType" && uItem.kind == "Type") {
        const t: AbstractTaggedType = {
          ...tItem.value,
          type: uItem.value,
        };
        state.stack = cons({ kind: "TaggedType", value: t }, stack);
      } else {
        throw new Error(`internal error at TaggedType: [${tItem.kind}, ${uItem.kind}]`);
      }
    }
  });

  // Clause 32 Object Identifiers

  apply(ObjectIdentifierType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "OBJECT IDENTIFIER" }, state.stack);
    }
  });

  apply(ObjectIdentifierValueIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "OidValue", value: [] }, state.stack);
    }
  });

  apply(NameAndNumberForm, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [oItem, iItem, nItem, stack] = pop3(state.stack);
      /* istanbul ignore else */
      if (oItem.kind == "OidValue" && iItem.kind == "identifier" && nItem.kind == "number") {
        state.stack = cons({ kind: "OidValue", value: [...oItem.value, [iItem.value, nItem.value]] }, stack);
      } else {
        throw new Error(`internal error at TaggedType: [${oItem.kind}, ${iItem.kind}, ${nItem.kind}]`);
      }
    }
  });

  apply(NumberForm, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [oItem, nItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (oItem.kind == "OidValue" && nItem.kind == "number") {
        state.stack = cons({ kind: "OidValue", value: [...oItem.value, nItem.value] }, stack);
      } else {
        console.log(toArray(state.stack));
        throw new Error(`internal error at TaggedType: [${oItem.kind}, ${nItem.kind}]`);
      }
    }
  });

  apply(NameForm, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [oItem, iItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (oItem.kind == "OidValue" && iItem.kind == "identifier") {
        state.stack = cons({ kind: "OidValue", value: [...oItem.value, iItem.value] }, stack);
      } else {
        throw new Error(`internal error at TaggedType: [${oItem.kind}, ${iItem.kind},]`);
      }
    }
  });

  // Clause 38 Time & Date
  //

  apply(TimeType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "TIME" }, state.stack);
    }
  });

  apply(DateType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "DATE" }, state.stack);
    }
  });

  apply(TimeOfDayType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "TIME-OF-DAY" }, state.stack);
    }
  });

  apply(DateTimeType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "DATE-TIME" }, state.stack);
    }
  });

  apply(DurationType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: "DURATION" }, state.stack);
    }
  });

  // Clause 39, 40, 41, 42, 43, 44
  //

  apply(RestrictedCharacterStringType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: { String: txt.get() } }, state.stack);
    }
  });

  apply(UnrestrictedCharacterStringType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "Type", value: { String: "" } }, state.stack);
    }
  });

  apply(Tuple, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [cItem, rItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (cItem.kind == "number" && rItem.kind == "number") {
        const col: bigint = cItem.value;
        const row: bigint = rItem.value;
        state.stack = cons({ kind: "Value", value: { CHARACTER_STRING: { tuple: [col, row] } } }, stack);
      } else {
        throw new Error(`internal error at Tuple: [${cItem.kind}, ${rItem.kind}]`);
      }
    }
  });

  apply(Quadruple, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [gItem, pItem, rItem, cItem, stack] = pop4(state.stack);
      /* istanbul ignore else */
      if (gItem.kind == "number" && pItem.kind == "number" && rItem.kind == "number" && cItem.kind == "number") {
        const group: bigint = gItem.value;
        const plane: bigint = pItem.value;
        const row: bigint = rItem.value;
        const cell: bigint = cItem.value;
        state.stack = cons({ kind: "Value", value: { CHARACTER_STRING: { quad: [group, plane, row, cell] } } }, stack);
      } else {
        throw new Error(`internal error at Tuple: [${cItem.kind}, ${rItem.kind}]`);
      }
    }
  });

  apply(AtomicCharacterString, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [cItem, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (cItem.kind == "cstring") {
        state.stack = cons({ kind: "Value", value: { CHARACTER_STRING: { atom: cItem.value } } }, stack);
      } else {
        throw new Error(`internal error at Tuple: [${cItem.kind}]`);
      }
    }
  });

  apply(CharacterStringListIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "CharacterStringList", value: [] }, state.stack);
    }
  });

  apply(CharacterStringList, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [item, stack] = pop1(state.stack);
      const components: CharacterStringComponent[] = [];
      while (true) {
        /* istanbul ignore else */
        if (item.kind == "CharacterStringList") {
          components.reverse();
          state.stack = cons({ kind: "CharacterStringList", value: components }, stack);
          return;
        } else if (item.kind == "Value" && typeof item.value == "object" && "CHARACTER_STRING" in item.value) {
          components.push(item.value.CHARACTER_STRING);
          [item, stack] = pop1(stack);
        } else {
          throw new Error(`internal error at CharacterStringList: [${item.kind}]`);
        }
      }
    }
  });

  // Clauses 49-51 Constraints

  apply(SingleValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [vItem, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (vItem.kind == "Value") {
        state.stack = cons({ kind: "Constraint", value: { kind: "Value", value: vItem.value } }, stack);
      } else {
        throw new Error(`internal error at SingleValue: [${vItem.kind}]`);
      }
    }
  });

  apply(ValueRangeIntroducer, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      state.stack = cons({ kind: "ValueRange", min: "MIN", minIncluded: true, max: "MAX", maxIncluded: true }, state.stack);
    }
  });

  apply(LowerEndValueValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [rItem, vItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (rItem.kind == "ValueRange" && vItem.kind == "Value") {
        state.stack = cons({ ...rItem, min: vItem.value }, stack);
      } else {
        throw new Error(`internal error at LowerEndValueValue: [${vItem.kind}]`);
      }
    }
  });

  apply(UpperEndValueValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [rItem, vItem, stack] = pop2(state.stack);
      /* istanbul ignore else */
      if (rItem.kind == "ValueRange" && vItem.kind == "Value") {
        state.stack = cons({ ...rItem, max: vItem.value }, stack);
      } else {
        throw new Error(`internal error at UpperEndValueValue: [${vItem.kind}]`);
      }
    }
  });

  apply(LowerLess, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [rItem, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (rItem.kind == "ValueRange") {
        state.stack = cons({ ...rItem, minIncluded: false }, stack);
      } else {
        throw new Error(`internal error at LowerLess: [${rItem.kind}]`);
      }
    }
  });

  apply(UpperLess, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [rItem, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (rItem.kind == "ValueRange") {
        state.stack = cons({ ...rItem, maxIncluded: false }, stack);
      } else {
        throw new Error(`internal error at UpperLess: [${rItem.kind}]`);
      }
    }
  });

  apply(ValueRange, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      let [rItem, stack] = pop1(state.stack);
      /* istanbul ignore else */
      if (rItem.kind == "ValueRange") {
        state.stack = cons(
          {
            kind: "Constraint",
            value: {
              kind: "Range",
              min: rItem.min,
              minIncluded: rItem.minIncluded,
              max: rItem.max,
              maxIncluded: rItem.maxIncluded,
            },
          },
          stack
        );
      } else {
        throw new Error(`internal error at ValueRange: [${rItem.kind}]`);
      }
    }
  });
}
