import { getDatabase } from '../repositories/Database';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export interface BackupData {
    version: string;
    timestamp: number;
    tables: {
        [tableName: string]: any[];
    };
}

export class BackupService {
    private static TABLES = [
        'Ledger',
        'LedgerDailyBalance',
        'categories',
        'CategoryBudgets',
        'wallets',
        'TransactionSummary',
        'TransactionEntry',
        'Transfer',
        'MetaCategory',
        'MetaCategoryItems',
        'Reminders',
        'Parties',
        'PartyBalance'
    ];

    /**
     * Creates a full data dump of the database
     */
    static async createBackup(): Promise<BackupData> {
        const db = getDatabase();
        const backup: BackupData = {
            version: '1.0',
            timestamp: Date.now(),
            tables: {}
        };

        for (const table of this.TABLES) {
            backup.tables[table] = await this.getTableData(db, table);
        }

        return backup;
    }

    private static getTableData(db: any, tableName: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(`SELECT * FROM ${tableName}`, [], (_: any, res: any) => {
                    const rows = [];
                    for (let i = 0; i < res.rows.length; i++) {
                        rows.push(res.rows.item(i));
                    }
                    resolve(rows);
                }, (_: any, err: any) => {
                    console.warn(`Failed to backup table ${tableName}:`, err);
                    resolve([]); // Continue with other tables
                });
            });
        });
    }

    /**
     * Restores the database from backup data
     */
    static async restoreBackup(backup: BackupData): Promise<void> {
        const db = getDatabase();

        // 1. Validate backup
        if (!backup.tables || typeof backup.tables !== 'object') {
            throw new Error('Invalid backup file format.');
        }

        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                // Disable foreign keys temporarily if supported, or just be careful with order
                // SQLite 2 (react-native-sqlite-2) might not support easy PRAGMA in same tx
                
                // Clear existing data (in reverse order of dependencies)
                const tablesToClear = [...this.TABLES].reverse();
                for (const table of tablesToClear) {
                    tx.executeSql(`DELETE FROM ${table}`);
                }

                // Insert new data
                for (const table of this.TABLES) {
                    const rows = backup.tables[table];
                    if (!rows || rows.length === 0) continue;

                    const columns = Object.keys(rows[0]);
                    const placeholders = columns.map(() => '?').join(',');
                    const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;

                    for (const row of rows) {
                        const values = columns.map(col => row[col]);
                        tx.executeSql(sql, values);
                    }
                }
            }, (err: any) => {
                console.error('Restore transaction failed:', err);
                reject(err);
            }, () => {
                console.log('Restore completed successfully');
                resolve();
            });
        });
    }

    /**
     * Saves backup to a local temporary file and returns the path
     */
    static async saveToTempFile(data: BackupData): Promise<string> {
        const fileName = `MeroHisab_Backup_${Date.now()}.mhb`; // .mhb for Mero Hisab Backup
        const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
        const json = JSON.stringify(data);
        await RNFS.writeFile(path, json, 'utf8');
        return path;
    }
}
