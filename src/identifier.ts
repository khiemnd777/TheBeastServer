export class Iditifier {
  static id: number = 0;
  static EMPTY = 0;
  static raw(): number {
    return this.id++;
  }
}
