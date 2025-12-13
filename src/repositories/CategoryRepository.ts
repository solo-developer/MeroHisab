import Category from '../models/Category';
import { getDatabase } from './Database';

export default class CategoryRepository {
  private static getDB() {
    return getDatabase();
  }

  static getAllCategories(): Promise<Category[]> {
    const db = this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM categories;',
          [],
          (_, result) => {
            const categories: Category[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              categories.push(new Category(row.name, row.type, row.icon, row.color, row.id));
            }
            resolve(categories);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  static addCategory(category: Category): Promise<number> {
    const database = this.getDB();
    return new Promise((resolve, reject) => {
      database.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?);',
          [category.name, category.type, category.icon, category.color],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      });
    });
  }

  static updateCategory(category: Category): Promise<number> {
    if (!category.id) throw new Error('Category ID is missing');
    const database = this.getDB();
    return new Promise((resolve, reject) => {
      database.transaction((tx) => {
        tx.executeSql(
          'UPDATE categories SET name=?, type=?, icon=?, color=? WHERE id=?;',
          [category.name, category.type, category.icon, category.color, category.id],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      });
    });
  }

  static deleteCategory(id: number): Promise<number> {
    const database = this.getDB();
    return new Promise((resolve, reject) => {
      database.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM categories WHERE id=?;',
          [id],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      });
    });
  }
}
