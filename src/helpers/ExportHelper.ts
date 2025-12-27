import { Alert, Platform, PermissionsAndroid } from 'react-native';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import notifee, { AndroidImportance } from '@notifee/react-native';

export class ExportHelper {
    /**
     * Exports data to an Excel (.xlsx) file. 
     * On Android, it attempts to save directly to the Downloads folder and shows a notification.
     * On iOS or as a fallback, it opens the system share dialog.
     */
    static async exportReport(reportName: string, data: any[]) {
        if (!data || data.length === 0) {
            Alert.alert('Export', 'No data available to export.');
            return;
        }

        try {
            // 1. Process data for Excel
            const processedData = this.prepareData(data);
            
            // 2. Create Workbook and Worksheet
            const ws = XLSX.utils.json_to_sheet(processedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Report');
            
            // 3. Generate XLSX binary (as base64)
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            
            const fileName = `${reportName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;

            // 4. Handle Android Direct Download
            if (Platform.OS === 'android') {
                const hasPermission = await this.requestAndroidPermission();
                if (hasPermission) {
                    try {
                        const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
                        await RNFS.writeFile(downloadPath, wbout, 'base64');
                        
                        // Show notification
                        await this.showDownloadNotification(fileName, downloadPath);

                        Alert.alert(
                            'Success', 
                            `File downloaded successfully to your Downloads folder:\n\n${fileName}`,
                            [
                                { text: 'OK' },
                                { 
                                    text: 'Share instead', 
                                    onPress: () => this.shareFile(fileName, wbout, reportName) 
                                }
                            ]
                        );
                        return;
                    } catch (err) {
                        console.warn('Direct download failed, falling back to share:', err);
                    }
                }
            }
            
            // 5. Fallback or iOS: Share the file
            await this.shareFile(fileName, wbout, reportName);
            
        } catch (error: any) {
            console.error('Export Error:', error);
            if (error.message && error.message.includes('User did not share')) {
                return;
            }
            this.fallbackToCSV(reportName, data);
        }
    }

    /**
     * Shows a system notification on Android when a file is downloaded.
     */
    private static async showDownloadNotification(fileName: string, filePath: string) {
        if (Platform.OS !== 'android') return;

        try {
            // Request permissions (required for Android 13+)
            await notifee.requestPermission();

            // Create a channel (required for Android)
            const channelId = await notifee.createChannel({
                id: 'downloads',
                name: 'File Downloads',
                importance: AndroidImportance.HIGH,
            });

            // Display a notification
            await notifee.displayNotification({
                title: 'Download Complete',
                body: `${fileName} has been saved to your Downloads folder.`,
                android: {
                    channelId,
                    importance: AndroidImportance.HIGH,
                    pressAction: {
                      id: 'default',
                    },
                },
            });
        } catch (err) {
            console.error('Failed to show notification:', err);
        }
    }

    private static async shareFile(fileName: string, base64Data: string, reportName: string) {
        try {
            // Save to cache first to get a file URI for sharing (more reliable on Android)
            const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
            await RNFS.writeFile(cachePath, base64Data, 'base64');

            const shareOptions = {
                title: reportName,
                url: Platform.OS === 'android' ? `file://${cachePath}` : `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`,
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: fileName,
            };

            await Share.open(shareOptions);
        } catch (err) {
            console.error('Sharing failed:', err);
        }
    }

    private static async requestAndroidPermission() {
        if (Platform.OS !== 'android') return true;
        
        // On Android 13+ (API 33), WRITE_EXTERNAL_STORAGE is not needed for Downloads if using some APIs, 
        // but RNFS might still need it or it might just work.
        if (Number(Platform.Version) >= 33) return true;

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'Permission is required to save reports to your Downloads folder.',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            return false;
        }
    }

    private static prepareData(data: any[]): any[] {
        if (!data || data.length === 0) return [];

        return data.map(item => {
            const flat: any = {};
            for (const key in item) {
                let val = item[key];
                
                // Skip internal metadata
                if (key.startsWith('_')) continue;
                
                // Exclude IDs (Primary keys or integer ID values)
                const lowerKey = key.toLowerCase();
                const isIdField = lowerKey === 'id' || lowerKey.endsWith('id') || lowerKey.endsWith('_id') || lowerKey === 'pk';
                
                if (isIdField) {
                    // Skip if it's an integer or a string that looks like an integer ID
                    if (typeof val === 'number' && Number.isInteger(val)) continue;
                    if (typeof val === 'string' && /^\d+$/.test(val)) continue;
                }
                
                // Format dates
                if (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))) {
                    val = new Date(val).toLocaleDateString() + ' ' + new Date(val).toLocaleTimeString();
                }

                // Extract readable names from objects
                if (val && typeof val === 'object') {
                    if (val.name) val = val.name;
                    else if (val.label) val = val.label;
                    else val = JSON.stringify(val);
                }

                // Friendly column name
                const friendlyKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                flat[friendlyKey] = val;
            }
            return flat;
        });
    }

    private static async fallbackToCSV(reportName: string, data: any[]) {
        try {
            const csv = this.convertToCSV(data);
            await Share.open({
                message: csv,
                title: `${reportName} (CSV)`,
                type: 'text/csv',
            });
        } catch (e) {
            Alert.alert('Export Error', 'Failed to generate output.');
        }
    }

    private static convertToCSV(data: any[]): string {
        const processed = this.prepareData(data);
        if (processed.length === 0) return '';
        
        const headers = Object.keys(processed[0]);
        const rows = processed.map(obj => 
            headers.map(h => {
                let v = obj[h] || '';
                v = v.toString().replace(/"/g, '""');
                return v.includes(',') || v.includes('\n') ? `"${v}"` : v;
            }).join(',')
        );
        const BOM = '\uFEFF';
        return BOM + [headers.join(','), ...rows].join('\n');
    }
}


