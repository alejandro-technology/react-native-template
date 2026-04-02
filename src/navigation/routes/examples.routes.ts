import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export enum ExamplesRoutes {
  Landing = 'Landing',
  AnimationExample = 'AnimationExample',
  SimpsonsList = 'SimpsonsList',
  RickAndMortyList = 'RickAndMortyList',
  DynamicList = 'DynamicList',
  Texts = 'Texts',
  Buttons = 'Buttons',
  TextInputs = 'TextInputs',
  Cards = 'Cards',
  Checkboxes = 'Checkboxes',
  Modals = 'Modals',
  Avatars = 'Avatars',
  Badges = 'Badges',
  Toasts = 'Toasts',
  SignIn = 'SignIn',
}

export type ExamplesStackParamList = {
  [ExamplesRoutes.Landing]: undefined;
  [ExamplesRoutes.AnimationExample]: undefined;
  [ExamplesRoutes.SimpsonsList]: undefined;
  [ExamplesRoutes.RickAndMortyList]: undefined;
  [ExamplesRoutes.DynamicList]: undefined;
  [ExamplesRoutes.Texts]: undefined;
  [ExamplesRoutes.Buttons]: undefined;
  [ExamplesRoutes.TextInputs]: undefined;
  [ExamplesRoutes.Cards]: undefined;
  [ExamplesRoutes.Checkboxes]: undefined;
  [ExamplesRoutes.Modals]: undefined;
  [ExamplesRoutes.Avatars]: undefined;
  [ExamplesRoutes.Badges]: undefined;
  [ExamplesRoutes.Toasts]: undefined;
  [ExamplesRoutes.SignIn]: undefined;
};

export type ExamplesScreenProps<T extends keyof ExamplesStackParamList> =
  NativeStackScreenProps<ExamplesStackParamList, T>;
