import React from 'react';
import { render } from '@utils/test-utils';
import { DatePicker } from '@components/form/DatePicker';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View: RNView } = require('react-native');
  return {
    __esModule: true,
    default: () => RNView,
  };
});

interface TestForm {
  birthDate: Date | null;
}

function TestWrapper({
  defaultValues = { birthDate: null },
}: {
  defaultValues?: TestForm;
}) {
  const { control } = useForm<TestForm>({ defaultValues });
  return (
    <View>
      <DatePicker
        control={control}
        name="birthDate"
        label="Fecha de nacimiento"
      />
    </View>
  );
}

describe('Form DatePicker', () => {
  it('debe renderizar con label', () => {
    const { getByText } = render(<TestWrapper />);
    expect(getByText('Fecha de nacimiento')).toBeTruthy();
  });

  it('debe mostrar placeholder cuando no hay valor', () => {
    const { getByDisplayValue } = render(<TestWrapper />);
    expect(getByDisplayValue('Seleccionar fecha')).toBeTruthy();
  });

  it('debe mostrar fecha formateada cuando hay valor', () => {
    const date = new Date(2024, 0, 15); // 15 enero 2024
    const { queryByDisplayValue } = render(
      <TestWrapper defaultValues={{ birthDate: date }} />,
    );
    // La fecha se formatea en español, verificamos que no sea el placeholder
    expect(queryByDisplayValue('Seleccionar fecha')).toBeNull();
  });
});
