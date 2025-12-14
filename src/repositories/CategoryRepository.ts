// src/repositories/CategoryRepository.ts
import { getDatabase } from './Database';
import Category from '../models/Category';

export default class CategoryRepository {

  static getAll(): Promise<Category[]> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          SELECT id, name, type, icon, color, ledgerId
          FROM categories
          WHERE deletedAt IS NULL
          ORDER BY name;
          `,
          [],
          (_, res) => {
            const categories: Category[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              const r = res.rows.item(i);
              categories.push(
                new Category(
                  r.name,
                  r.type,
                  r.icon,
                  r.color,
                  r.id,
                  r.ledgerId
                )
              );
            }
            resolve(categories);
          },
          (_, err) => reject(err),
        );
      });
    });
  }

  static add(category: Category): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          INSERT INTO categories (name, type, icon, color, ledgerId)
          VALUES (?, ?, ?, ?, ?);
          `,
          [
            category.name,
            category.type,
            category.icon,
            category.color,
            category.ledgerId,
          ],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }

  static update(category: Category): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          UPDATE categories
          SET name = ?, icon = ?, color = ?
          WHERE id = ? AND deletedAt IS NULL;
          `,
          [
            category.name,
            category.icon,
            category.color,
            category.id,
          ],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }

  static delete(id: number): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          UPDATE categories
          SET deletedAt = CURRENT_TIMESTAMP
          WHERE id = ? AND deletedAt IS NULL;
          `,
          [id],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }
}
