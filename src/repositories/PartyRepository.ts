import { getDatabase } from './Database';
import { Party } from '../models/Party';
import { LedgerRepository } from './LedgerRepository';

interface SearchOptions {
    filterType?: 'debtor' | 'creditor' | 'all';
    searchQuery?: string;
    limit?: number;
    offset?: number;
}

export const PartyRepository = {
  create: async (party: Omit<Party, 'id' | 'ledgerId'>): Promise<number> => {
    const db = getDatabase();
    
    return new Promise((resolve) => {
      db.transaction((tx: any) => {
        // 1. Create a Ledger for the party
        const ledgerType = party.type === 'debtor' ? 'asset' : 'liability';
        LedgerRepository.create(tx, {
            name: party.name,
            type: ledgerType,
            isSystem: false
        }, (ledgerId) => {
            // 2. Create the Party record
            tx.executeSql(
                `INSERT INTO Parties (name, type, initialBalance, ledgerId) VALUES (?, ?, ?, ?)`,
                [
                    party.name,
                    party.type,
                    party.initialBalance,
                    ledgerId
                ],
                (tx: any, results: any) => {
                    const partyId = results.insertId;
                    
                    // 3. Create initial balance record
                    tx.executeSql(
                        `INSERT INTO PartyBalance (partyId, currentBalance) VALUES (?, ?)`,
                        [partyId, party.initialBalance],
                        () => resolve(partyId),
                        (error: any) => {
                            console.error('Error creating party balance', error);
                            resolve(0);
                        }
                    );
                },
                (error: any) => {
                    console.error('Error creating party', error);
                    resolve(0);
                }
            );
        }, (error: any) => {
            console.error('Error creating ledger', error);
            resolve(0);
        });
      });
    });
  },

  getAll: async (): Promise<Party[]> => {
    const db = getDatabase();
    return new Promise((resolve) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT p.*, COALESCE(pb.currentBalance, 0) as currentBalance 
           FROM Parties p 
           LEFT JOIN PartyBalance pb ON p.id = pb.partyId 
           WHERE p.deletedAt IS NULL`,
          [],
          (tx: any, results: any) => {
            const parties: Party[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              parties.push(results.rows.item(i));
            }
            resolve(parties);
          },
          (error: any) => {
            console.error('Error fetching parties', error);
            resolve([]);
          }
        );
      });
    });
  },

  search: async (options: SearchOptions): Promise<Party[]> => {
      const db = getDatabase();
      const { filterType = 'all', searchQuery = '', limit = 50, offset = 0 } = options;
  
      return new Promise((resolve) => {
        db.transaction((tx: any) => {
          let query = `SELECT p.id, p.name, p.type, COALESCE(pb.currentBalance, 0) as currentBalance 
                       FROM Parties p 
                       LEFT JOIN PartyBalance pb ON p.id = pb.partyId 
                       WHERE p.deletedAt IS NULL`;
          const params: any[] = [];
  
          if (filterType !== 'all') {
            query += ` AND p.type = ?`;
            params.push(filterType);
          }
  
          if (searchQuery) {
            query += ` AND (p.name LIKE ?)`;
            params.push(`%${searchQuery}%`);
          }
  
          query += ` ORDER BY p.name ASC LIMIT ? OFFSET ?`;
          params.push(limit, offset);
  
          tx.executeSql(query, params, (_: any, results: any) => {
            const data: Party[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              data.push(results.rows.item(i));
            }
            resolve(data);
          }, (err: any) => {
              console.error(err);
              resolve([]);
          });
        });
      });
    },

  getById: async (id: number): Promise<Party | null> => {
     const db = getDatabase();
    return new Promise((resolve) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT p.*, COALESCE(pb.currentBalance, 0) as currentBalance 
           FROM Parties p 
           LEFT JOIN PartyBalance pb ON p.id = pb.partyId 
           WHERE p.id = ?`,
          [id],
          (tx: any, results: any) => {
              if (results.rows.length > 0) {
                  resolve(results.rows.item(0));
              } else {
                  resolve(null);
              }
          },
          (error: any) => {
            console.error('Error fetching party', error);
            resolve(null);
          }
        );
      });
    });
  },

  updateBalance: async (id: number, newBalance: number) => {
     const db = getDatabase();
    return new Promise((resolve) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO PartyBalance (partyId, currentBalance, lastUpdated) 
           VALUES (?, ?, CURRENT_TIMESTAMP)`,
          [id, newBalance],
          () => resolve(true),
          (error: any) => {
            console.error('Error updating party balance', error);
            resolve(false);
          }
        );
      });
    });
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    return new Promise((resolve) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `UPDATE Parties SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          [id],
          () => resolve(),
          (error: any) => {
            console.error('Error deleting party', error);
            resolve();
          }
        );
      });
    });
  }
};
