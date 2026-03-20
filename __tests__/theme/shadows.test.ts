import { getShadows } from '@theme/shadows';

// Mock de responsive para que las sombras sean predecibles
jest.mock('@theme/responsive', () => ({
  wScale: jest.fn(s => s),
  hScale: jest.fn(s => s),
  moderateScale: jest.fn(s => s),
}));

describe('Theme Shadows', () => {
  it('debe devolver sombras para modo claro por defecto', () => {
    const shadows = getShadows();
    expect(shadows.sm.shadowOpacity).toBe(0.05);
    expect(shadows.lg.shadowOpacity).toBe(0.15);
    expect(shadows.xl.elevation).toBe(8);
  });

  it('debe devolver sombras para modo claro explícitamente', () => {
    const shadows = getShadows(false);
    expect(shadows.sm.shadowOpacity).toBe(0.05);
  });

  it('debe devolver sombras para modo oscuro', () => {
    const shadows = getShadows(true);
    // En modo oscuro las sombras son más opacas para ser visibles sobre fondos oscuros
    expect(shadows.sm.shadowOpacity).toBe(0.2);
    expect(shadows.lg.shadowOpacity).toBe(0.4);
    expect(shadows.xl.elevation).toBe(8);
  });

  it('debe tener nivel "none" sin sombra', () => {
    const shadows = getShadows();
    expect(shadows.none.shadowOpacity).toBe(0);
    expect(shadows.none.elevation).toBe(0);
    expect(shadows.none.shadowRadius).toBe(0);
  });

  it('debe escalar correctamente los valores de sombra', () => {
    const shadows = getShadows();
    // Como el mock devuelve el mismo valor, podemos validar que se llamaron a las funciones de escala
    expect(shadows.md.shadowOffset.height).toBe(2);
    expect(shadows.md.shadowRadius).toBe(4);
    expect(shadows.md.elevation).toBe(3);
  });
});
