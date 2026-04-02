import type { ExampleDataSource } from './example-source.model';

export interface ExampleListItem {
  id: string;
  source: ExampleDataSource;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  badges?: string[];
  metadata?: Array<{ label: string; value: string }>;
  rawUrl?: string;
}

export interface ExampleListPage {
  items: ExampleListItem[];
  currentPage: number;
  nextPage: number | null;
  totalPages?: number;
  totalItems?: number;
}
