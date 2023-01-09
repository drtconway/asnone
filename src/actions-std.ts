import { apply, Lazy, State } from "./peg2";
import {
  asn1identifier,
  BitStringType,
  BitStringTypeIntroducer,
  BitStringValue,
  BooleanType,
  BooleanValue,
  bstring,
  BuiltinType,
  BuiltinValue,
  ChoiceType,
  ChoiceTypeIntroducer,
  ChoiceValue,
  cstring,
  DefaultComponentTypeQualifier,
  DefinedType,
  DefinedValue,
  encodingreference,
  EnumeratedType,
  EnumeratedTypeIntroducer,
  EnumeratedValue,
  EnumerationItem,
  ExternalTypeReference,
  ExternalValueReference,
  hstring,
  IdentifierListIntroducer,
  IntegerType,
  IntegerTypeIntroducer,
  IntegerValue,
  modulereference,
  NamedBit,
  NamedNumber,
  NamedNumberItem,
  NamedType,
  NamedValue,
  NegatedNumber,
  NegatedNumericRealValue,
  NullType,
  NullValue,
  number,
  NumberOrReference,
  NumericRealValue,
  OctetStringType,
  OctetStringValue,
  OptionalComponentTypeQualifier,
  psname,
  realnumber,
  RealType,
  RealValue,
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
  SpecialRealValue,
  tstring,
  TypeAssignment,
  typereference,
  ValueAssignment,
  valuereference,
} from "./grammar-std";
import { cons, pop1, pop2, pop3, Stack, toArray } from "./stack";
import type { NamedValue as NamedValueType, OptionalOrDefault, TagClass, TagPlicity, Type, Value } from "./types";

export type BitString = { length: number; bits: bigint };

export type AbstractType =
  | "NULL"
  | "BOOLEAN"
  | "REAL"
  | "OBJECT IDENTIFIER"
  | "OCTET STRING"
  | "EXTERNAL"
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

export type AbstractNamedType = { name: string; type: AbstractType; value?: OptionalOrDefault };

export type AbstractTaggedType = { class?: TagClass; value: number | string; plicity?: TagPlicity; type: AbstractType };

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
  | { kind: "ChoiceType"; value: AbstractNamedType[] };

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
      if (mItem.kind == "modulereference" && tItem.kind == "typereference") {
        state.stack = cons({ kind: "Type", value: { DEFINED: { module: mItem.value, name: tItem.value } } }, stk);
      } else {
        throw new Error(`internal error at ExternalTypeReference: [${mItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  apply(ExternalValueReference, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [mItem, vItem, stk] = pop2(state.stack);
      if (mItem.kind == "modulereference" && vItem.kind == "valuereference") {
        state.stack = cons({ kind: "Value", value: { DEFINED: { module: mItem.value, name: vItem.value } } }, stk);
      } else {
        throw new Error(`internal error at ExternalValueReference: [${mItem.kind}, ${vItem.kind}]`);
      }
    }
  });

  apply(DefinedType, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [item, stk] = pop1(state.stack);
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
      if (nItem.kind == "typereference" && tItem.kind == "Type") {
        state.stack = cons({ kind: "TypeAssignment", value: { name: nItem.value, type: tItem.value } }, stk);
      } else {
        throw new Error(`internal error at TypeAssignment: [${nItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  apply(ValueAssignment, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [nItem, vItem, stk] = pop2(state.stack);
      if (nItem.kind == "typereference" && vItem.kind == "Value") {
        state.stack = cons({ kind: "ValueAssignment", value: { name: nItem.value, value: vItem.value } }, stk);
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
      if (nItem.kind == "identifier" && tItem.kind == "Type") {
        state.stack = cons({ kind: "NamedType", value: { name: nItem.value, type: tItem.value } }, stk);
      } else {
        throw new Error(`internal error at NamedType: [${nItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  apply(NamedValue, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [nItem, tItem, stk] = pop2(state.stack);
      if (nItem.kind == "identifier" && tItem.kind == "Value") {
        state.stack = cons({ kind: "NamedValue", value: { name: nItem.value, value: tItem.value } }, stk);
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
      if (nItem.kind == "identifier" && vItem.kind == "Value") {
        const res: Item = { kind: "NamedValue", value: { name: nItem.value, value: vItem.value } };
        state.stack = cons(res, stk);
      } else {
        throw new Error(`internal error at NamedNumber: [${nItem.kind}, ${vItem.kind}]`);
      }
    }
  });

  apply(NamedNumberItem, (state: State, len: number, txt: Lazy<string>) => {
    if (state instanceof Asn1State) {
      const [iItem, nItem, stk] = pop2(state.stack);
      if (iItem.kind == "IntegerType" && nItem.kind == "NamedValue") {
        const res: Item = { kind: "IntegerType", value: [...iItem.value, nItem.value] };
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
      if (eItem.kind == "EnumeratedType" && nItem.kind == "NamedValue") {
        const res: Item = { kind: "EnumeratedType", value: [...eItem.value, nItem.value] };
        state.stack = cons(res, stk);
      } else if (eItem.kind == "EnumeratedType" && nItem.kind == "identifier") {
        const res: Item = { kind: "EnumeratedType", value: [...eItem.value, { name: nItem.value }] };
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
      if (item.kind == "identifier") {
        const res: Item = { kind: "Value", value: { DEFINED: { name: item.value } } };
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
      if (nItem.kind == "identifier" && vItem.kind == "Value") {
        const res: Item = { kind: "NamedValue", value: { name: nItem.value, value: vItem.value } };
        state.stack = cons(res, stk);
      } else if (nItem.kind == "identifier" && vItem.kind == "number") {
        const res: Item = { kind: "NamedValue", value: { name: nItem.value, value: { INTEGER: vItem.value } } };
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
        if (item.kind == "BitStringType") {
          bits.reverse();
          state.stack = cons({ kind: "BitStringType", value: bits }, stk);
          return;
        }
        if (item.kind == "NamedValue") {
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
      }
      if (item.kind == "hstring") {
        state.stack = cons({ kind: "BitStringValue", value: item.value }, stack);
        return;
      }
      const ids: string[] = [];
      while (true) {
        if (item.kind == "BitStringValue") {
          ids.reverse();
          state.stack = cons({ kind: "BitStringValue", value: ids }, stack);
          return;
        }
        if (item.kind == "identifier") {
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
        if (item.kind == "SequenceType") {
          components.reverse();
          state.stack = cons({ kind: "SequenceType", value: components }, stack);
          return;
        }
        if (item.kind == "NamedType") {
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
        if (item.kind == "SequenceValue") {
          components.reverse();
          state.stack = cons({ kind: "SequenceValue", value: components }, stack);
          return;
        }
        if (item.kind == "NamedValue") {
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
      if (item.kind == "Type") {
        state.stack = cons({ kind: "Type", value: { SEQUENCE_OF: { type: item.value } } }, stack);
      } else if (item.kind == "NamedType") {
        state.stack = cons({ kind: "Type", value: { SEQUENCE_OF: { name: item.value.name, type: item.value.type } } }, stack);
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
      if (item.kind == "SequenceOfValue") {
        return;
      } else if (item.kind == "Value") {
        const items: Value[] = [];
        while (true) {
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
        if (item.kind == "SetType") {
          components.reverse();
          state.stack = cons({ kind: "SetType", value: components }, stack);
          return;
        }
        if (item.kind == "NamedType") {
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
        if (item.kind == "SetValue") {
          components.reverse();
          state.stack = cons({ kind: "SetValue", value: components }, stack);
          return;
        }
        if (item.kind == "NamedValue") {
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
      if (item.kind == "Type") {
        state.stack = cons({ kind: "Type", value: { SET_OF: { type: item.value } } }, stack);
      } else if (item.kind == "NamedType") {
        state.stack = cons({ kind: "Type", value: { SET_OF: { name: item.value.name, type: item.value.type } } }, stack);
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
      if (item.kind == "SetOfValue") {
        return;
      } else if (item.kind == "Value") {
        const items: Value[] = [];
        while (true) {
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
        if (item.kind == "ChoiceType") {
          components.reverse();
          state.stack = cons({ kind: "ChoiceType", value: components }, stack);
          return;
        }
        if (item.kind == "NamedType") {
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
      if (iItem.kind == "identifier" && vItem.kind == "Value") {
        state.stack = cons({ kind: "Value", value: { CHOICE: { name: iItem.value, value: vItem.value } } }, stack);
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
      if (iItem.kind == "identifier" && tItem.kind == "Type") {
        state.stack = cons({ kind: "Type", value: { SELECTION: { name: iItem.value, type: tItem.value } } }, stack);
      } else {
        throw new Error(`internal error at ChoiceValue: [${iItem.kind}, ${tItem.kind}]`);
      }
    }
  });

  // Clause 31 Tags
  //
  
}
