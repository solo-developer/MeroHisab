import { createNavigationContainerRef } from '@react-navigation/native';

export type SwipeTabRoutes =
  | 'Dashboard'
  | 'Transactions'
  | 'Analysis'
  | 'Reports';

export const navigationRef = createNavigationContainerRef();
