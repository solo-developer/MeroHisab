export default class Wallet {
  constructor(
    public name: string,
    public balance: number,
    public id?: number,
    public ledgerId?: number,
  ) {}
}
