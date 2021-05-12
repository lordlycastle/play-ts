export class Pair<E, T> {
  constructor(private readonly left: E, private readonly right: T) {}

  public map<S>(f: (arg: T) => S): Pair<E, S> {
    return new Pair<E, S>(this.left, f(this.right));
  }

  public mapLeft<F>(f: (arg: E) => F): Pair<F, T> {
    return new Pair<F, T>(f(this.left), this.right);
  }

  public bimap<F, S>(f: (arg: E) => F, g: (arg: T) => S): Pair<F, S> {
    return new Pair<F, S>(f(this.left), g(this.right));
  }

  public getRight(): T {
    return this.right;
  }

  public getLeft(): E {
    return this.left;
  }
}
