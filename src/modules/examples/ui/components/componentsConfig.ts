import { AuthenticationRoutes, ProductsRoutes } from '@navigation/routes';
import { ExamplesRoutes } from '@navigation/routes/examples.routes';
import { UsersRoutes } from '@navigation/routes/users.routes';
import type { IconName } from '@components/core';

export interface ComponentConfig {
  title: string;
  description: string;
  icon: IconName;
  color: string;
  screen: Screens;
  auth?: boolean;
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
    icon: 'text',
    color: '#3B82F6',
    screen: ExamplesRoutes.Texts,
  },
  {
    title: 'Button',
    description: 'Interactive buttons with multiple states & sizes',
    icon: 'button',
    color: '#10B981',
    screen: ExamplesRoutes.Buttons,
  },
  {
    title: 'TextInput',
    description: 'Form inputs with validation & icons support',
    icon: 'input',
    color: '#8B5CF6',
    screen: ExamplesRoutes.TextInputs,
  },
  {
    title: 'Card',
    description: 'Container component with variants & interactive mode',
    icon: 'card',
    color: '#F59E0B',
    screen: ExamplesRoutes.Cards,
  },
  {
    title: 'Checkbox',
    description: 'Selectable control with variants and states',
    icon: 'checkbox',
    color: '#14B8A6',
    screen: ExamplesRoutes.Checkboxes,
  },
  {
    title: 'Modal',
    description: 'Overlays for dialogs and confirmations',
    icon: 'modal',
    color: '#6366F1',
    screen: ExamplesRoutes.Modals,
  },
  {
    title: 'Avatar',
    description: 'User avatars with initials, colors & images',
    icon: 'user',
    color: '#0EA5E9',
    screen: ExamplesRoutes.Avatars,
  },
  {
    title: 'Badge',
    description: 'Status badges with role variants',
    icon: 'tag',
    color: '#14B8A6',
    screen: ExamplesRoutes.Badges,
  },
  {
    title: 'Toast',
    description: 'Notification toasts with types & positions',
    icon: 'bell',
    color: '#F59E0B',
    screen: ExamplesRoutes.Toasts,
  },
  {
    title: 'SignIn Form',
    description: 'Registration form with react-hook-form & Yup validation',
    icon: 'lock',
    color: '#EC4899',
    screen: AuthenticationRoutes.SignIn,
  },
  {
    title: 'Authentication',
    description: 'Sign in & sign up flow with form validation',
    icon: 'key',
    color: '#A855F7',
    screen: AuthenticationRoutes.SignUp,
  },
  {
    title: 'Products',
    description: 'Product list with CRUD operations',
    icon: 'package',
    color: '#007AFF',
    screen: ProductsRoutes.ProductList,
    auth: true,
  },
  {
    title: 'Users',
    description: 'User management with CRUD operations',
    icon: 'users',
    color: '#16A34A',
    screen: UsersRoutes.UserList,
    auth: true,
  },
];
