type RBColour = "red" | "black";
type RBNode<T> = null | { kind: RBColour; key: string; value: T; lhs: RBNode<T>; rhs: RBNode<T> };

export class RBTree<T> {
  root: RBNode<T>;

  constructor(root: RBNode<T> = null) {
    this.root = root;
  }

  find(key: string): T | undefined {
    return this.findInner(key, this.root);
  }

  findInner(key: string, node: RBNode<T>): T | undefined {
    if (node == null) {
      return undefined;
    } else if (node.key == key) {
      return node.value;
    } else if (node.key > key) {
      return this.findInner(key, node.lhs);
    } else {
      return this.findInner(key, node.rhs);
    }
  }

  insertMany(items: [string, T][]): RBTree<T> {
    let node = this.root;
    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        node = this.insertInner(item[0], item[1], node);
        node.kind = "black";
    }
    return new RBTree<T>(node);
  }

  insert(key: string, value: T): RBTree<T> {
    const root = this.insertInner(key, value, this.root);
    root.kind = "black";
    return new RBTree(root);
  }

  insertInner(key: string, value: T, node: RBNode<T>): RBNode<T> {
    if (node == null) {
      return { kind: "red", key: key, value: value, lhs: null, rhs: null };
    } else if (node.key == key) {
      return { kind: node.kind, key: key, value: value, lhs: node.lhs, rhs: node.rhs };
    } else if (node.key > key) {
      const unbalanced = { kind: node.kind, key: node.key, value: node.value, lhs: this.insertInner(key, value, node.lhs), rhs: node.rhs };
      return this.balance(unbalanced);
    } else {
      const unbalanced = { kind: node.kind, key: node.key, value: node.value, lhs: node.lhs, rhs: this.insertInner(key, value, node.rhs) };
      return this.balance(unbalanced);
    }
  }

  balance(node: RBNode<T>): RBNode<T> {
    if (node != null && node.kind == "black") {
      if (node.lhs != null && node.lhs.kind == "red") {
        const z = node;
        const p = z.lhs;
        if (p.lhs != null && p.lhs.kind == "red") {
          const y = p;
          const x = p.lhs;
          const a = x.lhs;
          const b = x.rhs;
          const c = y.rhs;
          const d = z.rhs;
          const lhs: RBNode<T> = { kind: "black", key: x.key, value: x.value, lhs: a, rhs: b };
          const rhs: RBNode<T> = { kind: "black", key: z.key, value: z.value, lhs: c, rhs: d };
          return { kind: "red", key: y.key, value: y.value, lhs, rhs };
        }
        if (p.rhs != null && p.rhs.kind == "red") {
          const x = p;
          const y = p.rhs;
          const a = x.lhs;
          const b = y.lhs;
          const c = y.rhs;
          const d = z.rhs;
          const lhs: RBNode<T> = { kind: "black", key: x.key, value: x.value, lhs: a, rhs: b };
          const rhs: RBNode<T> = { kind: "black", key: z.key, value: z.value, lhs: c, rhs: d };
          return { kind: "red", key: y.key, value: y.value, lhs, rhs };
        }
      }
      if (node.rhs != null && node.rhs.kind == "red") {
        const x = node;
        const p = x.rhs;
        if (p.lhs != null && p.lhs.kind == "red") {
          const z = p;
          const y = p.lhs;
          const a = x.lhs;
          const b = y.lhs;
          const c = y.rhs;
          const d = z.rhs;
          const lhs: RBNode<T> = { kind: "black", key: x.key, value: x.value, lhs: a, rhs: b };
          const rhs: RBNode<T> = { kind: "black", key: z.key, value: z.value, lhs: c, rhs: d };
          return { kind: "red", key: y.key, value: y.value, lhs, rhs };
        }
        if (p.rhs != null && p.rhs.kind == "red") {
          const y = p;
          const z = p.rhs;
          const a = x.lhs;
          const b = y.lhs;
          const c = z.lhs;
          const d = z.rhs;
          const lhs: RBNode<T> = { kind: "black", key: x.key, value: x.value, lhs: a, rhs: b };
          const rhs: RBNode<T> = { kind: "black", key: z.key, value: z.value, lhs: c, rhs: d };
          return { kind: "red", key: y.key, value: y.value, lhs, rhs };
        }
      }
    }
    return node;
  }

  paths(): RBColour[][] {
    const res: RBColour[][] = [];
    this.pathsInner(this.root, [], res);
    return res;
  }

  pathsInner(node: RBNode<T>, ancs: RBColour[], paths: RBColour[][]): void {
    if (node == null) {
        paths.push([...ancs]);
        return;
    }
    ancs.push(node.kind);
    this.pathsInner(node.lhs, ancs, paths);
    this.pathsInner(node.rhs, ancs, paths);
    ancs.pop();
  }
}
