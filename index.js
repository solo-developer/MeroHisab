/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Handle background events
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    // Check if the user pressed the notification
    if (type === EventType.PRESS && pressAction?.id === 'default') {
        // Logic to handle press even when app is closed can go here
        console.log('User pressed notification in background', notification);
    }
});

AppRegistry.registerComponent(appName, () => App);

const HeadlessTask = async (event) => {
    let taskId = event.taskId;
    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);
    const { RecurringTransactionService } = require('./src/services/RecurringTransactionService');
    await RecurringTransactionService.processPending();
    BackgroundFetch.finish(taskId);
}

const BackgroundFetch = require('react-native-background-fetch').default;
BackgroundFetch.registerHeadlessTask(HeadlessTask);
