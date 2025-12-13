// models/Category.ts
export default class Category {
  id?: number;
  name: string;
  type: 'Income' | 'Expense';
  icon: string;
  color: string;

  constructor(
    name: string,
    type: 'Income' | 'Expense',
    icon: string = 'category',
    color: string = '#4CAF50',
    id?: number
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.icon = icon;
    this.color = color;
  }
}
