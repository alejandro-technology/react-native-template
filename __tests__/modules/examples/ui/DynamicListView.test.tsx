jest.mock('@modules/examples/application/example.queries', () => ({
  useExampleListInfinite: jest.fn(() => ({
    data: {
      pages: [
        {
          items: [],
        },
      ],
    },
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    hasNextPage: false,
  })),
}));

const mockExamplesState = {
  selectedSource: 'rickAndMorty',
  setSelectedSource: jest.fn(),
  sourceFilters: {
    simpsons: {},
    rickAndMorty: {},
    rawg: {},
    dummyJsonProducts: {},
  },
  setSourceFilters: jest.fn(),
};

jest.mock('@modules/examples/application/examples.storage', () => ({
  useExamplesStorage: jest.fn(selector => selector(mockExamplesState)),
}));

jest.mock('@modules/core/application/core.hooks', () => ({
  useDebounce: (value: string) => value,
}));

jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem }: any) => (
    <>{data?.map((item: any, index: number) => renderItem({ item, index }))}</>
  ),
}));

import React from 'react';
import { render } from '@utils/test-utils';

import DynamicListView from '@modules/examples/ui/DynamicListView';

describe('DynamicListView', () => {
  it('debe renderizar el selector de fuente', () => {
    const { getByText } = render(<DynamicListView />);

    expect(getByText('Fuente de datos')).toBeTruthy();
    expect(getByText('Cambia la fuente de datos')).toBeTruthy();
  });
});
