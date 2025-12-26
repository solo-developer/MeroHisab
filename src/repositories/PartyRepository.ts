import { getDatabase } from './Database';
import { Party } from '../models/Party';
import { LedgerRepository } from './LedgerRepository';

export const PartyRepository = {
  create: async (party: Omit<Party, 'id' | 'ledgerId'>): Promise<number> => {
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
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
                (tx, results) => {
                    const partyId = results.insertId;
                    
                    // 3. Create initial balance record
                    tx.executeSql(
                        `INSERT INTO PartyBalance (partyId, currentBalance) VALUES (?, ?)`,
                        [partyId, party.initialBalance],
                        () => resolve(partyId),
                        (error) => {
                            console.error('Error creating party balance', error);
                            resolve(0);
                        }
                    );
                },
                (error) => {
                    console.error('Error creating party', error);
                    resolve(0);
                }
            );
        }, (error) => {
            console.error('Error creating ledger', error);
            resolve(0);
        });
      });
    });
  },

  getAll: async (): Promise<Party[]> => {
    const db = getDatabase();
    return new Promise((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT p.*, COALESCE(pb.currentBalance, 0) as currentBalance 
           FROM Parties p 
           LEFT JOIN PartyBalance pb ON p.id = pb.partyId 
           WHERE p.deletedAt IS NULL`,
          [],
          (tx, results) => {
            const parties: Party[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              parties.push(results.rows.item(i));
            }
            resolve(parties);
          },
          (error) => {
            console.error('Error fetching parties', error);
            resolve([]);
          }
        );
      });
    });
  },

  getById: async (id: number): Promise<Party | null> => {
     const db = getDatabase();
    return new Promise((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT p.*, COALESCE(pb.currentBalance, 0) as currentBalance 
           FROM Parties p 
           LEFT JOIN PartyBalance pb ON p.id = pb.partyId 
           WHERE p.id = ?`,
          [id],
          (tx, results) => {
              if (results.rows.length > 0) {
                  resolve(results.rows.item(0));
              } else {
                  resolve(null);
              }
          },
          (error) => {
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
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO PartyBalance (partyId, currentBalance, lastUpdated) 
           VALUES (?, ?, CURRENT_TIMESTAMP)`,
          [id, newBalance],
          () => resolve(true),
          (error) => {
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
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE Parties SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          [id],
          () => resolve(),
          (error) => {
            console.error('Error deleting party', error);
            resolve();
          }
        );
      });
    });
  }
};
