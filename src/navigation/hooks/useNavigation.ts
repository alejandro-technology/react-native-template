import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Stacks
import type { ExamplesStackParamList } from '../routes/examples.routes';
import type { ProductsStackParamList } from '../routes/products.routes';
import type { UsersStackParamList } from '../routes/users.routes';
import type { AuthenticationStackParamList } from '../routes/authentication.routes';
import { PrivateStackParamList } from '@navigation/routes';
import { PublicStackParamList } from '@navigation/routes/public.routes';

export const useNavigationPrivate = useNavigation<
  NativeStackNavigationProp<PrivateStackParamList>
>;

export const useNavigationProducts = useNavigation<
  NativeStackNavigationProp<ProductsStackParamList>
>;

export const useNavigationUsers = useNavigation<
  NativeStackNavigationProp<UsersStackParamList>
>;

export const useNavigationPublic = useNavigation<
  NativeStackNavigationProp<PublicStackParamList>
>;

export const useNavigationExamples = useNavigation<
  NativeStackNavigationProp<ExamplesStackParamList>
>;

export const useNavigationAuthentication = useNavigation<
  NativeStackNavigationProp<AuthenticationStackParamList>
>;
