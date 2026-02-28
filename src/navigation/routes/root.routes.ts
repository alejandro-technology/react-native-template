import { NavigatorScreenParams } from '@react-navigation/native';
import { ExamplesStackParamList } from './examples.routes';
import { ProductsStackParamList } from './products.routes';
import { UsersStackParamList } from './users.routes';

export enum RootRoutes {
  Examples = 'Examples',
  Products = 'Products',
  Users = 'Users',
}

export type RootStackParamList = {
  [RootRoutes.Examples]: NavigatorScreenParams<ExamplesStackParamList>;
  [RootRoutes.Products]: NavigatorScreenParams<ProductsStackParamList>;
  [RootRoutes.Users]: NavigatorScreenParams<UsersStackParamList>;
};
