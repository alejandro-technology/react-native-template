import { useNavigation } from '@react-navigation/native';
import type { ProductsStackParamList } from '../routes/products.routes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const useNavigationProducts = useNavigation<
  NativeStackNavigationProp<ProductsStackParamList>
>;
