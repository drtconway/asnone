import {
  Asn1Separators,
  BitStringType,
  BitStringValue,
  bstring,
  ChoiceType,
  ChoiceValue,
  cstring,
  DefinedType,
  DefinedValue,
  EnumeratedType,
  ExternalTypeReference,
  ExternalValueReference,
  hstring,
  IntegerType,
  modulereference,
  number,
  OctetStringType,
  OctetStringValue,
  realnumber,
  RealType,
  RealValue,
  SequenceOfType,
  SequenceOfValue,
  SequenceType,
  SetOfType,
  SetOfValue,
  SetType,
  Type,
  typereference,
  Value,
  valuereference,
} from "./../src/grammar-std";
import { actions, Asn1State, Item } from "./../src/actions-std";

import * as mocha from "mocha";
import * as chai from "chai";
import { toArray } from "../src/stack";
import { Parser } from "../src/peg2";

const expect = chai.expect;

function oneItem(state: Asn1State): Item {
  const stk = toArray(state.stack);
  if (stk.length != 1) {
    console.log(stk);
  }
  expect(stk.length).to.eql(1);
  return stk[0];
}

actions();

describe("Clause 12: Lexical Items", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("get a typereference", () => {
    const S = new Asn1State();
    expect(P.parse(typereference, "ThisIsAType", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "typereference", value: "ThisIsAType" });
  });
  it("get a valuereference", () => {
    const S = new Asn1State();
    expect(P.parse(valuereference, "thisIsAValue", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "valuereference", value: "thisIsAValue" });
  });
  it("get a modulereference", () => {
    const S = new Asn1State();
    expect(P.parse(modulereference, "ThisIsAModule", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "modulereference", value: "ThisIsAModule" });
  });
  it("get a number", () => {
    const S = new Asn1State();
    expect(P.parse(number, "123456", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "number", value: 123456n });
  });
  it("get a realnumber", () => {
    const S = new Asn1State();
    expect(P.parse(realnumber, "123456.789", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "realnumber", value: 123456.789 });
  });
  it("get a bstring", () => {
    const S = new Asn1State();
    expect(P.parse(bstring, "'1 00 10 01'B", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "bstring", value: { length: 7, bits: 73n } });
  });
  it("get an hstring", () => {
    const S = new Asn1State();
    expect(P.parse(hstring, "'DEAD BEEF'H", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "hstring", value: { length: 32, bits: 3735928559n } });
  });
  describe("get some cstrings", () => {
    it("an empty cstring", () => {
      const S = new Asn1State();
      expect(P.parse(cstring, '""', { state: S })).to.be.true;
      expect(oneItem(S)).to.eql({ kind: "cstring", value: "" });
    });
    it("an elementary cstring", () => {
      const S = new Asn1State();
      expect(P.parse(cstring, '"ABC"', { state: S })).to.be.true;
      expect(oneItem(S)).to.eql({ kind: "cstring", value: "ABC" });
    });
    it("a cstring containing double quotes", () => {
      const S = new Asn1State();
      expect(P.parse(cstring, '"A""B"', { state: S })).to.be.true;
      expect(oneItem(S)).to.eql({ kind: "cstring", value: 'A"B' });
    });
    it("a cstring containing combining characters", () => {
      const S = new Asn1State();
      expect(P.parse(cstring, '"chữ Quốc ngữ"', { state: S })).to.be.true;
      expect(oneItem(S)).to.eql({ kind: "cstring", value: "chữ Quốc ngữ" });
    });
    it("a cstring containing CJK ideographs", () => {
      const S = new Asn1State();
      expect(P.parse(cstring, '"有朋自遠方來，不亦樂乎"', { state: S })).to.be.true;
      expect(oneItem(S)).to.eql({ kind: "cstring", value: "有朋自遠方來，不亦樂乎" });
    });
    it("a cstring containing internal newlines", () => {
      const S = new Asn1State();
      expect(P.parse(cstring, '"ABCDE\tFGH \n\tIJK""XYZ"', { state: S })).to.be.true;
      expect(oneItem(S)).to.eql({ kind: "cstring", value: 'ABCDE\tFGHIJK"XYZ' });
    });
  });
});

describe("Clause 14: type and value references", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("ExternalTypeReference", () => {
    const S = new Asn1State();
    expect(P.parse(ExternalTypeReference, "ASN1-CHARACTER-MODULE.BasicLatin", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "Type", value: { DEFINED: { module: "ASN1-CHARACTER-MODULE", name: "BasicLatin" } } });
  });

  it("DefinedType (1)", () => {
    const S = new Asn1State();
    expect(P.parse(DefinedType, "ASN1-CHARACTER-MODULE.BasicLatin", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "Type", value: { DEFINED: { module: "ASN1-CHARACTER-MODULE", name: "BasicLatin" } } });
  });
  it("DefinedType (2)", () => {
    const S = new Asn1State();
    expect(P.parse(DefinedType, "BasicLatin", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "Type", value: { DEFINED: { name: "BasicLatin" } } });
  });

  it("ExternalValueReference", () => {
    const S = new Asn1State();
    expect(P.parse(ExternalValueReference, "ASN1-CHARACTER-MODULE.greekCapitalLetterSigma", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { DEFINED: { module: "ASN1-CHARACTER-MODULE", name: "greekCapitalLetterSigma" } },
    });
  });

  it("DefinedValue (1)", () => {
    const S = new Asn1State();
    expect(P.parse(DefinedValue, "ASN1-CHARACTER-MODULE.greekCapitalLetterSigma", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { DEFINED: { module: "ASN1-CHARACTER-MODULE", name: "greekCapitalLetterSigma" } },
    });
  });
  it("DefinedValue (2)", () => {
    const S = new Asn1State();
    expect(P.parse(DefinedValue, "greekCapitalLetterSigma", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "Value", value: { DEFINED: { name: "greekCapitalLetterSigma" } } });
  });
});

describe("Clause 17: Types & Values", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("INTEGER type", () => {
    const S = new Asn1State();
    expect(P.parse(Type, "INTEGER", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "Type", value: { INTEGER: [] } });
  });

  it("INTEGER value", () => {
    const S = new Asn1State();
    expect(P.parse(Value, "42", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "Value", value: { INTEGER: 42n } });
  });
});

describe("Clause 19: Integers", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("simple INTEGER type", () => {
    const S = new Asn1State();
    expect(P.parse(IntegerType, "INTEGER", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({ kind: "IntegerType", value: [] });
  });

  it("INTEGER type with specified values (2)", () => {
    const S = new Asn1State();
    expect(P.parse(IntegerType, "INTEGER { a(1), b(2), c(qux) }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "IntegerType",
      value: [
        { name: "a", value: { INTEGER: 1n } },
        { name: "b", value: { INTEGER: 2n } },
        { name: "c", value: { DEFINED: { name: "qux" } } },
      ],
    });
  });
});

describe("Clause 20: Enumerations", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("simple enumerated type", () => {
    const S = new Asn1State();
    expect(P.parse(EnumeratedType, "ENUMERATED { a, b, c }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "EnumeratedType",
      value: [{ name: "a" }, { name: "b" }, { name: "c" }],
    });
  });

  it("rich enumerated type", () => {
    const S = new Asn1State();
    expect(P.parse(EnumeratedType, "ENUMERATED { a, b(6), d(9), j(x) }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "EnumeratedType",
      value: [
        { name: "a" },
        { name: "b", value: { INTEGER: 6n } },
        { name: "d", value: { INTEGER: 9n } },
        { name: "j", value: { DEFINED: { name: "x" } } },
      ],
    });
  });
});

describe("Clause 21: Reals", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("REAL type", () => {
    const S = new Asn1State();
    expect(P.parse(RealType, "REAL", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Type",
      value: "REAL",
    });
  });

  it("Some ordinary REAL values", () => {
    const values: string[] = [
      "0",
      "1.23",
      "-1.23",
      "1.23E34",
      "1.23E-34",
      "-1.23E34",
      "-1.23E-34",
      "1.000000000000000000000000000000000000000000000000000",
    ];
    for (const txt of values) {
      const S = new Asn1State();
      expect(P.parse(RealValue, txt, { state: S })).to.be.true;
      expect(oneItem(S)).to.eql({
        kind: "Value",
        value: { REAL: Number(txt) },
      });
    }
  });

  it("special REAL values (+INF)", () => {
    const S = new Asn1State();
    expect(P.parse(RealValue, "PLUS-INFINITY", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { REAL: Number.POSITIVE_INFINITY },
    });
  });

  it("special REAL values (-INF)", () => {
    const S = new Asn1State();
    expect(P.parse(RealValue, "MINUS-INFINITY", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { REAL: Number.NEGATIVE_INFINITY },
    });
  });

  it("special REAL values (NAN)", () => {
    const S = new Asn1State();
    expect(P.parse(RealValue, "NOT-A-NUMBER", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { REAL: NaN },
    });
  });
});

describe("Clause 22: bit strings", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("basic BIT STRING type", () => {
    const S = new Asn1State();
    expect(P.parse(BitStringType, "BIT STRING", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "BitStringType",
      value: [],
    });
  });

  it("BIT STRING type with named bits", () => {
    const S = new Asn1State();
    expect(P.parse(BitStringType, "BIT STRING { a(2), b(3), c(x) }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "BitStringType",
      value: [
        { name: "a", value: { INTEGER: 2n } },
        { name: "b", value: { INTEGER: 3n } },
        { name: "c", value: { DEFINED: { name: "x" } } },
      ],
    });
  });

  it("bstring BIT STRING value", () => {
    const S = new Asn1State();
    expect(P.parse(BitStringValue, "'10011001'B", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "BitStringValue",
      value: { length: 8, bits: 153n },
    });
  });

  it("hstring BIT STRING value", () => {
    const S = new Asn1State();
    expect(P.parse(BitStringValue, "'10011001'H", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "BitStringValue",
      value: { length: 32, bits: 268505089n },
    });
  });

  it("identifier list BIT STRING value (1) ", () => {
    const S = new Asn1State();
    expect(P.parse(BitStringValue, "{}", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "BitStringValue",
      value: [],
    });
  });

  it("identifier list BIT STRING value (2) ", () => {
    const S = new Asn1State();
    expect(P.parse(BitStringValue, "{ a, b, c }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "BitStringValue",
      value: ["a", "b", "c"],
    });
  });
});

describe("Clause 23: OCTET STRING", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("OCTET STRING type", () => {
    const S = new Asn1State();
    expect(P.parse(OctetStringType, "OCTET STRING", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Type",
      value: "OCTET STRING",
    });
  });

  it("OCTET STRING bstring - no padding", () => {
    const S = new Asn1State();
    expect(P.parse(OctetStringValue, "'00000001000000101000000011111111'B", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { OCTET_STRING: new Uint8Array([1, 2, 128, 255]) },
    });
  });

  it("OCTET STRING bstring - with padding", () => {
    const S = new Asn1State();
    expect(P.parse(OctetStringValue, "'000000010000001010000000111111'B", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { OCTET_STRING: new Uint8Array([1, 2, 128, 252]) },
    });
  });

  it("OCTET STRING hstring - no padding", () => {
    const S = new Asn1State();
    expect(P.parse(OctetStringValue, "'DEADBEEF'H", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { OCTET_STRING: new Uint8Array([222, 173, 190, 239]) },
    });
  });

  it("OCTET STRING hstring - with padding", () => {
    const S = new Asn1State();
    expect(P.parse(OctetStringValue, "'DEADBEE'H", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { OCTET_STRING: new Uint8Array([222, 173, 190, 224]) },
    });
  });
});

describe("Clause 25: SEQUENCE", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("simple SEQUENCE type", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceType, "SEQUENCE { a INTEGER, b OCTET STRING }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SequenceType",
      value: [
        { name: "a", type: { INTEGER: [] } },
        { name: "b", type: "OCTET STRING" },
      ],
    });
  });

  it("SEQUENCE type with OPTIONAL", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceType, "SEQUENCE { a INTEGER OPTIONAL, b OCTET STRING }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SequenceType",
      value: [
        { name: "a", type: { INTEGER: [] }, value: "OPTIONAL" },
        { name: "b", type: "OCTET STRING" },
      ],
    });
  });

  it("SEQUENCE type with DEFAULT", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceType, "SEQUENCE { a INTEGER DEFAULT 42, b OCTET STRING }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SequenceType",
      value: [
        { name: "a", type: { INTEGER: [] }, value: { DEFAULT: { INTEGER: 42n } } },
        { name: "b", type: "OCTET STRING" },
      ],
    });
  });

  it("nested SEQUENCE types", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceType, "SEQUENCE { a INTEGER, b SEQUENCE { a INTEGER, b BOOLEAN } }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SequenceType",
      value: [
        { name: "a", type: { INTEGER: [] } },
        {
          name: "b",
          type: {
            SEQUENCE: [
              { name: "a", type: { INTEGER: [] } },
              { name: "b", type: "BOOLEAN" },
            ],
          },
        },
      ],
    });
  });
});

describe("Clause 26: SEQUENCE OF", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("unnamed SEQUENCE OF type", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceOfType, "SEQUENCE OF INTEGER", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Type",
      value: { SEQUENCE_OF: { type: { INTEGER: [] } } },
    });
  });

  it("named SEQUENCE OF type", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceOfType, "SEQUENCE OF x INTEGER", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Type",
      value: { SEQUENCE_OF: { name: "x", type: { INTEGER: [] } } },
    });
  });

  it("empty SEQUENCE OF value", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceOfValue, "{}", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SequenceOfValue",
      value: [],
    });
  });

  it("unnamed SEQUENCE OF value", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceOfValue, "{1, 2, 3}", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SequenceOfValue",
      value: [{ INTEGER: 1n }, { INTEGER: 2n }, { INTEGER: 3n }],
    });
  });

  it("named SEQUENCE OF value", () => {
    const S = new Asn1State();
    expect(P.parse(SequenceOfValue, "{x 1, x 2, x 3}", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SequenceOfValue",
      value: [
        { name: "x", value: { INTEGER: 1n } },
        { name: "x", value: { INTEGER: 2n } },
        { name: "x", value: { INTEGER: 3n } },
      ],
    });
  });
});

describe("Clause 27: SET", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("simple SET type", () => {
    const S = new Asn1State();
    expect(P.parse(SetType, "SET { a INTEGER, b OCTET STRING }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SetType",
      value: [
        { name: "a", type: { INTEGER: [] } },
        { name: "b", type: "OCTET STRING" },
      ],
    });
  });

  it("SET type with OPTIONAL", () => {
    const S = new Asn1State();
    expect(P.parse(SetType, "SET { a INTEGER OPTIONAL, b OCTET STRING }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SetType",
      value: [
        { name: "a", type: { INTEGER: [] }, value: "OPTIONAL" },
        { name: "b", type: "OCTET STRING" },
      ],
    });
  });

  it("SET type with DEFAULT", () => {
    const S = new Asn1State();
    expect(P.parse(SetType, "SET { a INTEGER DEFAULT 42, b OCTET STRING }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SetType",
      value: [
        { name: "a", type: { INTEGER: [] }, value: { DEFAULT: { INTEGER: 42n } } },
        { name: "b", type: "OCTET STRING" },
      ],
    });
  });

  it("nested SET types", () => {
    const S = new Asn1State();
    expect(P.parse(SetType, "SET { a INTEGER, b SET { a INTEGER, b BOOLEAN } }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SetType",
      value: [
        { name: "a", type: { INTEGER: [] } },
        {
          name: "b",
          type: {
            SET: [
              { name: "a", type: { INTEGER: [] } },
              { name: "b", type: "BOOLEAN" },
            ],
          },
        },
      ],
    });
  });
});

describe("Clause 28: SET OF", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("unnamed SET OF type", () => {
    const S = new Asn1State();
    expect(P.parse(SetOfType, "SET OF INTEGER", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Type",
      value: { SET_OF: { type: { INTEGER: [] } } },
    });
  });

  it("named SET OF type", () => {
    const S = new Asn1State();
    expect(P.parse(SetOfType, "SET OF x INTEGER", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Type",
      value: { SET_OF: { name: "x", type: { INTEGER: [] } } },
    });
  });

  it("empty SET OF value", () => {
    const S = new Asn1State();
    expect(P.parse(SetOfValue, "{}", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SetOfValue",
      value: [],
    });
  });

  it("unnamed SET OF value", () => {
    const S = new Asn1State();
    expect(P.parse(SetOfValue, "{1, 2, 3}", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SetOfValue",
      value: [{ INTEGER: 1n }, { INTEGER: 2n }, { INTEGER: 3n }],
    });
  });

  it("named SET OF value", () => {
    const S = new Asn1State();
    expect(P.parse(SetOfValue, "{x 1, x 2, x 3}", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "SetOfValue",
      value: [
        { name: "x", value: { INTEGER: 1n } },
        { name: "x", value: { INTEGER: 2n } },
        { name: "x", value: { INTEGER: 3n } },
      ],
    });
  });
});

describe("Clause 29 CHOICE", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("simple CHOICE type", () => {
    const S = new Asn1State();
    expect(P.parse(ChoiceType, "CHOICE { a INTEGER, b OCTET STRING }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "ChoiceType",
      value: [
        { name: "a", type: { INTEGER: [] } },
        { name: "b", type: "OCTET STRING" },
      ],
    });
  });

  it("nested CHOICE types", () => {
    const S = new Asn1State();
    expect(P.parse(ChoiceType, "CHOICE { a INTEGER, b CHOICE { a INTEGER, b BOOLEAN } }", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "ChoiceType",
      value: [
        { name: "a", type: { INTEGER: [] } },
        {
          name: "b",
          type: {
            CHOICE: [
              { name: "a", type: { INTEGER: [] } },
              { name: "b", type: "BOOLEAN" },
            ],
          },
        },
      ],
    });
  });

  it("CHOICE value", () => {
    const S = new Asn1State();
    expect(P.parse(ChoiceValue, "a : 42", { state: S })).to.be.true;
    expect(oneItem(S)).to.eql({
      kind: "Value",
      value: { CHOICE: { name: "a", value: { INTEGER: 42n } } },
    });
  });
});
