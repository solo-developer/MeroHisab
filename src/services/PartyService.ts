import { PartyRepository } from "../repositories/PartyRepository";
import { Party } from "../models/Party";
import { getDatabase } from "../repositories/Database";
import { TransactionSummaryRepository } from "../repositories/TransactionSummaryRepository";
import { TransactionEntryRepository } from "../repositories/TransactionEntryRepository";
import { WalletRepository } from "../repositories/WalletRepository";

export const PartyService = {
    getAllParties: async () => {
        return await PartyRepository.getAll();
    },

    createParty: async (name: string, type: 'debtor' | 'creditor', initialBalance: number) => {
        // TODO: Handle initial balance transaction creation logic here if needed (e.g. creating a dummy transaction to reflect opening balance in ledger)
        // For now, we just save the entity.
        return await PartyRepository.create({
             name,
             type,
             initialBalance,
             currentBalance: initialBalance
        } as any);
    },

    addTransaction: async (data: { type: 'payment' | 'receipt', partyId: number, walletId: number, amount: number, date: string, note?: string }) => {
        const db = getDatabase();
        
        return new Promise<void>((resolve, reject) => {
            db.transaction(async (tx) => {
                try {
                    // 1. Get Party and Wallet to confirm existence and get Ledger IDs
                    // Note: In SQLite-2 transaction wrapper, we might not be able to await async calls easily if they start new transactions.
                    // Ideally, repositories should support passing 'tx'. 
                    // Since existing repositories might separate tx logic, we will do direct SQL here or refactor repositories.
                    // For safety in this specific "transactional" requirement, I'll use direct SQL within this transaction block 
                    // to ensure atomicity, or use repository methods if they don't start new transactions (most do).
                    
                    // Actually, existing repo methods start their own transactions: `db.transaction(...)`. 
                    // Nested transactions in sqlite-2 might be tricky or just flatten. 
                    // Best approach for reliability here: Use direct logic or update repositories to accept optional 'tx'.
                    // Given the constraint, I'll extend PartyService to handle the full flow to ensure consistency.

                    // A. Create Transaction Summary
                    TransactionSummaryRepository.create(tx, {
                        type: data.type,
                        date: data.date,
                        amount: data.amount,
                        note: data.note,
                        categoryId: undefined // No category for party payment/receipt in this simple model? Or maybe a generic one?
                    }, 
                    (summaryId) => {
                         // Callback hell style because of the library
                         
                         // Get Wallet Ledger ID
                         tx.executeSql(`SELECT ledgerId, balance FROM wallets WHERE id = ?`, [data.walletId], (_, walletRes) => {
                             if (walletRes.rows.length === 0) { throw new Error("Wallet not found"); }
                             const wallet = walletRes.rows.item(0);
                             const walletLedgerId = wallet.ledgerId;
                             const currentWalletBalance = wallet.balance;

                             // Get Party Ledger ID and current balance from PartyBalance
                             tx.executeSql(`SELECT p.ledgerId, COALESCE(pb.currentBalance, 0) as currentBalance 
                                            FROM Parties p 
                                            LEFT JOIN PartyBalance pb ON p.id = pb.partyId 
                                            WHERE p.id = ?`, [data.partyId], (_, partyRes) => {
                                 if (partyRes.rows.length === 0) { throw new Error("Party not found"); }
                                 const party = partyRes.rows.item(0);
                                 const partyLedgerId = party.ledgerId;
                                 const currentPartyBalance = party.currentBalance;

                                 // Define Debits and Credits
                                 // Payment (Pay to Creditor): Party Dr (Liability Down), Wallet Cr (Asset Down)
                                 // Receipt (Receive from Debtor): Wallet Dr (Asset Up), Party Cr (Asset Down)

                                 let walletEntryType: 'debit' | 'credit';
                                 let partyEntryType: 'debit' | 'credit';
                                 let newWalletBalance = currentWalletBalance;
                                 let newPartyBalance = currentPartyBalance;

                                 if (data.type === 'payment') {
                                     // Paying a party (usually creditor, decreasing liability)
                                     partyEntryType = 'debit';
                                     walletEntryType = 'credit';
                                     newWalletBalance -= data.amount;
                                     // For creditor: Balance is amount to PAY. If we pay, balance decreases.
                                     // For debtor: Balance is amount to RECEIVE. If we pay them (refund?), balance decreases (or becomes negative).
                                     // Let's assume positive balance means "Amount to Pay" for Creditor, "Amount to Receive" for Debtor.
                                     newPartyBalance -= data.amount; 
                                 } else {
                                     // Receipt from party (usually debtor, decreasing asset)
                                     walletEntryType = 'debit';
                                     partyEntryType = 'credit';
                                     newWalletBalance += data.amount;
                                     newPartyBalance -= data.amount;
                                 }

                                 // B. Create Transaction Entries
                                 // 1. Wallet Entry
                                 TransactionEntryRepository.create(tx, {
                                     transactionSummaryId: summaryId,
                                     ledgerId: walletLedgerId,
                                     entryType: walletEntryType,
                                     amount: data.amount
                                 }, () => {}, (e) => console.error(e));

                                 // 2. Party Entry
                                 TransactionEntryRepository.create(tx, {
                                     transactionSummaryId: summaryId,
                                     ledgerId: partyLedgerId,
                                     entryType: partyEntryType,
                                     amount: data.amount
                                 }, () => {}, (e) => console.error(e));

                                 // C. Update Balances
                                 tx.executeSql(`UPDATE wallets SET balance = ? WHERE id = ?`, [newWalletBalance, data.walletId]);
                                 tx.executeSql(`INSERT OR REPLACE INTO PartyBalance (partyId, currentBalance, lastUpdated) 
                                                VALUES (?, ?, CURRENT_TIMESTAMP)`, [data.partyId, newPartyBalance]);

                                 resolve();
                             }, (e) => { reject(e); return false; });
                         }, (e) => { reject(e); return false; });
                    },
                    (error) => { reject(error); });

                } catch (error) {
                    reject(error);
                }
            });
        });
    },

    deleteParty: async (id: number) => {
        return await PartyRepository.delete(id);
    }
};
