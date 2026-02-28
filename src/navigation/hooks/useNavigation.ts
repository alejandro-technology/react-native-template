import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Stacks
import { RootStackParamList } from '../routes/root.routes';
import type { ProductsStackParamList } from '../routes/products.routes';
import type { UsersStackParamList } from '../routes/users.routes';

export const useNavigationRoot = useNavigation<
  NativeStackNavigationProp<RootStackParamList>
>;

export const useNavigationProducts = useNavigation<
  NativeStackNavigationProp<ProductsStackParamList>
>;

export const useNavigationUsers = useNavigation<
  NativeStackNavigationProp<UsersStackParamList>
>;
