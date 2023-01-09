import { ParsingExpression, Parser, lit, rep0, rep1, seq, alt, opt, keyword, identifier, not, act, Lazy, State } from "../src/peg";

import * as mocha from "mocha";
import * as chai from "chai";

const expect = chai.expect;

describe("lit", () => {
  it("empty", () => {
    const P = new Parser({});
    expect(P.parse(lit(""), "")).to.be.true;
    expect(P.parse(lit(""), "", {prefix: true})).to.be.true;
    expect(P.parse(lit(""), "x", {prefix: true})).to.be.true;
    expect(P.parse(lit(""), "x", {prefix: false})).to.be.false;
  });
  it("simple", () => {
    const P = new Parser({});
    expect(P.parse(lit("xx"), "xx")).to.be.true;
    expect(P.parse(lit("xx"), "xx", {prefix: true})).to.be.true;
    expect(P.parse(lit("xx"), "xxy", {prefix: true})).to.be.true;
    expect(P.parse(lit("xx"), "yxx")).to.be.false;
    expect(P.parse(lit("xx"), "xxy")).to.be.false;
  });
});

describe("regex", () => {
  it("atomic", () => {
    const P = new Parser({});
    expect(P.parse(/x/, "")).to.be.false;
    expect(P.parse(/x/y, "x")).to.be.true;
    expect(P.parse(/x/, "yx", {prefix: true})).to.be.false;
    expect(P.parse(/x/, "xy")).to.be.false;
    expect(P.parse(/x/, "xy", {prefix: true})).to.be.true;
    expect(P.parse(/x/, "yxy", {prefix: true})).to.be.false;
  });
  it("simple non-nullable", () => {
    const P = new Parser({});
    expect(P.parse(/x+yx*/, "xy")).to.be.true;
    expect(P.parse(/x+yx*/, "xyx")).to.be.true;
    expect(P.parse(/x+yx*/, "xxyx")).to.be.true;
    expect(P.parse(/x+yx*/, "xxyy")).to.be.false;
    expect(P.parse(/x+yx*/, "xxyy", {prefix: true})).to.be.true;
    expect(P.parse(/x+yx*/, "yxx")).to.be.false;
  });
});

describe("seq: no separator", () => {
  it("empty sequence", () => {
    const P = new Parser({});
    expect(P.parse(seq(), "")).to.be.true;
    expect(P.parse(seq(), "x")).to.be.false;
    expect(P.parse(seq(), "x", {prefix: true})).to.be.true;
  });
  it("non-empty", () => {
    const P = new Parser({});
    expect(P.parse(seq(lit("x")), "x")).to.be.true;
    expect(P.parse(seq(lit("x"), lit("x")), "xx")).to.be.true;
    expect(P.parse(seq(lit("x"), lit("y")), "xx")).to.be.false;
    expect(P.parse(seq(lit("x"), lit("y")), "xy")).to.be.true;
    expect(P.parse(seq(lit("xxx"), lit("yyy")), "xxxyyy")).to.be.true;
  });
  it("seq(lit('int'), /[a-z]/)", () => {
    const P = new Parser({});
    expect(P.parse(seq(lit("int"), /[a-z]/), "intx")).to.be.true;
  });
});

describe("rep0", () => {
  it("nulled", () => {
    const P = new Parser({});
    expect(P.parse(rep0(lit("x")), "")).to.be.true;
    expect(P.parse(rep0(lit("x")), "y")).to.be.false;
    expect(P.parse(rep0(lit("x")), "y", {prefix: true})).to.be.true;
  });
  it("once", () => {
    const P = new Parser({});
    expect(P.parse(rep0(lit("x")), "x")).to.be.true;
    expect(P.parse(rep0(lit("x")), "xy")).to.be.false;
    expect(P.parse(rep0(lit("x")), "xy", {prefix: true})).to.be.true;
  });
  it("twice", () => {
    const P = new Parser({});
    expect(P.parse(rep0(lit("x")), "xx")).to.be.true;
    expect(P.parse(rep0(lit("x")), "xxy")).to.be.false;
    expect(P.parse(rep0(lit("x")), "xxy", {prefix: true})).to.be.true;
  });
  it("thrice", () => {
    const P = new Parser({});
    expect(P.parse(rep0(lit("x")), "xxx")).to.be.true;
    expect(P.parse(rep0(lit("x")), "xxxy")).to.be.false;
    expect(P.parse(rep0(lit("x")), "xxxy", {prefix: true})).to.be.true;
  });
});

describe("rep1", () => {
  it("nulled", () => {
    const P = new Parser({});
    expect(P.parse(rep1(lit("x")), "")).to.be.false;
    expect(P.parse(rep1(lit("x")), "y")).to.be.false;
    expect(P.parse(rep1(lit("x")), "y", {prefix: true})).to.be.false;
  });
  it("once", () => {
    const P = new Parser({});
    expect(P.parse(rep1(lit("x")), "x")).to.be.true;
    expect(P.parse(rep1(lit("x")), "xy")).to.be.false;
    expect(P.parse(rep1(lit("x")), "xy", {prefix: true})).to.be.true;
  });
  it("twice", () => {
    const P = new Parser({});
    expect(P.parse(rep1(lit("x")), "xx")).to.be.true;
    expect(P.parse(rep1(lit("x")), "xxy")).to.be.false;
    expect(P.parse(rep1(lit("x")), "xxy", {prefix: true})).to.be.true;
  });
  it("thrice", () => {
    const P = new Parser({});
    expect(P.parse(rep1(lit("x")), "xxx")).to.be.true;
    expect(P.parse(rep1(lit("x")), "xxxy")).to.be.false;
    expect(P.parse(rep1(lit("x")), "xxxy", {prefix: true})).to.be.true;
  });
});

describe("opt", () => {
  it("simple", () => {
    const P = new Parser({});
    expect(P.parse(opt(lit("x")), "")).to.be.true;
    expect(P.parse(opt(lit("x")), "x")).to.be.true;
    expect(P.parse(opt(lit("x")), "y")).to.be.false;
    expect(P.parse(opt(lit("x")), "y", {prefix: true})).to.be.true;
  });
});

describe("alt", () => {
  it("x/y", () => {
    const P = new Parser({});
    expect(P.parse(alt(lit("x"), lit("y")), "")).to.be.false;
    expect(P.parse(alt(lit("x"), lit("y")), "x")).to.be.true;
    expect(P.parse(alt(lit("x"), lit("y")), "y")).to.be.true;
    expect(P.parse(alt(lit("x"), lit("y")), "z")).to.be.false;
  });
  it("longest match", () => {
    const P = new Parser({});
    expect(P.parse(alt(lit("xx"), lit("x")), "")).to.be.false;
    expect(P.parse(seq(alt(lit("xx"), lit("x")), lit("y")), "xy")).to.be.true;
    expect(P.parse(seq(alt(lit("xx"), lit("x")), lit("y")), "xxy")).to.be.true;
    expect(P.parse(seq(alt(lit("x"), lit("xx")), lit("y")), "xy")).to.be.true;
    expect(P.parse(seq(alt(lit("x"), lit("xx")), lit("y")), "xxy")).to.be.true;
  });
});

describe("not", () => {
  it("simple", () => {
    const P = new Parser({});
    expect(P.parse(not(lit("x")), "")).to.be.true;
    expect(P.parse(not(lit("x")), "y", {prefix: true})).to.be.true;
    expect(P.parse(not(lit("x")), "x")).to.be.false;
  });
});

describe("sequence with whitespace", () => {
  it("space", () => {
    const P = new Parser({ separators: { space: lit(" ") } });
    expect(P.parse([lit("x"), lit("y")], "xy")).to.be.true;
    expect(P.parse([lit("x"), lit("y")], " xy")).to.be.true;
    expect(P.parse([lit("x"), lit("y")], "x y")).to.be.true;
    expect(P.parse([lit("x"), lit("y")], " x y")).to.be.true;
    expect(P.parse([lit("x"), lit("y")], " x y ")).to.be.true;
  });
});

describe("keywords and identifiers", () => {
  const kwds: string[] = ["int", "do", "double"];
  const identifierChar: ParsingExpression = /[a-zA-Z0-9_]/;
  const id: ParsingExpression = identifier(/[a-zA-Z_][a-zA-Z0-9_]*/, kwds);

  it("keywords: int-ish", () => {
    const P = new Parser({});
    expect(P.parse(keyword("int", identifierChar), "i")).to.be.false;
    expect(P.parse(keyword("int", identifierChar), "int")).to.be.true;
    expect(P.parse(keyword("int", identifierChar), "intx", {prefix: true})).to.be.false;
    expect(P.parse(keyword("int", identifierChar), "integer")).to.be.false;
  });

  it("keywords: double-ish", () => {
    const P = new Parser({});
    const doOrDie = alt(keyword("do", identifierChar), keyword("double", identifierChar));
    expect(P.parse(doOrDie, "d")).to.be.false;
    expect(P.parse(doOrDie, "do")).to.be.true;
    expect(P.parse(doOrDie, "dou")).to.be.false;
    expect(P.parse(doOrDie, "double")).to.be.true;
    expect(P.parse(doOrDie, "doubles")).to.be.false;
    expect(P.parse(doOrDie, "double.", {prefix: true})).to.be.true;
  });

  it("identifiers: int-ish", () => {
    const P = new Parser({});
    expect(P.parse(id, "x")).to.be.true;
    expect(P.parse(id, "i")).to.be.true;
    expect(P.parse(id, "in")).to.be.true;
    expect(P.parse(id, "int")).to.be.false;
    expect(P.parse(not(keyword("int", identifierChar)), "i", {prefix: true})).to.be.true;
    expect(P.parse(not(keyword("int", identifierChar)), "int")).to.be.false;
    expect(P.parse(not(keyword("int", identifierChar)), "int.", {prefix: true})).to.be.false;
    expect(P.parse(keyword("int", identifierChar), "intx", {prefix: true})).to.be.false;
    expect(P.parse(not(keyword("int", identifierChar)), "intx", {prefix: true})).to.be.true;
    expect(P.parse(id, "integer")).to.be.true;
  });
});

describe("named rules", () => {
  it("basic named rule", () => {
    const P = new Parser({ rules: { A: lit("a") } });
    expect(P.parse("A", "a")).to.be.true;
  });

  it("recursive rule", () => {
    const P = new Parser({ rules: { A: seq(lit("a"), opt("A")) } });
    expect(P.parse("A", "a")).to.be.true;
    expect(P.parse("A", "aa")).to.be.true;
    expect(P.parse("A", "aaa")).to.be.true;
  });

  it("unknown rule", () => {
    const P = new Parser({ rules: { A: lit("a") } });
    expect(() => {
      P.parse("B", "a");
    }).to.throw("rule does not exist: B");
  });
});

describe("actions", () => {
  it("simple action", () => {
    const P = new Parser({});
    const v: number[] = [0];
    expect(
      P.parse(
        act(/[0-9]+/, (state: State, txt: Lazy<string>): boolean => {
          const s: string = txt.get();
          const t: string = txt.get();
          const n: number = Number(s);
          v[0] = n;
          return true;
        }),
        "123"
      )
    ).to.be.true;
    expect(v[0]).to.eql(123);
  });

  it("failing parse", () => {
    const P = new Parser({});
    expect(
      P.parse(
        act(/[0-9]+/, (state: State, txt: Lazy<string>): boolean => {
          return false;
        }),
        "abc"
      )
    ).to.be.false;
  });

  it("failing action", () => {
    const P = new Parser({});
    expect(
      P.parse(
        act(/[0-9]+/, (state: State, txt: Lazy<string>): boolean => {
          return false;
        }),
        "123"
      )
    ).to.be.false;
  });
});
