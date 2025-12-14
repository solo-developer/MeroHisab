export default class Wallet {
  constructor(
    public name: string,
    public balance: number = 0,
    public id?: number
  ) {}
}
