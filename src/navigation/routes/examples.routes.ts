import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export enum ExamplesRoutes {
  Landing = 'Landing',
  AnimationExample = 'AnimationExample',
  Texts = 'Texts',
  Buttons = 'Buttons',
  TextInputs = 'TextInputs',
  Cards = 'Cards',
  Checkboxes = 'Checkboxes',
  Modals = 'Modals',
  SignIn = 'SignIn',
}

export type ExamplesStackParamList = {
  [ExamplesRoutes.Landing]: undefined;
  [ExamplesRoutes.AnimationExample]: undefined;
  [ExamplesRoutes.Texts]: undefined;
  [ExamplesRoutes.Buttons]: undefined;
  [ExamplesRoutes.TextInputs]: undefined;
  [ExamplesRoutes.Cards]: undefined;
  [ExamplesRoutes.Checkboxes]: undefined;
  [ExamplesRoutes.Modals]: undefined;
  [ExamplesRoutes.SignIn]: undefined;
};

export type ExamplesScreenProps<T extends keyof ExamplesStackParamList> =
  NativeStackScreenProps<ExamplesStackParamList, T>;
