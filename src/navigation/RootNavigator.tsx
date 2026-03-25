import React from 'react';
// Stacks
import PublicNavigator from './stacks/PublicStackNavigator';
import PrivateNavigator from './stacks/PrivateStackNavigator';
// Hooks
import { useAuth } from '@modules/authentication';

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <PrivateNavigator />;
  }

  return <PublicNavigator />;
}
