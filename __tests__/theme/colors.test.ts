import { getThemeColors, colors } from '@theme/colors';

describe('Theme Colors', () => {
  it('debe devolver los colores correctos para el modo light', () => {
    const themeColors = getThemeColors('light');
    expect(themeColors).toEqual(colors.light);
    expect(themeColors.background).toBe('#f6f6f8');
    expect(themeColors.primary).toBe('#3B82F6');
  });

  it('debe devolver los colores correctos para el modo dark', () => {
    const themeColors = getThemeColors('dark');
    expect(themeColors).toEqual(colors.dark);
    expect(themeColors.background).toBe('#0F172A');
    expect(themeColors.primary).toBe('#60A5FA');
  });

  it('debe devolver los colores correctos para el modo primary', () => {
    const themeColors = getThemeColors('primary');
    expect(themeColors).toEqual(colors.primary);
    expect(themeColors.background).toBe('#EFF6FF');
  });

  it('debe devolver los colores correctos para el modo secondary', () => {
    const themeColors = getThemeColors('secondary');
    expect(themeColors).toEqual(colors.secondary);
    expect(themeColors.background).toBe('#F0FDF4');
  });

  it('debe devolver los colores correctos para el modo premium', () => {
    const themeColors = getThemeColors('premium');
    expect(themeColors).toEqual(colors.premium);
    expect(themeColors.background).toBe('#FAF5FF');
  });
});
