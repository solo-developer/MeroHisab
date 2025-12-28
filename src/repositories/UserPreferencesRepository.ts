import { getDatabase } from './Database';

export default class UserPreferencesRepository {
    static get(key: string): Promise<string | null> {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `SELECT value FROM UserPreferences WHERE key = ?;`,
                    [key],
                    (_: any, res: any) => {
                        if (res.rows.length > 0) {
                            resolve(res.rows.item(0).value);
                        } else {
                            resolve(null);
                        }
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    }

    static set(key: string, value: string): Promise<void> {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `INSERT OR REPLACE INTO UserPreferences (key, value) VALUES (?, ?);`,
                    [key, value],
                    () => resolve(),
                    (_: any, err: any) => reject(err)
                );
            });
        });
    }
}
