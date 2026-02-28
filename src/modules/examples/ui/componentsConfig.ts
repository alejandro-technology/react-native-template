import { ProductsRoutes } from '@navigation/routes';
import { ExamplesRoutes } from '@navigation/routes/examples.routes';

export interface ComponentConfig {
  title: string;
  description: string;
  icon: string;
  color: string;
  screen: Screens;
}

type Screens = Exclude<ExamplesRoutes, ExamplesRoutes.Landing> | ProductsRoutes;
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
    title: 'SignIn Form',
    description: 'Registration form with react-hook-form & zod validation',
    icon: '\uD83D\uDC64',
    color: '#EC4899',
    screen: ExamplesRoutes.SignIn,
  },
  {
    title: 'Products',
    description: 'Product list with CRUD operations',
    icon: '\uD83D\uDCE6',
    color: '#007AFF',
    screen: ProductsRoutes.ProductList,
  },
];
