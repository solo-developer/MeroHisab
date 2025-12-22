export default class Category {
  id?: number;
  name: string;
  type: 'Income' | 'Expense';
  icon: string;
  color: string;
  ledgerId: number; 

  constructor(
    name: string,
    type: 'Income' | 'Expense',
    icon: string = 'category',
    color: string = '#4CAF50',
    id?: number,
    ledgerId?: number
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.icon = icon;
    this.color = color;

    if (ledgerId === undefined || ledgerId === null) {
      throw new Error('Category must be linked to a ledger');
    }

    this.ledgerId = ledgerId;
  }
}
