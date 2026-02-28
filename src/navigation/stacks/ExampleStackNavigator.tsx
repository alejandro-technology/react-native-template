import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import LandingView from '@modules/examples/ui/LandingView';
import TextsView from '@modules/examples/ui/TextsView';
import ButtonsView from '@modules/examples/ui/ButtonsView';
import TextInputsView from '@modules/examples/ui/TextInputsView';
import CardsView from '@modules/examples/ui/CardsView';
import CheckboxesView from '@modules/examples/ui/CheckboxesView';
import ModalsView from '@modules/examples/ui/ModalsView';
import SignInView from '@modules/authentication/ui/SignInView';
// Routes
import {
  ExamplesRoutes,
  ExamplesStackParamList,
} from '@navigation/routes/examples.routes';

const Stack = createNativeStackNavigator<ExamplesStackParamList>();

export default function ExamplesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={ExamplesRoutes.Landing} component={LandingView} />
      <Stack.Screen name={ExamplesRoutes.Texts} component={TextsView} />
      <Stack.Screen name={ExamplesRoutes.Buttons} component={ButtonsView} />
      <Stack.Screen
        name={ExamplesRoutes.TextInputs}
        component={TextInputsView}
      />
      <Stack.Screen name={ExamplesRoutes.Cards} component={CardsView} />
      <Stack.Screen
        name={ExamplesRoutes.Checkboxes}
        component={CheckboxesView}
      />
      <Stack.Screen name={ExamplesRoutes.Modals} component={ModalsView} />
      <Stack.Screen name={ExamplesRoutes.SignIn} component={SignInView} />
    </Stack.Navigator>
  );
}
