import {
  capitalize,
  capitalizeWords,
  initialsFromText,
  truncateText,
  normalizeText,
  removeAccents,
  toSlug,
} from '@modules/core/domain/utils/format.utils';

describe('format.utils', () => {
  describe('capitalize', () => {
    it('debe capitalizar la primera letra de una cadena en minúsculas', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('debe retornar cadena vacía para texto vacío', () => {
      expect(capitalize('')).toBe('');
    });

    it('debe retornar cadena vacía para texto con solo espacios', () => {
      expect(capitalize('   ')).toBe('');
    });

    it('debe preservar el resto de la cadena sin cambios', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });

    it('debe funcionar con una sola letra', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('debe mantener en mayúscula una cadena ya capitalizada', () => {
      expect(capitalize('HELLO')).toBe('HELLO');
    });
  });

  describe('capitalizeWords', () => {
    it('debe capitalizar cada palabra de la cadena', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
    });

    it('debe retornar cadena vacía para texto vacío', () => {
      expect(capitalizeWords('')).toBe('');
    });

    it('debe retornar cadena vacía para texto con solo espacios', () => {
      expect(capitalizeWords('   ')).toBe('');
    });

    it('debe colapsar múltiples espacios entre palabras', () => {
      expect(capitalizeWords('hola   mundo')).toBe('Hola Mundo');
    });

    it('debe convertir a minúsculas antes de capitalizar', () => {
      expect(capitalizeWords('HELLO WORLD')).toBe('Hello World');
    });

    it('debe funcionar con una sola palabra', () => {
      expect(capitalizeWords('javascript')).toBe('Javascript');
    });
  });

  describe('initialsFromText', () => {
    it('debe obtener las iniciales de dos palabras', () => {
      expect(initialsFromText('John Doe')).toBe('JD');
    });

    it('debe respetar el parámetro maxLength', () => {
      expect(initialsFromText('John Doe Smith', 1)).toBe('J');
    });

    it('debe retornar cadena vacía para texto vacío', () => {
      expect(initialsFromText('')).toBe('');
    });

    it('debe obtener máximo 2 iniciales por defecto', () => {
      expect(initialsFromText('John Doe Smith Jones')).toBe('JD');
    });

    it('debe poner las iniciales en mayúscula', () => {
      expect(initialsFromText('john doe')).toBe('JD');
    });

    it('debe funcionar con una sola palabra', () => {
      expect(initialsFromText('Alice')).toBe('A');
    });

    it('debe obtener tres iniciales cuando maxLength es 3', () => {
      expect(initialsFromText('John Doe Smith', 3)).toBe('JDS');
    });
  });

  describe('truncateText', () => {
    it('debe truncar texto que supere el maxLength', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...');
    });

    it('debe retornar el texto completo si es menor al límite', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('debe retornar el texto completo si su longitud es igual al límite', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('debe retornar cadena vacía para maxLength cero', () => {
      expect(truncateText('Hello', 0)).toBe('');
    });

    it('debe retornar cadena vacía para maxLength negativo', () => {
      expect(truncateText('Hello', -1)).toBe('');
    });

    it('debe usar sufijo personalizado al truncar', () => {
      expect(truncateText('Hello World', 8, '…')).toBe('Hello W…');
    });

    it('debe recortar espacios al final antes de añadir el sufijo', () => {
      expect(truncateText('Hello World', 7)).toBe('Hell...');
    });
  });

  describe('normalizeText', () => {
    it('debe eliminar espacios al inicio y al final', () => {
      expect(normalizeText('  hello  ')).toBe('hello');
    });

    it('debe colapsar múltiples espacios en uno solo', () => {
      expect(normalizeText('hello   world')).toBe('hello world');
    });

    it('debe retornar el texto sin cambios si ya está normalizado', () => {
      expect(normalizeText('hello world')).toBe('hello world');
    });

    it('debe manejar cadena vacía', () => {
      expect(normalizeText('')).toBe('');
    });
  });

  describe('removeAccents', () => {
    it('debe eliminar tildes del español', () => {
      expect(removeAccents('árbol')).toBe('arbol');
    });

    it('debe eliminar múltiples tildes en una misma cadena', () => {
      expect(removeAccents('café')).toBe('cafe');
    });

    it('debe mantener texto sin diacríticos sin cambios', () => {
      expect(removeAccents('hello')).toBe('hello');
    });

    it('debe eliminar diacríticos de la ñ', () => {
      expect(removeAccents('Español')).toBe('Espanol');
    });

    it('debe eliminar diacríticos de mayúsculas', () => {
      expect(removeAccents('ÁRBOL')).toBe('ARBOL');
    });

    it('debe manejar cadena vacía', () => {
      expect(removeAccents('')).toBe('');
    });
  });

  describe('toSlug', () => {
    it('debe convertir espacios a guiones y texto a minúsculas', () => {
      expect(toSlug('Hello World')).toBe('hello-world');
    });

    it('debe eliminar tildes en el slug', () => {
      expect(toSlug('árbol navideño')).toBe('arbol-navideno');
    });

    it('debe eliminar caracteres especiales', () => {
      expect(toSlug('Hello, World!')).toBe('hello-world');
    });

    it('debe colapsar múltiples guiones en uno solo', () => {
      expect(toSlug('hello  world')).toBe('hello-world');
    });

    it('debe manejar cadena vacía', () => {
      expect(toSlug('')).toBe('');
    });

    it('debe retornar cadena vacía para entrada con solo caracteres especiales', () => {
      expect(toSlug('!@#$%')).toBe('');
    });

    it('debe manejar cadena con números', () => {
      expect(toSlug('Product 123')).toBe('product-123');
    });
  });
});
