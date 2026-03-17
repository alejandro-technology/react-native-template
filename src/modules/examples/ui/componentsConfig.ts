import { AuthenticationRoutes, ProductsRoutes } from '@navigation/routes';
import { ExamplesRoutes } from '@navigation/routes/examples.routes';
import { UsersRoutes } from '@navigation/routes/users.routes';

export interface ComponentConfig {
  title: string;
  description: string;
  icon: string;
  color: string;
  screen: Screens;
}

type Screens =
  | Exclude<ExamplesRoutes, ExamplesRoutes.Landing>
  | ProductsRoutes
  | UsersRoutes
  | AuthenticationRoutes;
export const COMPONENTS_CONFIG: ComponentConfig[] = [
  {
    title: 'Text',
    description: 'Typography system with variants, colors & styles',
    icon: 'Aa',
    color: '#3B82F6',
    screen: ExamplesRoutes.Texts,
  },
  {
    title: 'Button',
    description: 'Interactive buttons with multiple states & sizes',
    icon: '\u25A2',
    color: '#10B981',
    screen: ExamplesRoutes.Buttons,
  },
  {
    title: 'TextInput',
    description: 'Form inputs with validation & icons support',
    icon: '\u270E',
    color: '#8B5CF6',
    screen: ExamplesRoutes.TextInputs,
  },
  {
    title: 'Card',
    description: 'Container component with variants & interactive mode',
    icon: '\u25A3',
    color: '#F59E0B',
    screen: ExamplesRoutes.Cards,
  },
  {
    title: 'Checkbox',
    description: 'Selectable control with variants and states',
    icon: '\u2611',
    color: '#14B8A6',
    screen: ExamplesRoutes.Checkboxes,
  },
  {
    title: 'Modal',
    description: 'Overlays for dialogs and confirmations',
    icon: '\u25A7',
    color: '#6366F1',
    screen: ExamplesRoutes.Modals,
  },
  {
    title: 'Avatar',
    description: 'User avatars with initials, colors & images',
    icon: '\uD83D\uDC64',
    color: '#0EA5E9',
    screen: ExamplesRoutes.Avatars,
  },
  {
    title: 'Badge',
    description: 'Status badges with role variants',
    icon: '\uD83C\uDFF7\uFE0F',
    color: '#14B8A6',
    screen: ExamplesRoutes.Badges,
  },
  {
    title: 'Toast',
    description: 'Notification toasts with types & positions',
    icon: '\uD83D\uDD14',
    color: '#F59E0B',
    screen: ExamplesRoutes.Toasts,
  },
  {
    title: 'SignIn Form',
    description: 'Registration form with react-hook-form & Yup validation',
    icon: '\uD83D\uDD10',
    color: '#EC4899',
    screen: ExamplesRoutes.SignIn,
  },
  {
    title: 'Authentication',
    description: 'Sign in & sign up flow with form validation',
    icon: '\uD83D\uDD11',
    color: '#A855F7',
    screen: AuthenticationRoutes.SignUp,
  },
  {
    title: 'Products',
    description: 'Product list with CRUD operations',
    icon: '\uD83D\uDCE6',
    color: '#007AFF',
    screen: ProductsRoutes.ProductList,
  },
  {
    title: 'Users',
    description: 'User management with CRUD operations',
    icon: '\uD83D\uDC65',
    color: '#16A34A',
    screen: UsersRoutes.UserList,
  },
];
