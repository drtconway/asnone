export type Stack<T> = [] | [T, Stack<T>];

export function empty<T>(l: Stack<T>): boolean {
  return l.length == 0;
}

export function cons<T>(h: T, t: Stack<T>): Stack<T> {
  return [h, t];
}

export function head<T>(l: Stack<T>): T {
  if (l.length == 0) {
    throw new Error(`tail of empty list.`);
  }
  return l[0];
}

export function tail<T>(l: Stack<T>): Stack<T> {
  if (l.length == 0) {
    throw new Error(`tail of empty list.`);
  }
  return l[1];
}

export function decons<T>(l: Stack<T>): [T, Stack<T>] {
  if (l.length == 0) {
    throw new Error(`decons of empty list`);
  }
  return l;
}

export function pop1<T>(l: Stack<T>): [T, Stack<T>] {
  return decons<T>(l);
}

export function pop2<T>(l: Stack<T>): [T, T, Stack<T>] {
  const [v2, l1] = decons(l);
  const [v1, l2] = decons(l1);
  return [v1, v2, l2];
}

export function pop3<T>(l: Stack<T>): [T, T, T, Stack<T>] {
  const [v3, l1] = decons(l);
  const [v2, l2] = decons(l1);
  const [v1, l3] = decons(l2);
  return [v1, v2, v3, l3];
}

export function pop4<T>(l: Stack<T>): [T, T, T, T, Stack<T>] {
  const [v4, l1] = decons(l);
  const [v3, l2] = decons(l1);
  const [v2, l3] = decons(l2);
  const [v1, l4] = decons(l3);
  return [v1, v2, v3, v4, l4];
}

export function toArray<T>(l: Stack<T>): T[] {
  const res: T[] = [];
  while (true) {
    if (l.length == 0) {
      break;
    }
    res.push(l[0]);
    l = l[1];
  }
  return res;
}
