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

export type Action = (state: State, txt: Lazy<string>) => boolean | void;

export type ParsingExpression =
  | string
  | RegExp
  | ParsingExpression[]
  | { lit: string }
  | { seq: ParsingExpression[] }
  | { rep0: ParsingExpression }
  | { rep1: ParsingExpression }
  | { opt: ParsingExpression }
  | { alt: ParsingExpression[] }
  | { sor: ParsingExpression[] }
  | { not: ParsingExpression }
  | { act: { exprn: ParsingExpression; action: Action } }
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

export function alt(...args: ParsingExpression[]): ParsingExpression {
  return { alt: args };
}

export function sor(...args: ParsingExpression[]): ParsingExpression {
  return { sor: args };
}

export function not(...args: ParsingExpression[]): ParsingExpression {
  return { not: unlist(args) };
}

export function act(exprn: ParsingExpression, action: Action): ParsingExpression {
  return { act: { exprn, action } };
}

export function fwd(name: string): ParsingExpression {
  return { fwd: name };
}

export function assign(lhs: ParsingExpression, rhs: ParsingExpression): void {
  if (typeof rhs == "string") {
    throw new Error(`assigning a named rule to a forward declaration is not supported.`);
  }
  if (typeof lhs == "object" && "fwd" in lhs) {
    Object.assign(lhs, rhs);
    delete lhs.fwd;
  } else {
    throw new Error(`attempt to overwrite a non-fwd expression.`);
  }
}

export function apply(exprn: ParsingExpression, action: Action): void {
  Object.defineProperty(exprn, "action", {value: action, writable: false});
}

export function identifier(exprn: ParsingExpression, keywords: string[]) {
  return seq(not(alt(...keywords.map((word) => keyword(word, exprn)))), exprn);
}

export function keyword(word: string, identifierCharacter: ParsingExpression) {
  return seq(lit(word), not(identifierCharacter));
}

class ParserState {
  text: string;
  position: number;
  state: State;
  skip: boolean;

  constructor(text: string, state: State) {
    this.text = text;
    this.position = 0;
    this.state = state;
    this.skip = false;
  }

  save(): { position: number; skip: boolean; state: any } {
    return { position: this.position, skip: this.skip, state: this.state.save() };
  }

  restore(saved: { position: number; skip: boolean; state: any }): void {
    this.position = saved.position;
    this.state.restore(saved.state);
    this.skip = saved.skip;
  }
}

export interface ParserOptions {
  rules?: { [name: string]: ParsingExpression };
  separators?: { [name: string]: ParsingExpression };
  actions?: { [name: string]: Action };
}

export interface ParsingOptions {
  prefix?: boolean;
  state?: State;
}

export class Parser {
  rules: { [name: string]: ParsingExpression };
  separators: { [name: string]: ParsingExpression };
  actions: { [name: string]: Action };
  sep: ParsingExpression;

  constructor(opts?: ParserOptions) {
    if (opts && opts.rules) {
      this.rules = opts.rules;
    } else {
      this.rules = {};
    }

    if (opts && opts.separators) {
      this.separators = opts.separators;
    } else {
      this.separators = { whitespace: /[ \t\r\n\f\v]+/y };
    }
    this.sep = alt(...Object.entries(this.separators).map((x) => x[1]));

    if (opts && opts.actions) {
      this.actions = opts.actions;
    } else {
      this.actions = {};
    }
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
    // Named rules
    //
    if (typeof exprn == "string") {
      if (!(exprn in this.rules)) {
        throw new Error(`rule does not exist: ${exprn}`);
      }
      const wholeText = state.text;
      const beginPosition = state.position;
      const saved = state.save();
      const res = this.parseInner(this.rules[exprn], state);
      if (res && !state.skip && exprn in this.actions) {
        const endPosition = state.position;
        const txt: Lazy<string> = new Lazy<string>(() => {
          return wholeText.substring(beginPosition, endPosition);
        });

        const actRes = this.actions[exprn](state.state, txt);
        if (actRes == false) {
          state.restore(saved);
        }
      }
      return res;
    }

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
      while (this.parseInner(exprn.rep0, state)) {
        // do nothing
      }
      return true;
    }

    // Kleene Plus
    //
    if ("rep1" in exprn) {
      if (!this.parseInner(exprn.rep1, state)) {
        return false;
      }
      while (this.parseInner(exprn.rep1, state)) {
        // do nothing
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
    if ("alt" in exprn) {
      const saved = state.save();
      const startPosition = state.position;
      let bestPosition = startPosition - 1;
      let bestAlternative: ParsingExpression | null = null;
      for (const factor of exprn.alt) {
        state.restore(saved);
        state.skip = true;
        if (this.parseInner(factor, state)) {
          if (state.position > bestPosition) {
            bestPosition = state.position;
            bestAlternative = factor;
          }
        }
      }
      state.restore(saved);
      if (bestAlternative != null) {
        return this.parseInner(bestAlternative, state);
      }
      return false;
    }

    // Actions
    //
    /* istanbul ignore else  */
    if ("act" in exprn) {
      const ex = exprn.act.exprn;
      const act = exprn.act.action;
      const wholeText = state.text;
      const beginPosition = state.position;
      const saved = state.save();
      if (!this.parseInner(ex, state)) {
        return false;
      }
      if (state.skip) {
        return true;
      }
      const endPosition = state.position;
      const txt: Lazy<string> = new Lazy<string>(() => {
        return wholeText.substring(beginPosition, endPosition);
      });
      const res = act(state.state, txt);
      if (res == false) {
        state.restore(saved);
      }
      return res != false;
    }

    /* istanbul ignore next */
    throw new Error(`this should be unreachable exprn=${JSON.stringify(exprn)}`);
  }
}
