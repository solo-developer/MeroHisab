/**
 * @format
 */

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
