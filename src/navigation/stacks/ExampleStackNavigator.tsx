import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import LandingView from '@modules/examples/ui/LandingView';
import AnimationExampleView from '@modules/examples/ui/AnimationExampleView';
import SimpsonsListView from '@modules/examples/ui/SimpsonsListView';
import RickAndMortyListView from '@modules/examples/ui/RickAndMortyListView';
import DynamicListView from '@modules/examples/ui/DynamicListView';
import TextsView from '@modules/examples/ui/TextsView';
import ButtonsView from '@modules/examples/ui/ButtonsView';
import TextInputsView from '@modules/examples/ui/TextInputsView';
import CardsView from '@modules/examples/ui/CardsView';
import CheckboxesView from '@modules/examples/ui/CheckboxesView';
import ModalsView from '@modules/examples/ui/ModalsView';
import AvatarsView from '@modules/examples/ui/AvatarsView';
import BadgesView from '@modules/examples/ui/BadgesView';
import ToastsView from '@modules/examples/ui/ToastsView';
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
        animationDuration: 2000,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ExamplesRoutes.Landing} component={LandingView} />
      <Stack.Screen
        name={ExamplesRoutes.SimpsonsList}
        component={SimpsonsListView}
      />
      <Stack.Screen
        name={ExamplesRoutes.RickAndMortyList}
        component={RickAndMortyListView}
      />
      <Stack.Screen
        name={ExamplesRoutes.DynamicList}
        component={DynamicListView}
      />
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
      <Stack.Screen name={ExamplesRoutes.Avatars} component={AvatarsView} />
      <Stack.Screen name={ExamplesRoutes.Badges} component={BadgesView} />
      <Stack.Screen name={ExamplesRoutes.Toasts} component={ToastsView} />
      <Stack.Screen name={ExamplesRoutes.SignIn} component={SignInView} />
      <Stack.Screen
        name={ExamplesRoutes.AnimationExample}
        component={AnimationExampleView}
      />
    </Stack.Navigator>
  );
}
