// src/services/CategoriesService.ts
import { getDatabase } from '../repositories/Database';
import CategoryRepository from '../repositories/CategoryRepository';
import { LedgerRepository } from '../repositories/LedgerRepository';

export interface CreateCategoryRequest {
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
}

export const CategoriesService = {

  createCategory(request: CreateCategoryRequest): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {

        /* -----------------------------
         * 1️⃣ Create ledger
         * ----------------------------- */
        LedgerRepository.create(
          tx,
          {
            name: request.name,
            type: request.type,
            isSystem: false,
          },
          (          ledgerId: any) => {

            /* -----------------------------
             * 2️⃣ Create category
             * ----------------------------- */
            CategoryRepository.add(
              {
                name: request.name,
                type: request.type,
                icon: request.icon,
                color: request.color,
                ledgerId,
              } as any,
            ).then(resolve).catch(reject);

          },
          reject
        );

      });
    });
  }

};
