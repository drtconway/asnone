import {
  asn1identifier,
  BitStringType,
  BitStringValue,
  BooleanType,
  BooleanValue,
  bstring,
  BuiltinType,
  CharacterStringType,
  CharacterStringValue,
  ChoiceType,
  ChoiceValue,
  Constraint,
  cstring,
  DateTimeType,
  DateType,
  DurationType,
  empty,
  EnumeratedType,
  EnumeratedValue,
  hstring,
  IntegerType,
  IntegerValue,
  modulereference,
  NamedType,
  NamedValue,
  NullType,
  NullValue,
  number,
  ObjectIdentifierType,
  ObjectIdentifierValue,
  OctetStringType,
  OctetStringValue,
  PrefixedType,
  psname,
  realnumber,
  RealType,
  RealValue,
  RelativeOIDType,
  RelativeOIDValue,
  SelectionType,
  SequenceOfType,
  SequenceOfValue,
  SequenceType,
  SequenceValue,
  SetOfType,
  SetOfValue,
  SetType,
  SetValue,
  TimeOfDayType,
  TimeType,
  TimeValue,
  tstring,
  typereference,
  valuereference,
} from "./../src/grammar-std";
import { Asn1Separators } from "../src/grammar-std";

import * as mocha from "mocha";
import * as chai from "chai";
import { toArray } from "../src/stack";
import { Parser } from "../src/peg2";

const expect = chai.expect;

describe("clause 12", () => {
  describe("12.2 typereference", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid type references", () => {
      expect(P.parse(typereference, "InitializeRequest")).to.be.true;
      expect(P.parse(typereference, "Explain-Record")).to.be.true;
      expect(P.parse(typereference, "InitializeRequest1")).to.be.true;
      expect(P.parse(typereference, "E-xplain-Record")).to.be.true;
    });
    it("some invalid type references", () => {
      expect(P.parse(typereference, "initializeRequest")).to.be.false;
      expect(P.parse(typereference, "Explain-Record-")).to.be.false;
      expect(P.parse(typereference, "Explain--Record")).to.be.false;
    });
  });

  describe("12.3 identifier", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid identifiers", () => {
      expect(P.parse(asn1identifier, "a")).to.be.true;
      expect(P.parse(asn1identifier, "transferSyntaxes")).to.be.true;
      expect(P.parse(asn1identifier, "version-2")).to.be.true;
    });
    it("some invalid identifiers", () => {
      expect(P.parse(asn1identifier, "InitializeRequest")).to.be.false;
      expect(P.parse(asn1identifier, "explain--Record")).to.be.false;
    });
  });

  describe("12.4 valuereference", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid value references", () => {
      expect(P.parse(valuereference, "a")).to.be.true;
      expect(P.parse(valuereference, "transferSyntaxes")).to.be.true;
      expect(P.parse(valuereference, "version-2")).to.be.true;
    });
    it("some invalid value references", () => {
      expect(P.parse(valuereference, "InitializeRequest")).to.be.false;
      expect(P.parse(valuereference, "explain--Record")).to.be.false;
    });
  });

  describe("12.5 modulereference", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid module references", () => {
      expect(P.parse(modulereference, "InitializeRequest")).to.be.true;
      expect(P.parse(modulereference, "Explain-Record")).to.be.true;
      expect(P.parse(modulereference, "InitializeRequest1")).to.be.true;
      expect(P.parse(modulereference, "E-xplain-Record")).to.be.true;
    });
    it("some invalid module references", () => {
      expect(P.parse(modulereference, "initializeRequest")).to.be.false;
      expect(P.parse(modulereference, "Explain-Record-")).to.be.false;
      expect(P.parse(modulereference, "-Explain-Record")).to.be.false;
      expect(P.parse(modulereference, "Explain--Record")).to.be.false;
    });
  });

  describe("12.6 comments", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid comments", () => {
      expect(P.parse(Asn1Separators.LINE_COMMENT, "-- the quick --")).to.be.true;
      expect(P.parse(Asn1Separators.LINE_COMMENT, "-- the quick - - brown fox\n")).to.be.true;
      expect(P.parse(Asn1Separators.BLOCK_COMMENT, "/* wibble \n wobble */")).to.be.true;
      expect(P.parse(Asn1Separators.BLOCK_COMMENT, "/* wibble Ï \n /* wobble */ */")).to.be.true;
    });
    it("some invalid comments", () => {
      expect(P.parse(modulereference, "/* /* */")).to.be.false;
    });
  });

  describe("12.7 empty", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("empty item", () => {
      expect(P.parse(empty, "")).to.be.true;
    });
  });

  describe("12.8 number", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid numbers", () => {
      expect(P.parse(number, "0")).to.be.true;
      expect(P.parse(number, "1")).to.be.true;
      expect(P.parse(number, "10")).to.be.true;
      expect(P.parse(number, "1234567890")).to.be.true;
    });
    it("some invalid numbers", () => {
      expect(P.parse(number, "01")).to.be.false;
      expect(P.parse(number, "-1")).to.be.false;
      expect(P.parse(number, "+10")).to.be.false;
      expect(P.parse(number, "123.456")).to.be.false;
    });
  });

  describe("12.9 realnumber", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid numbers", () => {
      expect(P.parse(realnumber, "0")).to.be.true;
      expect(P.parse(realnumber, "1")).to.be.true;
      expect(P.parse(realnumber, "10")).to.be.true;
      expect(P.parse(realnumber, "1234567890")).to.be.true;
      expect(P.parse(realnumber, "123.4567890")).to.be.true;
      expect(P.parse(realnumber, "1.4567")).to.be.true;
      expect(P.parse(realnumber, "1.4567e23")).to.be.true;
      expect(P.parse(realnumber, "1.4567E+23")).to.be.true;
      expect(P.parse(realnumber, "1.4567e-23")).to.be.true;
      expect(P.parse(realnumber, "1.4567e0")).to.be.true;
      expect(P.parse(realnumber, "1.4567e001")).to.be.true;
    });
    it("some invalid numbers", () => {
      expect(P.parse(realnumber, "01")).to.be.false;
      expect(P.parse(realnumber, "-1")).to.be.false;
      expect(P.parse(realnumber, "+10")).to.be.false;
      expect(P.parse(realnumber, ".1")).to.be.false;
      expect(P.parse(realnumber, "01.0")).to.be.false;
      expect(P.parse(realnumber, "01.0E")).to.be.false;
    });
  });

  describe("12.10 bstring", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid binary strings", () => {
      expect(P.parse(bstring, "''B")).to.be.true;
      expect(P.parse(bstring, "'1001'B")).to.be.true;
      expect(P.parse(bstring, "'10 01'B")).to.be.true;
    });
    it("some invalid binary strings", () => {
      expect(P.parse(bstring, "'1001'b")).to.be.false;
      expect(P.parse(bstring, "'12345'B")).to.be.false;
      expect(P.parse(bstring, '"1001"B')).to.be.false;
    });
  });

  describe("12.12 hstring", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid binary strings", () => {
      expect(P.parse(hstring, "''H")).to.be.true;
      expect(P.parse(hstring, "'DEADBEEF'H")).to.be.true;
      expect(P.parse(hstring, "'F0 0F'H")).to.be.true;
    });
    it("some invalid binary strings", () => {
      expect(P.parse(hstring, "'1001'h")).to.be.false;
      expect(P.parse(hstring, "'deadbeef'H")).to.be.false;
      expect(P.parse(hstring, '"F00F"H')).to.be.false;
    });
  });

  describe("12.14 cstring", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid character strings", () => {
      expect(P.parse(cstring, '""')).to.be.true;
      expect(P.parse(cstring, '"ABC"')).to.be.true;
      expect(P.parse(cstring, '"A""B"')).to.be.true;
      expect(P.parse(cstring, '"chữ Quốc ngữ"')).to.be.true;
      expect(P.parse(cstring, '"有朋自遠方來，不亦樂乎"')).to.be.true;
      expect(P.parse(cstring, '"ABCDE\tFGH \n\tIJK""XYZ"')).to.be.true;
    });
    it("some invalid character strings", () => {
      expect(P.parse(cstring, '"""')).to.be.false;
    });
  });

  describe("12.17 tstring", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid time strings", () => {
      expect(P.parse(tstring, '"P0Y29M"')).to.be.true;
      expect(P.parse(tstring, '"P29M0D"')).to.be.true;
      expect(P.parse(tstring, '"P0Y29M0DT0,00H"')).to.be.true;
      expect(P.parse(tstring, '"P29MT0.00H"')).to.be.true;
      expect(P.parse(tstring, '"P29MT0.000S"')).to.be.true;
    });
    it("some invalid time strings", () => {
      expect(P.parse(tstring, "Tue 20 Dec 2022 13:40:27 AEDT")).to.be.false;
    });
  });

  describe("12.19 psname", () => {
    const P = new Parser({ separators: Asn1Separators });
    it("some valid property names", () => {
      expect(P.parse(psname, "Interval-type")).to.be.true;
    });
    it("some invalid property names", () => {
      expect(P.parse(psname, "interval-type")).to.be.false;
    });
  });
});

describe("Clause 17 Named entities", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Named Type", () => {
    expect(P.parse(NamedType, "a INTEGER")).to.be.true;
  });
  it("Invalid Named Type", () => {
    expect(P.parse(NamedType, "a b")).to.be.false;
  });

  it("Valid Named Value", () => {
    expect(P.parse(NamedValue, "a 1")).to.be.true;
    expect(P.parse(NamedValue, "wombat TRUE")).to.be.true;
  });
  it("Invalid Named Value", () => {
    expect(P.parse(NamedValue, "a T")).to.be.false;
  });

  it("Valid BuiltinType", () => {
    expect(P.parse(BuiltinType, "BIT STRING")).to.be.true;
    expect(P.parse(BuiltinType, "BOOLEAN")).to.be.true;
    expect(P.parse(BuiltinType, "CHARACTER STRING")).to.be.true;
    expect(P.parse(BuiltinType, "CHOICE { a INTEGER }")).to.be.true;
    expect(P.parse(BuiltinType, "DATE")).to.be.true;
    expect(P.parse(BuiltinType, "DATE-TIME")).to.be.true;
    expect(P.parse(BuiltinType, "DURATION")).to.be.true;
    expect(P.parse(BuiltinType, "ENUMERATED { a, b }")).to.be.true;
    expect(P.parse(BuiltinType, "INTEGER")).to.be.true;
    expect(P.parse(BuiltinType, "NULL")).to.be.true;
    expect(P.parse(BuiltinType, "OBJECT IDENTIFIER")).to.be.true;
    expect(P.parse(BuiltinType, "OCTET STRING")).to.be.true;
    expect(P.parse(BuiltinType, "REAL")).to.be.true;
    expect(P.parse(BuiltinType, "RELATIVE-OID")).to.be.true;
    expect(P.parse(BuiltinType, "SEQUENCE { a INTEGER, b BOOLEAN }")).to.be.true;
    expect(P.parse(BuiltinType, "SEQUENCE OF INTEGER")).to.be.true;
    expect(P.parse(BuiltinType, "SET { a INTEGER, b BOOLEAN}")).to.be.true;
    expect(P.parse(BuiltinType, "SET OF INTEGER")).to.be.true;
    expect(P.parse(BuiltinType, "[1] INTEGER")).to.be.true;
    expect(P.parse(BuiltinType, "TIME")).to.be.true;
    expect(P.parse(BuiltinType, "TIME-OF-DAY")).to.be.true;
  });

  it("Complex Types", () => {
    expect(
      P.parse(
        BuiltinType,
        [
          "CHOICE {",
          "        a INTEGER,",
          "        b InternationalString,",
          "        c OCTET STRING,",
          "        d OBJECT IDENTIFIER,",
          "        e BOOLEAN,",
          "        f NULL,",
          "        -- Following need context tags:",
          "        unit                [1] IMPLICIT Unit, ",
          "        valueAndUnit        [2] IMPLICIT IntUnit",
          "}",
        ].join("\n")
      )
    ).to.be.true;
    expect(
      P.parse(
        BuiltinType,
        [
          "SEQUENCE {",
          "    globalVariantSetId  [1] IMPLICIT OBJECT IDENTIFIER OPTIONAL,",
          "    triples             [2] IMPLICIT SEQUENCE OF SEQUENCE {",
          "        variantSetId    [0]   IMPLICIT OBJECT IDENTIFIER OPTIONAL,",
          "        class           [1]    IMPLICIT INTEGER,",
          "        type            [2]    IMPLICIT INTEGER",
          "    }",
          "}",
        ].join("\n")
      )
    ).to.be.true;
  });
});

describe("Clause 18 Boolean", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Boolean Type", () => {
    expect(P.parse(BooleanType, "BOOLEAN")).to.be.true;
  });
  it("Invalid Boolean Type", () => {
    expect(P.parse(BooleanType, "BOOL")).to.be.false;
    expect(P.parse(BooleanType, "BOOLEANS")).to.be.false;
    expect(P.parse(BooleanType, "boolean")).to.be.false;
    expect(P.parse(BooleanType, "TRUE")).to.be.false;
    expect(P.parse(BooleanType, "FALSE")).to.be.false;
  });

  it("Valid Boolean Value", () => {
    expect(P.parse(BooleanValue, "TRUE")).to.be.true;
    expect(P.parse(BooleanValue, "FALSE")).to.be.true;
  });
  it("Invalid Boolean Values", () => {
    expect(P.parse(BooleanValue, "true")).to.be.false;
    expect(P.parse(BooleanValue, "false")).to.be.false;
    expect(P.parse(BooleanValue, "0")).to.be.false;
    expect(P.parse(BooleanValue, "1")).to.be.false;
    expect(P.parse(BooleanValue, "BOOLEAN")).to.be.false;
  });
});

describe("Clause 19 Number", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Integer Type", () => {
    expect(P.parse(IntegerType, "INTEGER")).to.be.true;
    expect(P.parse(IntegerType, "INTEGER { a(2) }")).to.be.true;
    expect(P.parse(IntegerType, "INTEGER { a(3), b(a) }")).to.be.true;
  });
  it("Invalid Integer Type", () => {
    expect(P.parse(IntegerType, "IN")).to.be.false;
    expect(P.parse(IntegerType, "INT")).to.be.false;
    expect(P.parse(IntegerType, "integer")).to.be.false;
    expect(P.parse(IntegerType, "1234")).to.be.false;
  });

  it("Valid Integer Value", () => {
    expect(P.parse(IntegerValue, "0")).to.be.true;
    expect(P.parse(IntegerValue, "123")).to.be.true;
    expect(P.parse(IntegerValue, "-123")).to.be.true;
  });
  it("Invalid Integer Values", () => {
    expect(P.parse(IntegerValue, "-")).to.be.false;
    expect(P.parse(IntegerValue, "0123")).to.be.false;
    expect(P.parse(IntegerValue, "+123")).to.be.false;
  });
});

describe("Clause 20 Enumerations", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Enumerated Type", () => {
    expect(P.parse(EnumeratedType, " ENUMERATED { a, b }")).to.be.true;
    expect(P.parse(EnumeratedType, " ENUMERATED { a(1), b (3) }")).to.be.true;
  });
  it("Invalid Enumerated Type", () => {
    expect(P.parse(EnumeratedType, "ENUMERATED { }")).to.be.false;
    expect(P.parse(EnumeratedType, "ENUMERATED { 1 }")).to.be.false;
  });

  it("Valid Enumerated Value", () => {
    expect(P.parse(EnumeratedValue, "a")).to.be.true;
  });
  it("Invalid Enumerated Values", () => {
    expect(P.parse(EnumeratedValue, "1")).to.be.false;
    expect(P.parse(EnumeratedValue, "I")).to.be.false;
  });
});

describe("Clause 21 Real", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Real Type", () => {
    expect(P.parse(RealType, "REAL")).to.be.true;
  });
  it("Invalid Real Type", () => {
    expect(P.parse(RealType, "real")).to.be.false;
    expect(P.parse(RealType, "FLOAT")).to.be.false;
  });

  it("Valid Real Value", () => {
    expect(P.parse(RealValue, "6.18e+23")).to.be.true;
    expect(P.parse(RealValue, "0")).to.be.true;
    expect(P.parse(RealValue, "-3.14")).to.be.true;
    expect(P.parse(RealValue, "PLUS-INFINITY")).to.be.true;
    expect(P.parse(RealValue, "MINUS-INFINITY")).to.be.true;
    expect(P.parse(RealValue, "NOT-A-NUMBER")).to.be.true;
  });
  it("Invalid Real Values", () => {
    expect(P.parse(RealValue, "PLUS INFINITY")).to.be.false;
    expect(P.parse(RealValue, "MINUS - INFINITY")).to.be.false;
    expect(P.parse(RealValue, "NA")).to.be.false;
  });
});

describe("Clause 22 Bit String", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Bit String Type", () => {
    expect(P.parse(BitStringType, "BIT STRING")).to.be.true;
    expect(P.parse(BitStringType, "BIT STRING { a(1), b(3) }")).to.be.true;
    expect(P.parse(BitStringType, "BIT STRING { a(1), b(x) }")).to.be.true;
  });
  it("Invalid Bit String Type", () => {
    expect(P.parse(BitStringType, "BIT-STRING")).to.be.false;
    expect(P.parse(BitStringType, "BIT STRING { }")).to.be.false;
    expect(P.parse(BitStringType, "BIT STRING { a(1), }")).to.be.false;
  });

  it("Valid Bit String Value", () => {
    expect(P.parse(BitStringValue, "'1001'B")).to.be.true;
    expect(P.parse(BitStringValue, "'DEADBEEF'H")).to.be.true;
    expect(P.parse(BitStringValue, "{ }")).to.be.true;
    expect(P.parse(BitStringValue, "{ a, b, c }")).to.be.true;
  });
  it("Invalid Bit String Values", () => {
    expect(P.parse(BitStringValue, '"hello"')).to.be.false;
    expect(P.parse(BitStringValue, "{ a, b, }")).to.be.false;
  });
});

describe("Clause 23 Octet Strings", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Octet String Type", () => {
    expect(P.parse(OctetStringType, "OCTET STRING")).to.be.true;
  });
  it("Invalid Octet String Type", () => {
    expect(P.parse(OctetStringType, "OCTET-STRING")).to.be.false;
    expect(P.parse(OctetStringType, "octet string")).to.be.false;
  });

  it("Valid Octet String Value", () => {
    expect(P.parse(OctetStringValue, "'10011001'B")).to.be.true;
    expect(P.parse(OctetStringValue, "'DEADBEEF'H")).to.be.true;
  });
  it("Invalid Octet String Values", () => {
    expect(P.parse(OctetStringValue, "{ }")).to.be.false;
    expect(P.parse(OctetStringValue, "{ a, b, c }")).to.be.false;
    expect(P.parse(OctetStringValue, '"hello"')).to.be.false;
    expect(P.parse(OctetStringValue, "{ a, b, }")).to.be.false;
  });
});

describe("Clause 24 Null", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Null Type", () => {
    expect(P.parse(NullType, "NULL")).to.be.true;
  });
  it("Valid Null Value", () => {
    expect(P.parse(NullValue, "NULL")).to.be.true;
  });
});

describe("Clause 25 Sequence", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Sequence Type", () => {
    expect(P.parse(SequenceType, "SEQUENCE {}")).to.be.true;
    expect(P.parse(SequenceType, "SEQUENCE { a INTEGER, b BOOLEAN, c OCTET STRING }")).to.be.true;
  });
  it("Invalid Sequence Type", () => {
    expect(P.parse(SequenceType, "SEQUENCE { a INTEGER, b, c OCTET STRING")).to.be.false;
    expect(P.parse(SequenceType, "sequence {}")).to.be.false;
  });

  it("Valid Sequence Value", () => {
    expect(P.parse(SequenceValue, "{}")).to.be.true;
    expect(P.parse(SequenceValue, "{ a 1, b TRUE, c '1001'B }")).to.be.true;
  });
  it("Invalid Sequence Values", () => {
    expect(P.parse(SequenceValue, '"hello"')).to.be.false;
    expect(P.parse(SequenceValue, "{ a, b, }")).to.be.false;
  });
});

describe("Clause 26 Sequence Of", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Sequence Of Type", () => {
    expect(P.parse(SequenceOfType, "SEQUENCE OF INTEGER")).to.be.true;
    expect(P.parse(SequenceOfType, "SEQUENCE OF wombat BOOLEAN")).to.be.true;
  });

  it("Valid Sequence Of Value", () => {
    expect(P.parse(SequenceOfValue, "{}")).to.be.true;
    expect(P.parse(SequenceOfValue, "{1, 2, 3}")).to.be.true;
    expect(P.parse(SequenceOfValue, "{wombat TRUE, wombat TRUE, wombat FALSE}")).to.be.true;
  });
});

describe("Clause 27 Set", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Set Type", () => {
    expect(P.parse(SetType, "SET {}")).to.be.true;
    expect(P.parse(SetType, "SET { a INTEGER, b BOOLEAN, c OCTET STRING }")).to.be.true;
  });
  it("Invalid Set Type", () => {
    expect(P.parse(SetType, "SET { a INTEGER, b, c OCTET STRING")).to.be.false;
    expect(P.parse(SetType, "set {}")).to.be.false;
  });

  it("Valid Set Value", () => {
    expect(P.parse(SetValue, "{}")).to.be.true;
    expect(P.parse(SetValue, "{ a 1, b TRUE, c '1001'B }")).to.be.true;
  });
  it("Invalid Set Values", () => {
    expect(P.parse(SetValue, '"hello"')).to.be.false;
    expect(P.parse(SetValue, "{ a, b, }")).to.be.false;
  });
});

describe("Clause 28 Set Of", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Set Of Type", () => {
    expect(P.parse(SetOfType, "SET OF INTEGER")).to.be.true;
    expect(P.parse(SetOfType, "SET OF wombat BOOLEAN")).to.be.true;
  });

  it("Valid Set Of Value", () => {
    expect(P.parse(SetOfValue, "{}")).to.be.true;
    expect(P.parse(SetOfValue, "{1, 2, 3}")).to.be.true;
    expect(P.parse(SetOfValue, "{wombat TRUE, wombat TRUE, wombat FALSE}")).to.be.true;
  });
});

describe("Clause 29 Choice", () => {
  const P = new Parser({ separators: Asn1Separators });

  it("Valid Choice Type", () => {
    expect(P.parse(ChoiceType, "CHOICE { a INTEGER }")).to.be.true;
    expect(P.parse(ChoiceType, "CHOICE { a INTEGER, b BOOLEAN, c OCTET STRING }")).to.be.true;
  });
  it("Invalid Choice Type", () => {
    expect(P.parse(ChoiceType, "CHOICE { }")).to.be.false;
    expect(P.parse(ChoiceType, "CHOICE { a INTEGER, b, c OCTET STRING")).to.be.false;
    expect(P.parse(ChoiceType, "choice {}")).to.be.false;
  });

  it("Valid Choice Value", () => {
    expect(P.parse(ChoiceValue, "a : 1")).to.be.true;
    expect(P.parse(ChoiceValue, "b : TRUE")).to.be.true;
  });
  it("Invalid Choice Values", () => {
    expect(P.parse(ChoiceValue, '"hello"')).to.be.false;
    expect(P.parse(ChoiceValue, "{ a, b, }")).to.be.false;
  });
});

describe("Clause 30 Selection", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Selection Type", () => {
    expect(P.parse(SelectionType, "a < CHOICE { a INTEGER }")).to.be.true;
    expect(P.parse(SelectionType, "c < CHOICE { a INTEGER, b BOOLEAN, c OCTET STRING }")).to.be.true;
  });
});

describe("Clause 31 Prefixed", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Tagged Type", () => {
    expect(P.parse(PrefixedType, "[1] INTEGER")).to.be.true;
    expect(P.parse(PrefixedType, "[UNIVERSAL 1] BOOLEAN")).to.be.true;
    expect(P.parse(PrefixedType, "[APPLICATION 1] BOOLEAN")).to.be.true;
    expect(P.parse(PrefixedType, "[PRIVATE 1] BOOLEAN")).to.be.true;
    expect(P.parse(PrefixedType, "[PER:APPLICATION 1] BOOLEAN")).to.be.true;
  });
});

describe("Clause 32 Object Identifiers", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Object Identifier Type", () => {
    expect(P.parse(ObjectIdentifierType, "OBJECT IDENTIFIER")).to.be.true;
  });

  it("Valid Object Identifier Value", () => {
    expect(P.parse(ObjectIdentifierValue, "{ 1 0 8571 1 }")).to.be.true;
    expect(P.parse(ObjectIdentifierValue, "{ iso standard 8571 application-context (1) }")).to.be.true;
  });
});

describe("Clause 33 Relative Object Identifiers", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Relative Object Identifier Type", () => {
    expect(P.parse(RelativeOIDType, "RELATIVE-OID")).to.be.true;
  });

  it("Valid Relative Object Identifier Value", () => {
    expect(P.parse(RelativeOIDValue, "{ 1 0 8571 1 }")).to.be.true;
    expect(P.parse(RelativeOIDValue, "{science-fac(4) maths-dept(3)}")).to.be.true;
  });
});

describe("Clause 38 Time", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Time Type", () => {
    expect(P.parse(TimeType, "TIME")).to.be.true;
    expect(P.parse(DateType, "DATE")).to.be.true;
    expect(P.parse(TimeOfDayType, "TIME-OF-DAY")).to.be.true;
    expect(P.parse(DateTimeType, "DATE-TIME")).to.be.true;
    expect(P.parse(DurationType, "DURATION")).to.be.true;
  });

  it("Valid Time Value", () => {
    expect(P.parse(TimeValue, '"P0Y29M"')).to.be.true;
    expect(P.parse(TimeValue, '"P29M0D"')).to.be.true;
    expect(P.parse(TimeValue, '"P0Y29M0DT0,00H"')).to.be.true;
    expect(P.parse(TimeValue, '"P29MT0.00H"')).to.be.true;
    expect(P.parse(TimeValue, '"P29MT0.000S"')).to.be.true;
  });
});

describe("Clauses 39-44 Character Strings", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Character String Types", () => {
    expect(P.parse(CharacterStringType, "CHARACTER STRING")).to.be.true;
    expect(P.parse(CharacterStringType, "BMPString")).to.be.true;
    expect(P.parse(CharacterStringType, "GeneralString")).to.be.true;
    expect(P.parse(CharacterStringType, "GraphicString")).to.be.true;
    expect(P.parse(CharacterStringType, "IA5String")).to.be.true;
    expect(P.parse(CharacterStringType, "ISO646String")).to.be.true;
    expect(P.parse(CharacterStringType, "NumericString")).to.be.true;
    expect(P.parse(CharacterStringType, "PrintableString")).to.be.true;
    expect(P.parse(CharacterStringType, "TeletexString")).to.be.true;
    expect(P.parse(CharacterStringType, "T61String")).to.be.true;
    expect(P.parse(CharacterStringType, "UniversalString")).to.be.true;
    expect(P.parse(CharacterStringType, "UTF8String")).to.be.true;
    expect(P.parse(CharacterStringType, "VideotexString")).to.be.true;
    expect(P.parse(CharacterStringType, "VisibleString")).to.be.true;
  });

  it("Valid Character String Values", () => {
    expect(P.parse(CharacterStringValue, '"hello"')).to.be.true;
    expect(P.parse(CharacterStringValue, '{"hello"}')).to.be.true;
    expect(P.parse(CharacterStringValue, '{"hello", "its me"}')).to.be.true;
    expect(P.parse(CharacterStringValue, "{0, 0}")).to.be.true;
    expect(P.parse(CharacterStringValue, "{0, 0, 0, 1}")).to.be.true;
    expect(P.parse(CharacterStringValue, '{ "hello", {0, 0, 0, 1} }')).to.be.true;
  });
});

describe("Clauses 49-51 Constraints", () => {
  const P = new Parser({ separators: Asn1Separators });
  it("Valid Constraints", () => {
    expect(P.parse(Constraint, "(1)")).to.be.true;
    expect(P.parse(Constraint, "(INCLUDES BOOLEAN)")).to.be.true;
    expect(P.parse(Constraint, "(MIN..MAX)")).to.be.true;
    expect(P.parse(Constraint, "(1..10)")).to.be.true;
    expect(P.parse(Constraint, "(1<..10)")).to.be.true;
    expect(P.parse(Constraint, "(1..<10)")).to.be.true;
    expect(P.parse(Constraint, "(1<..<10)")).to.be.true;
    expect(P.parse(Constraint, "(SIZE (1..MAX))")).to.be.true;
    expect(P.parse(Constraint, '(SETTINGS  "Basic=Date Date=YMD Year=Basic")')).to.be.true;
  });
});
