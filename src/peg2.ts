import { uuid } from "uuidv4";

export class Lazy<T> {
  closure: () => T;
  value?: T;
  constructor(f: () => T) {
    this.closure = f;
    this.value = undefined;
  }

  get(): T {
    if (this.value == undefined) {
      this.value = this.closure();
    }
    return this.value;
  }
}

export abstract class State {
  abstract save(): any;

  abstract restore(saved: any): void;
}

export class NullState implements State {
  save(): any {
    return null;
  }

  restore(saved: any): void {
    // do nothing
  }
}

export const nullState = new NullState();

export type Action = (state: State, len: number, txt: Lazy<string>) => boolean | void;

export type ParsingExpression =
  | RegExp
  | ParsingExpression[]
  | { lit: string }
  | { seq: ParsingExpression[] }
  | { rep0: ParsingExpression }
  | { rep1: ParsingExpression }
  | { opt: ParsingExpression }
  | { sor: ParsingExpression[] }
  | { not: ParsingExpression }
  | { fwd: string };

function unlist<T>(a: T[]): T | T[] {
  if (a.length == 1) {
    return a[0];
  }
  return a;
}

export function lit(literal: string): ParsingExpression {
  return { lit: literal };
}

export function rep0(...args: ParsingExpression[]): ParsingExpression {
  return { rep0: unlist(args) };
}

export function rep1(...args: ParsingExpression[]): ParsingExpression {
  return { rep1: unlist(args) };
}

export function opt(...args: ParsingExpression[]): ParsingExpression {
  return { opt: unlist(args) };
}

export function seq(...args: ParsingExpression[]): ParsingExpression {
  return { seq: args };
}

export function sor(...args: ParsingExpression[]): ParsingExpression {
  return { sor: args };
}

export function not(...args: ParsingExpression[]): ParsingExpression {
  return { not: unlist(args) };
}

export function fwd(name: string): ParsingExpression {
  return { fwd: name };
}

export function assign(lhs: ParsingExpression, rhs: ParsingExpression): void {
  if (typeof lhs == "object" && "fwd" in lhs) {
    const fwd = lhs.fwd;
    if (Array.isArray(rhs)) {
      rhs = seq(rhs);
    }
    Object.assign(lhs, rhs);
    delete lhs.fwd;
    //console.log(`fwd=${fwd}, keys=${Object.keys(lhs)}`);
  } else {
    throw new Error(`attempt to overwrite a non-fwd expression.`);
  }
}

export function copy(exprn: ParsingExpression): ParsingExpression {
  if (Array.isArray(exprn)) {
    return [...exprn];
  }
  if (exprn instanceof RegExp) {
    return new RegExp(exprn);
  }
  if ("fwd" in exprn) {
    return seq(exprn);
  }
  return {...exprn};
}

export function apply(exprn: ParsingExpression, action: Action): void {
  if ("action" in exprn) {
    // If there's an existing action do it first.
    // This makes it easier to embed semantics oriented actions in the grammar,
    // and only invoke the parse-tree oriented actions if the semantic actions succeed.
    //
    const existing: Action = exprn.action as Action;
    const compoundAction: Action = (state: State, len: number, txt: Lazy<string>): boolean | void => {
      if (existing(state, len, txt) == false) {
        return false;
      }
      return action(state, len, txt);
    };
    Object.defineProperty(exprn, "action", { value: compoundAction });
    return;
  }
  Object.defineProperty(exprn, "action", { value: action });
}

export function label(exprn: ParsingExpression, lab: string) {
  //Object.defineProperty(exprn, "label", {value: lab});
}

export function identifier(exprn: ParsingExpression, keywords: string[]) {
  return seq(not(sor(...keywords.map((word) => keyword(word, exprn)))), exprn);
}

export function keyword(word: string, identifierCharacter: ParsingExpression) {
  return seq(lit(word), not(identifierCharacter));
}

class ParserState {
  text: string;
  position: number;
  state: State;

  constructor(text: string, state: State) {
    this.text = text;
    this.position = 0;
    this.state = state;
  }

  save(): { position: number; state: any } {
    return { position: this.position, state: this.state.save() };
  }

  restore(saved: { position: number; state: any }): void {
    this.position = saved.position;
    this.state.restore(saved.state);
  }
}

export interface ParserOptions {
  separators?: { [name: string]: ParsingExpression };
}

export interface ParsingOptions {
  prefix?: boolean;
  state?: State;
}

export class Parser {
  separators: { [name: string]: ParsingExpression };
  sep: ParsingExpression;

  constructor(opts?: ParserOptions) {
    if (opts && opts.separators) {
      this.separators = opts.separators;
    } else {
      this.separators = { whitespace: /[ \t\r\n\f\v]+/y };
    }
    this.sep = sor(...Object.entries(this.separators).map((x) => x[1]));
  }

  parse(exprn: ParsingExpression, text: string, options?: ParsingOptions): boolean {
    const all: boolean = !(options && options.prefix);
    const state: State = options && options.state ? options.state : nullState;
    const parserState: ParserState = new ParserState(text, state);
    if (!this.parseInner(exprn, parserState)) {
      return false;
    }
    return parserState.position == text.length || !all;
  }

  parseInner(exprn: ParsingExpression, state: ParserState): boolean {
    const wholeText: string = state.text;
    const beginPosition: number = state.position;
    if ("label" in exprn) {
      console.log(`parsing ${exprn.label}@${beginPosition}`);
    }
    const saved = state.save();
    const res = this.parseInnerInner(exprn, state);
    if (res && "action" in exprn) {
      const todo: Action = exprn.action as Action;
      const endPosition = state.position;
      const len: number = endPosition - beginPosition;
      const txt: Lazy<string> = new Lazy<string>(() => {
        return wholeText.substring(beginPosition, endPosition);
      });

      const actionRes = todo(state.state, len, txt);
      if (actionRes == false) {
        state.restore(saved);
        return false;
      }
      return true;
    }
    return res;
  }
  parseInnerInner(exprn: ParsingExpression, state: ParserState): boolean {
    // Sequences with optional separators
    //
    if (Array.isArray(exprn)) {
      const saved = state.save();
      while (this.parseInner(this.sep, state)) {
        // do nothing
      }
      for (const term of exprn) {
        if (!this.parseInner(term, state)) {
          state.restore(saved);
          return false;
        }
        while (this.parseInner(this.sep, state)) {
          // do nothing
        }
      }
      return true;
    }

    // Atomic regular expressions
    //
    if (exprn instanceof RegExp) {
      if (exprn.sticky == false) {
        exprn = new RegExp(exprn, "y");
      }
      exprn.lastIndex = state.position;
      const m = exprn.exec(state.text);
      if (m == null) {
        return false;
      }
      const len = m[0].length;
      state.position += len;
      return true;
    }

    // Literal strings
    //
    if ("lit" in exprn) {
      if (exprn.lit == state.text.substring(state.position, state.position + exprn.lit.length)) {
        state.position += exprn.lit.length;
        return true;
      }
      return false;
    }

    // Optional expression
    //
    if ("opt" in exprn) {
      const saved = state.save();
      if (this.parseInner(exprn.opt, state)) {
        return true;
      }
      state.restore(saved);
      return true;
    }

    // Kleene Star
    //
    if ("rep0" in exprn) {
      let lastPos = state.position;
      while (this.parseInner(exprn.rep0, state)) {
        if (state.position == lastPos) {
          throw new Error(`kleene star of nullable expression`);
        }
        lastPos = state.position;
      }
      return true;
    }

    // Kleene Plus
    //
    if ("rep1" in exprn) {
      if (!this.parseInner(exprn.rep1, state)) {
        return false;
      }
      let lastPos = state.position;
      while (this.parseInner(exprn.rep1, state)) {
        if (state.position == lastPos) {
          throw new Error(`kleene plus of nullable expression`);
        }
        lastPos = state.position;
      }
      return true;
    }

    // Sequence without separators
    //
    if ("seq" in exprn) {
      const saved = state.save();
      for (const term of exprn.seq) {
        if (!this.parseInner(term, state)) {
          state.restore(saved);
          return false;
        }
      }
      return true;
    }

    // Negated expressions
    //
    if ("not" in exprn) {
      const saved = state.save();
      const negRes = this.parseInner(exprn.not, state);
      state.restore(saved);
      return !negRes;
    }

    // choice to select longest successful match
    //
    if ("sor" in exprn) {
      // Try alternatives in order, and use the first one that succeeds,=.
      //
      const saved = state.save();
      for (const factor of exprn.sor) {
        state.restore(saved);
        if (this.parseInner(factor, state)) {
          return true;
        }
      }
      return false;
    }

    /* istanbul ignore else  */
    if ("fwd" in exprn) {
      throw new Error(`unassigned forwarding expression: ${exprn.fwd}`);
    }

    /* istanbul ignore next */
    throw new Error(`this should be unreachable exprn=${exprn}, tags=${JSON.stringify(Object.keys(exprn))}, typeof=${typeof exprn}, isarray=${Array.isArray(exprn)}`);
  }
}
