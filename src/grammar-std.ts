import { apply, assign, copy, fwd, identifier, keyword, label, lit, opt, ParsingExpression, rep0, rep1, seq, sor } from "./peg2";

export type ParsingExpressionMap = { [name: string]: ParsingExpression };

export type Asn1KeywordType =
  | "ABSENT"
  | "ABSTRACT-SYNTAX"
  | "ALL"
  | "APPLICATION"
  | "AUTOMATIC"
  | "BEGIN"
  | "BIT"
  | "BOOLEAN"
  | "BY"
  | "CHARACTER"
  | "CHOICE"
  | "CLASS"
  | "COMPONENT"
  | "COMPONENTS"
  | "CONSTRAINED"
  | "CONTAINING"
  | "DATE"
  | "DATE-TIME"
  | "DEFAULT"
  | "DEFINITIONS"
  | "DESCENDANTS"
  | "DURATION"
  | "EMBEDDED"
  | "ENCODED"
  | "ENCODING-CONTROL"
  | "END"
  | "ENUMERATED"
  | "EXCEPT"
  | "EXPLICIT"
  | "EXPORTS"
  | "EXTENSIBILITY"
  | "EXTERNAL"
  | "FALSE"
  | "FROM"
  | "IDENTIFIER"
  | "IMPLICIT"
  | "IMPLIED"
  | "IMPORTS"
  | "INCLUDES"
  | "INSTANCE"
  | "INSTRUCTIONS"
  | "INTEGER"
  | "INTERSECTION"
  | "MAX"
  | "MIN"
  | "MINUS-INFINITY"
  | "NOT-A-NUMBER"
  | "NULL"
  | "OBJECT"
  | "OCTET"
  | "OF"
  | "OID-IRI"
  | "OPTIONAL"
  | "ObjectDescriptor"
  | "PATTERN"
  | "PDV"
  | "PLUS-INFINITY"
  | "PRESENT"
  | "PRIVATE"
  | "REAL"
  | "RELATIVE-OID"
  | "RELATIVE-OID-IRI"
  | "SEQUENCE"
  | "SET"
  | "SETTINGS"
  | "SIZE"
  | "STRING"
  | "SUCCESSORS"
  | "SYNTAX"
  | "TAGS"
  | "TIME"
  | "TIME-OF-DAY"
  | "TRUE"
  | "TYPE-IDENTIFIER"
  | "UNION"
  | "UNIQUE"
  | "UNIVERSAL"
  | "WITH"
  | "GeneralizedTime"
  | "UTCTime"
  | "BMPString"
  | "GeneralString"
  | "GraphicString"
  | "IA5String"
  | "ISO646String"
  | "NumericString"
  | "PrintableString"
  | "T61String"
  | "TeletexString"
  | "UTF8String"
  | "UniversalString"
  | "VideotexString"
  | "VisibleString";

// NB "SUCCESSORS" & "DESCENDANTS" are only pseudo-keywords.
//
export const Asn1Keywords: string[] = [
  "ABSENT",
  "ABSTRACT-SYNTAX",
  "ALL",
  "APPLICATION",
  "AUTOMATIC",
  "BEGIN",
  "BIT",
  "BOOLEAN",
  "BY",
  "CHARACTER",
  "CHOICE",
  "CLASS",
  "COMPONENT",
  "COMPONENTS",
  "CONSTRAINED",
  "CONTAINING",
  "DATE",
  "DATE-TIME",
  "DEFAULT",
  "DEFINITIONS",
  "DURATION",
  "EMBEDDED",
  "ENCODED",
  "ENCODING-CONTROL",
  "END",
  "ENUMERATED",
  "EXCEPT",
  "EXPLICIT",
  "EXPORTS",
  "EXTENSIBILITY",
  "EXTERNAL",
  "FALSE",
  "FROM",
  "IDENTIFIER",
  "IMPLICIT",
  "IMPLIED",
  "IMPORTS",
  "INCLUDES",
  "INSTANCE",
  "INSTRUCTIONS",
  "INTEGER",
  "INTERSECTION",
  "MAX",
  "MIN",
  "MINUS-INFINITY",
  "NOT-A-NUMBER",
  "NULL",
  "OBJECT",
  "OCTET",
  "OF",
  "OID-IRI",
  "OPTIONAL",
  "ObjectDescriptor",
  "PATTERN",
  "PDV",
  "PLUS-INFINITY",
  "PRESENT",
  "PRIVATE",
  "REAL",
  "RELATIVE-OID",
  "RELATIVE-OID-IRI",
  "SEQUENCE",
  "SET",
  "SETTINGS",
  "SIZE",
  "STRING",
  "SYNTAX",
  "TAGS",
  "TIME",
  "TIME-OF-DAY",
  "TRUE",
  "TYPE-IDENTIFIER",
  "UNION",
  "UNIQUE",
  "UNIVERSAL",
  "WITH",

  "GeneralizedTime",
  "UTCTime",

  "BMPString",
  "GeneralString",
  "GraphicString",
  "IA5String",
  "ISO646String",
  "NumericString",
  "PrintableString",
  "T61String",
  "TeletexString",
  "UTF8String",
  "UniversalString",
  "VideotexString",
  "VisibleString",
];

export type Asn1SymbolType =
  | "{"
  | "}"
  | "<"
  | ">"
  | "."
  | ","
  | ".."
  | "..."
  | "::="
  | ":"
  | ";"
  | "("
  | ")"
  | "["
  | "]"
  | "="
  | '"'
  | "'"
  | "|"
  | "^"
  | "*"
  | "-"
  | "+"
  | "@";

const Asn1Symbols: string[] = [
  "{",
  "}",
  "<",
  ">",
  ".",
  ",",
  "..",
  "...",
  "::=",
  ":",
  ";",
  "(",
  ")",
  "[",
  "]",
  "=",
  '"',
  "'",
  "|",
  "^",
  "*",
  "-",
  "+",
  "@",
];

const Asn1Strings: ParsingExpressionMap = {
  BINARY_STRING: /'[0-1]*'(B|b)/y,
  HEXADECIMAL_STRING: /'[0-9A-Fa-f]*'(H|h)/y,
  QUOTED_STRING: /"([^"]|"")*"/y,
  NUMBER_STRING: /[0-9]+/y,
  TIME_STRING: /"[0-9+:.,CDHMRPSTWYZ-]+"/y,
};

const Asn1Identifier: ParsingExpression = identifier(/[a-zA-Z][a-zA-Z0-9-_]*/y, Asn1Keywords);

const blockComment: ParsingExpression = fwd("blockComment");
assign(blockComment, seq(lit("/*"), rep0(sor(blockComment, /([*][^/]|[/][^*]|[^*/])+/y)), lit("*/")));

const Asn1Comments: ParsingExpressionMap = {
  LINE_COMMENT: /--([^\n\r-]|-[^\n\r-])*(--|-?[\n\r])/y,
  BLOCK_COMMENT: blockComment,
};

export const Asn1Separators : ParsingExpressionMap = {
  ...Asn1Comments,
  WHITESPACE: /[ \t\r\n\f\v]/y
};

function kw(word: Asn1KeywordType): ParsingExpression {
  return keyword(word, /[a-zA-Z0-9_]+/y);
}

function tok(symbol: Asn1SymbolType): ParsingExpression {
  return lit(symbol);
}

function parens(...args: ParsingExpression[]): ParsingExpression {
  return [tok("("), ...args, tok(")")];
}

function braces(...args: ParsingExpression[]): ParsingExpression {
  return [tok("{"), ...args, tok("}")];
}

function brackets(...args: ParsingExpression[]): ParsingExpression {
  return [tok("["), ...args, tok("]")];
}

// Forward Declarations
//
export const Type: ParsingExpression = fwd("Type");
export const TypeAssignment: ParsingExpression = fwd("TypeAssignment");
export const Value: ParsingExpression = fwd("Value");
export const ValueAssignment: ParsingExpression = fwd("ValueAssignment")
export const ValueSetTypeAssignment: ParsingExpression = fwd("ValueSetTypeAssignment");
export const ElementSetSpec: ParsingExpression = fwd("ElementSetSpec");

// Clause 12
//
export const modulereference: ParsingExpression = identifier(/[A-Z](-?[a-zA-Z0-9_])*/y, Asn1Keywords);
export const typereference: ParsingExpression = identifier(/[A-Z](-?[a-zA-Z0-9_])*/y, Asn1Keywords);
export const encodingreference: ParsingExpression = identifier(/[A-Z](-?[a-zA-Z0-9_])*/y, Asn1Keywords);
export const asn1identifier: ParsingExpression = identifier(/[a-z](-?[a-zA-Z0-9_])*/y, Asn1Keywords);
export const valuereference: ParsingExpression = identifier(/[a-z](-?[a-zA-Z0-9_])*/y, Asn1Keywords);
export const empty: ParsingExpression = seq();
export const number: ParsingExpression = /0|([1-9][0-9]*)/y;
export const realnumber: ParsingExpression = /(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/y;
export const bstring: ParsingExpression = /'([01 \t\r\n\v\f]*)'B/y;
export const hstring: ParsingExpression = /'([0-9A-F \t\r\n\v\f])*'[H]/y;
export const cstring: ParsingExpression = /"([^"]|"")*"/y;
export const tstring: ParsingExpression = /"[0-9+:.,CDHMRPSTWYZ-]+"/y;
export const psname: ParsingExpression = /[A-Z](-?[a-zA-Z0-9])*/y;

// Clause 13
//

const DefinitiveNumberForm: ParsingExpression = number;
const DefinitiveNameAndNumberForm: ParsingExpression = [asn1identifier, tok("("), DefinitiveNumberForm, tok(")")];
const DefinitiveNameForm: ParsingExpression = asn1identifier;
const DefinitiveObjIdComponent: ParsingExpression = sor(DefinitiveNameAndNumberForm, DefinitiveNumberForm, DefinitiveNameForm);
const DefinitiveObjIdComponentList: ParsingExpression = rep1(DefinitiveObjIdComponent);
const DefinitiveOID: ParsingExpression = [tok("{"), DefinitiveObjIdComponentList, tok("}")];
const DefinitiveIdentification = opt(DefinitiveOID);
const ModuleIdentifier: ParsingExpression = [modulereference, DefinitiveIdentification];
const EncodingReferenceDefault: ParsingExpression = opt(encodingreference, kw("INSTRUCTIONS"));
const TagDefault: ParsingExpression = opt(
  sor([kw("EXPLICIT"), kw("TAGS")], [kw("IMPLICIT"), kw("TAGS")], [kw("AUTOMATIC"), kw("TAGS")])
);
const Reference = sor(typereference, valuereference);
const Symbol = Reference;
const SymbolList = opt(Symbol, rep0(tok(","), Symbol));
const ExportsSymbols: ParsingExpression = [kw("EXPORTS"), SymbolList, tok(";")];
const ExportsAll: ParsingExpression = [kw("EXPORTS"), kw("ALL"), tok(";")];
const Exports: ParsingExpression = sor(ExportsSymbols, ExportsAll);
const AssignedIdentifier: ParsingExpression = fwd("AssignedIdentifier");
const GlobalModuleReference: ParsingExpression = [modulereference, AssignedIdentifier];
const SelectionOption = sor([kw("WITH"), kw("SUCCESSORS")], [kw("WITH"), kw("DESCENDANTS")]);
const SymbolsFromModule: ParsingExpression = [SymbolList, kw("FROM"), GlobalModuleReference, opt(SelectionOption)];
const SymbolsImportedList: ParsingExpression = rep0(SymbolsFromModule);
const Imports: ParsingExpression = [kw("IMPORTS"), SymbolsImportedList];
const Assignment: ParsingExpression = sor(TypeAssignment, ValueAssignment);
const AssignmentList: ParsingExpression = rep0(Assignment);
const ModuleBody: ParsingExpression = [opt(Exports), opt(Imports), AssignmentList];
const ModuleDefinition: ParsingExpression = [
  ModuleIdentifier,
  kw("DEFINITIONS"),
  EncodingReferenceDefault,
  TagDefault,
  tok("::="),
  kw("BEGIN"),
  ModuleBody,
  kw("END"),
];

// Clause 14
//

export const ExternalTypeReference: ParsingExpression = [modulereference, tok("."), typereference];
export const DefinedType: ParsingExpression = sor(ExternalTypeReference, typereference);
export const ExternalValueReference: ParsingExpression = [modulereference, tok("."), valuereference];
export const DefinedValue: ParsingExpression = sor(ExternalValueReference, valuereference);

// Clause 15
//

const ComponentId: ParsingExpression = sor(asn1identifier, number, tok("*"));
const ItemSpec = [typereference, tok("."), rep0(typereference, tok(".")), ComponentId];
const AbsoluteReference: ParsingExpression = [tok("@"), ModuleIdentifier, tok("."), ItemSpec];

// Clause 16
//

assign(TypeAssignment, [typereference, tok("::="), Type]);
assign(ValueAssignment, [valuereference, tok("::="), Value]);
assign(ValueSetTypeAssignment, [typereference, Type, tok("::="), tok("{"), ElementSetSpec, tok("}")]);

// Clause 17
//
// See also below....
//

export const NamedType: ParsingExpression = [asn1identifier, Type];
export const NamedValue: ParsingExpression = [asn1identifier, Value];

// Clause 18
//
export const BooleanType: ParsingExpression = kw("BOOLEAN");
export const BooleanValue: ParsingExpression = sor(kw("TRUE"), kw("FALSE"));

// Clause 19
//

export const NegatedNumber: ParsingExpression = [tok("-"), number];
const SignedNumber: ParsingExpression = sor(NegatedNumber, number);
export const NumberOrReference: ParsingExpression = sor(SignedNumber, DefinedValue);
export const NamedNumber: ParsingExpression = [asn1identifier, tok("("), NumberOrReference, tok(")")];
export const NamedNumberItem: ParsingExpression = seq(NamedNumber);
const NamedNumberList: ParsingExpression = [NamedNumberItem, rep0(tok(","), NamedNumberItem)];
const OptNamedNumberList: ParsingExpression = opt([tok("{"), NamedNumberList, tok("}")]);
export const IntegerTypeIntroducer: ParsingExpression = kw("INTEGER");
export const IntegerType: ParsingExpression = [IntegerTypeIntroducer, OptNamedNumberList];
export const IntegerValue: ParsingExpression = sor(SignedNumber, asn1identifier);

// Clause 20
//
// Limitation: Exceptions and Additional Enumerations are not supported.

export const EnumerationItem: ParsingExpression = sor(NamedNumber, asn1identifier);
const Enumeration: ParsingExpression = [EnumerationItem, rep0(tok(","), EnumerationItem)];
export const EnumeratedTypeIntroducer: ParsingExpression = kw("ENUMERATED");
export const EnumeratedType: ParsingExpression = [EnumeratedTypeIntroducer, tok("{"), Enumeration, tok("}")];
export const EnumeratedValue: ParsingExpression = seq(asn1identifier);

// Clause 21
//

export const RealType: ParsingExpression = kw("REAL");
export const NegatedNumericRealValue: ParsingExpression = [tok("-"), realnumber];
export const NumericRealValue: ParsingExpression = sor(NegatedNumericRealValue, realnumber);
export const SpecialRealValue: ParsingExpression = sor(kw("PLUS-INFINITY"), kw("MINUS-INFINITY"), kw("NOT-A-NUMBER"));
export const RealValue: ParsingExpression = sor(NumericRealValue, SpecialRealValue);

// Clause 22
//

export const NamedBit: ParsingExpression = [asn1identifier, tok("("), sor(number, DefinedValue), tok(")")];
const NamedBitList: ParsingExpression = [NamedBit, rep0(tok(","), NamedBit)];
const OptNamedBitList: ParsingExpression = opt([tok("{"), NamedBitList, tok("}")]);
export const BitStringTypeIntroducer: ParsingExpression = [kw("BIT"), kw("STRING")];
export const BitStringType: ParsingExpression = [BitStringTypeIntroducer, OptNamedBitList];
const IdentifierList = [asn1identifier, rep0(tok(","), asn1identifier)];
const OptIdentifierList: ParsingExpression = opt(IdentifierList);
export const IdentifierListIntroducer: ParsingExpression = seq();
const IdentifierListBitstringValue: ParsingExpression = [IdentifierListIntroducer, tok("{"), OptIdentifierList, tok("}")];
export const BitStringValue: ParsingExpression = sor(bstring, hstring, IdentifierListBitstringValue);

// Clause 23
//

export const OctetStringType: ParsingExpression = [kw("OCTET"), kw("STRING")];
export const OctetStringValue: ParsingExpression = sor(bstring, hstring);

// Clause 24
//

export const NullType: ParsingExpression = kw("NULL");
export const NullValue: ParsingExpression = kw("NULL");

// Clause 25
//
// Limitation: Extension and Exception notations are not supported.
// Limitation: COMPONENTS OF not supported.

export const OptionalComponentTypeQualifier: ParsingExpression = kw("OPTIONAL");
export const DefaultComponentTypeQualifier: ParsingExpression = [kw("DEFAULT"), Value];
const ComponentTypeQualifier: ParsingExpression = sor(OptionalComponentTypeQualifier, DefaultComponentTypeQualifier);
const OptComponentTypeQualifier: ParsingExpression = opt(ComponentTypeQualifier);
const ComponentType: ParsingExpression = [NamedType, OptComponentTypeQualifier];
const ComponentTypeList: ParsingExpression = [ComponentType, rep0(tok(","), ComponentType)];
const OptComponentTypeList: ParsingExpression = opt(ComponentTypeList);
export const SequenceTypeIntroducer: ParsingExpression = kw("SEQUENCE");
export const SequenceType: ParsingExpression = [SequenceTypeIntroducer, tok("{"), OptComponentTypeList, tok("}")];
const ComponentValueList: ParsingExpression = [NamedValue, rep0(tok(","), NamedValue)];
const OptComponentValueList: ParsingExpression = opt(ComponentValueList);
export const SequenceValueIntroducer: ParsingExpression = seq();
export const SequenceValue: ParsingExpression = [SequenceValueIntroducer, tok("{"), OptComponentValueList, tok("}")];

// Clause 26
//

export const SequenceOfType: ParsingExpression = [kw("SEQUENCE"), kw("OF"), sor(Type, NamedType)];
const ValueList: ParsingExpression = [Value, rep0(tok(","), Value)];
const NamedValueList: ParsingExpression = [NamedValue, rep0(tok(","), NamedValue)];
const OptValueListOrNamedValueList = opt(sor(NamedValueList, ValueList));
export const SequenceOfValueIntroducer: ParsingExpression = seq();
export const SequenceOfValue: ParsingExpression = [SequenceOfValueIntroducer, tok("{"), OptValueListOrNamedValueList, tok("}")];

// Clause 27
//
// Limitation: Extension and Exception notations are not supported.

export const SetTypeIntroducer: ParsingExpression = kw("SET");
export const SetType: ParsingExpression = [SetTypeIntroducer, tok("{"), OptComponentTypeList, tok("}")];
export const SetValueIntroducer: ParsingExpression = seq();
export const SetValue: ParsingExpression = [tok("{"), OptComponentValueList, tok("}")];

// Clause 28
//

export const SetOfType: ParsingExpression = [kw("SET"), kw("OF"), sor(Type, NamedType)];
export const SetOfValueIntroducer: ParsingExpression = seq();
export const SetOfValue: ParsingExpression = [SetOfValueIntroducer, tok("{"), OptValueListOrNamedValueList, tok("}")];

// Clause 29
//
// Limitation: Extension and Exception notations are not supported.

const AlternativeTypeList: ParsingExpression = [NamedType, rep0(tok(","), NamedType)];
export const ChoiceTypeIntroducer: ParsingExpression = kw("CHOICE");
export const ChoiceType: ParsingExpression = [ChoiceTypeIntroducer, tok("{"), AlternativeTypeList, tok("}")];
export const ChoiceValue: ParsingExpression = [asn1identifier, tok(":"), Value];

// Clause 30
//

export const SelectionType: ParsingExpression = [asn1identifier, tok("<"), Type];

// Clause 31
//
// Limitation: EncodingPrefixedType not supported.

const EncodingReference = opt([encodingreference, tok(":")]);
const TagClass: ParsingExpression = opt(sor(kw("UNIVERSAL"), kw("APPLICATION"), kw("PRIVATE")));
const TagClassNumber: ParsingExpression = sor(number, DefinedValue);
const Tag: ParsingExpression = [tok("["), EncodingReference, TagClass, TagClassNumber, tok("]")];
const ExplicitTag: ParsingExpression = kw("EXPLICIT");
const ImplicitTag: ParsingExpression = kw("IMPLICIT");
const OptExplicitOrImplicit: ParsingExpression = opt(sor(ExplicitTag, ImplicitTag));
const TaggedType: ParsingExpression = [Tag, OptExplicitOrImplicit, Type];
export const PrefixedType: ParsingExpression = copy(TaggedType);
export const PrefixedValue: ParsingExpression = copy(Value);

// Clause 32
//
// Limitation: Defined values not supported
//

export const ObjectIdentifierType: ParsingExpression = [kw("OBJECT"), kw("IDENTIFIER")];
const OptDefinedValue: ParsingExpression = opt(DefinedValue);
const NameForm: ParsingExpression = asn1identifier;
const NumberForm: ParsingExpression = number;
const NameAndNumberForm: ParsingExpression = [asn1identifier, tok("("), NumberForm, tok(")")];
const ObjIdComponents = sor(NameAndNumberForm, NameForm, NumberForm);
const ObjIdComponentsList: ParsingExpression = rep1([ObjIdComponents]);
export const ObjectIdentifierValue: ParsingExpression = [tok("{"), ObjIdComponentsList, tok("}")];

// Clause 33
//

export const RelativeOIDType: ParsingExpression = kw("RELATIVE-OID");
const RelativeOidComponents: ParsingExpression = sor(NameAndNumberForm, NumberForm, DefinedValue);
export const RelativeOIDValue: ParsingExpression = [tok("{"), rep1([RelativeOidComponents]), tok("}")];

// Clause 34 - skipped
// Clause 35 - skipped
// Clause 36 - skipped
// Clause 37 - skipped

// Clause 38
//

export const TimeType: ParsingExpression = kw("TIME");
export const TimeValue: ParsingExpression = tstring;

export const DateType: ParsingExpression = kw("DATE");
export const TimeOfDayType: ParsingExpression = kw("TIME-OF-DAY");
export const DateTimeType: ParsingExpression = kw("DATE-TIME");
export const DurationType: ParsingExpression = kw("DURATION");

// Clause 39, 40, 41, 42, 43, 44
//

const RestrictedCharacterStringType: ParsingExpression = sor(
  kw("BMPString"),
  kw("GeneralString"),
  kw("GraphicString"),
  kw("IA5String"),
  kw("ISO646String"),
  kw("NumericString"),
  kw("PrintableString"),
  kw("TeletexString"),
  kw("T61String"),
  kw("UniversalString"),
  kw("UTF8String"),
  kw("VideotexString"),
  kw("VisibleString")
);
const UnrestrictedCharacterStringType: ParsingExpression = [kw("CHARACTER"), kw("STRING")];
export const CharacterStringType: ParsingExpression = sor(RestrictedCharacterStringType, UnrestrictedCharacterStringType);
const Quadruple: ParsingExpression = [tok("{"), number, tok(","), number, tok(","), number, tok(","), number, tok("}")];
const Tuple: ParsingExpression = [tok("{"), number, tok(","), number, tok("}")];
const CharsDefn = sor(cstring, Quadruple, Tuple, DefinedValue);
const CharSyms: ParsingExpression = [CharsDefn, rep0(tok(","), CharsDefn)];
const CharacterStringList: ParsingExpression = [tok("{"), CharSyms, tok("}")];
const RestrictedCharacterStringValue = sor(cstring, Quadruple, Tuple, CharacterStringList);
const UnrestrictedCharacterStringValue: ParsingExpression = SequenceValue;
export const CharacterStringValue: ParsingExpression = sor(RestrictedCharacterStringValue, UnrestrictedCharacterStringValue);

// Clause 45
//

const UsefulType: ParsingExpression = typereference;

// Clause 46, 47, 48 - skipped

// Clause 49, 50, 51
//
// Limitation: exception not supported.
// Limitation: partial type constraints not supported.
// Limitation: ObjectSetElements not supported.
// Limitation: GeneralConstraint not supported.
//

export const Constraint: ParsingExpression = fwd("Constraint");
const SingleValue: ParsingExpression = Value;
const OptIncludes: ParsingExpression = opt(kw("INCLUDES"));
const ContainedSubtype: ParsingExpression = [OptIncludes, Type];
const LowerEndValue: ParsingExpression = sor(Value, kw("MIN"));
const OptLess: ParsingExpression = opt(tok("<"));
const LowerEndpoint: ParsingExpression = [LowerEndValue, OptLess];
const UpperEndValue: ParsingExpression = sor(Value, kw("MAX"));
const UpperEndpoint: ParsingExpression = [OptLess, UpperEndValue];
const ValueRange: ParsingExpression = [LowerEndpoint, tok(".."), UpperEndpoint];
const PermittedAlphabet: ParsingExpression = [kw("FROM"), Constraint];
const SizeConstraint: ParsingExpression = [kw("SIZE"), Constraint];
const TypeConstraint: ParsingExpression = Type;
const SingleTypeConstraint: ParsingExpression = Constraint;
const ValueConstraint: ParsingExpression = opt(Constraint);
const PresenceConstraint: ParsingExpression = opt(sor(kw("PRESENT"), kw("ABSENT"), kw("OPTIONAL")));
const ComponentConstraint: ParsingExpression = [ValueConstraint, PresenceConstraint];
const NamedConstraint: ParsingExpression = [asn1identifier, ComponentConstraint];
const TypeConstraints: ParsingExpression = [NamedConstraint, rep0(tok(","), NamedConstraint)];
const MultipleTypeConstraints: ParsingExpression = [tok("{"), TypeConstraints, tok("}")];
const InnerTypeConstraintsSingle = [kw("WITH"), kw("COMPONENT"), SingleTypeConstraint];
const InnerTypeConstraintsMulti = [kw("WITH"), kw("COMPONENTS"), MultipleTypeConstraints];
const InnerTypeConstraints: ParsingExpression = sor(InnerTypeConstraintsSingle, InnerTypeConstraintsMulti);
const PatternConstraint = [kw("PATTERN"), Value];
const PropertyAndSettingPair: ParsingExpression = [psname, tok("="), psname];
const PropertySettingsList: ParsingExpression = rep1(PropertyAndSettingPair);
const PropertySettings: ParsingExpression = [kw("SETTINGS"), tok('"'), PropertySettingsList, tok('"')];
const DurationRange: ParsingExpression = ValueRange;
const TimePointRange: ParsingExpression = ValueRange;
const RecurrenceRange: ParsingExpression = ValueRange;
const SubtypeElements = sor(
  ContainedSubtype,
  ValueRange,
  PermittedAlphabet,
  SizeConstraint,
  TypeConstraint,
  InnerTypeConstraints,
  PatternConstraint,
  PropertySettings,
  DurationRange,
  TimePointRange,
  RecurrenceRange,
  SingleValue
  );
const ParensElementSetSpec = [tok("("), ElementSetSpec, tok(")")];
const Elements: ParsingExpression = sor(SubtypeElements, ParensElementSetSpec);
const Exclusions: ParsingExpression = [kw("EXCEPT"), Elements];
const ExclusionsSpec: ParsingExpression = [kw("ALL"), Exclusions];
const OptExclusions: ParsingExpression = opt(Exclusions);
const IntersectionElements: ParsingExpression = [Elements, OptExclusions];
const IntersectionMark = sor(tok("^"), kw("INTERSECTION"));
const Intersections: ParsingExpression = [IntersectionElements, rep0(IntersectionMark, IntersectionElements)];
const UnionMark: ParsingExpression = sor(tok("|"), kw("UNION"));
const Unions: ParsingExpression = [Intersections, rep0(UnionMark, Intersections)];
assign(ElementSetSpec, sor(ExclusionsSpec, Unions));
const SubtypeConstraint: ParsingExpression = ElementSetSpec;
const ConstraintSpec: ParsingExpression = SubtypeConstraint;
assign(Constraint, [tok("("), ConstraintSpec, tok(")")]);
//const SimpleConstrainedType: ParsingExpression = [Type, Constraint];
const TypeOrNamedType: ParsingExpression = sor(NamedType, Type);
const ConstraintOrSizeConstraint: ParsingExpression = sor(Constraint, SizeConstraint);
const SetWithConstraint: ParsingExpression = [kw("SET"), ConstraintOrSizeConstraint, kw("OF"), TypeOrNamedType];
const SequenceWithConstraint: ParsingExpression = [kw("SEQUENCE"), ConstraintOrSizeConstraint, kw("OF"), TypeOrNamedType];
const TypeWithConstraint: ParsingExpression = sor(SetWithConstraint, SequenceWithConstraint);
//const ConstrainedType: ParsingExpression = sor(SimpleConstrainedType, TypeWithConstraint);
export const ConstrainedType: ParsingExpression = TypeWithConstraint;
label(ConstrainedType, "ConstrainedType");

// Clause 17 redux
//

export const BuiltinType: ParsingExpression = sor(
  BitStringType,
  BooleanType,
  CharacterStringType,
  ChoiceType,
  DateTimeType,
  DateType,
  DurationType,
  EnumeratedType,
  IntegerType,
  NullType,
  ObjectIdentifierType,
  OctetStringType,
  RealType,
  RelativeOIDType,
  SequenceType,
  SequenceOfType,
  SetType,
  SetOfType,
  PrefixedType,
  TimeOfDayType,
  TimeType
);
const ReferencedType: ParsingExpression = sor(DefinedType, UsefulType, SelectionType);
const UnconstrainedType: ParsingExpression = sor(BuiltinType, ReferencedType, TypeWithConstraint);
assign(Type, [UnconstrainedType, rep0(Constraint)]);
label(Type, "Type");

export const BuiltinValue: ParsingExpression = sor(
  BitStringValue,
  BooleanValue,
  CharacterStringValue,
  ChoiceValue,
  EnumeratedValue,
  IntegerValue,
  NullValue,
  ObjectIdentifierValue,
  OctetStringValue,
  RealValue,
  RelativeOIDValue,
  SequenceValue,
  SequenceOfValue,
  SetValue,
  SetOfValue,
  TimeValue
);
const ReferencedValue: ParsingExpression = DefinedValue;
assign(Value, sor(BuiltinValue, ReferencedValue));
label(Value, "Value");
assign(AssignedIdentifier, opt(sor(ObjectIdentifierValue, DefinedValue)));
