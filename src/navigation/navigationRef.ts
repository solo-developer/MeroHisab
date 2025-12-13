import { createNavigationContainerRef } from '@react-navigation/native';

export type SwipeTabRoutes =
  | 'Dashboard'
  | 'Transactions'
  | 'Reports'
  | 'Settings';

export const navigationRef = createNavigationContainerRef();
