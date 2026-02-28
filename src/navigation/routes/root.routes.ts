import { NavigatorScreenParams } from '@react-navigation/native';
import { ExamplesStackParamList } from './examples.routes';
import { ProductsStackParamList } from './products.routes';

export enum RootRoutes {
  Examples = 'Examples',
  Products = 'Products',
}

export type RootStackParamList = {
  [RootRoutes.Examples]: NavigatorScreenParams<ExamplesStackParamList>;
  [RootRoutes.Products]: NavigatorScreenParams<ProductsStackParamList>;
};
