import {
  wScale,
  hScale,
  moderateScale,
  wp,
  hp,
  isSmallDevice,
  isTablet,
  isMobile,
} from '@theme/responsive';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Dimensions.get = jest.fn().mockReturnValue({ width: 375, height: 812 });
  RN.PixelRatio.roundToNearestPixel = jest.fn(size => Math.round(size));
  RN.PixelRatio.getFontScale = jest.fn().mockReturnValue(1);
  return RN;
});

describe('Responsive Utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('wScale', () => {
    it('debe escalar el ancho correctamente basado en el ancho de pantalla', () => {
      // SCREEN_WIDTH (375) / BASE_WIDTH (390 para iOS) = 0.9615
      // 100 * 0.9615 = 96.15 -> round -> 96
      expect(wScale(100)).toBe(96);
    });
  });

  describe('hScale', () => {
    it('debe escalar el alto correctamente basado en el alto de pantalla', () => {
      // SCREEN_HEIGHT (812) / BASE_HEIGHT (844 para iOS) = 0.962
      // 100 * 0.962 = 96.2 -> round -> 96
      expect(hScale(100)).toBe(96);
    });
  });

  describe('moderateScale', () => {
    it('debe aplicar escala moderada con factor default (0.5)', () => {
      // size + (wScale(size) - size) * 0.5
      // 100 + (96 - 100) * 0.5 = 100 - 2 = 98
      expect(moderateScale(100)).toBe(98);
    });

    it('debe aplicar escala moderada con factor personalizado', () => {
      // 100 + (96 - 100) * 0.1 = 100 - 0.4 = 99.6
      expect(moderateScale(100, 0.1)).toBeCloseTo(99.6);
    });
  });

  describe('wp y hp', () => {
    it('debe calcular el porcentaje de ancho correctamente', () => {
      // 50% de 375 = 187.5 -> round -> 188
      expect(wp(50)).toBe(188);
      expect(wp('50%')).toBe(188);
    });

    it('debe calcular el porcentaje de alto correctamente', () => {
      // 20% de 812 = 162.4 -> round -> 162
      expect(hp(20)).toBe(162);
      expect(hp('20%')).toBe(162);
    });
  });

  describe('Dispositivos y Breakpoints', () => {
    it('debe identificar correctamente dispositivos pequeños', () => {
      // SCREEN_WIDTH es 375, isSmallDevice es < 375
      expect(isSmallDevice).toBe(false);
    });

    it('debe identificar correctamente si es mobile/tablet', () => {
      // SCREEN_WIDTH es 375, tablet breakpoint es 768
      expect(isMobile).toBe(true);
      expect(isTablet).toBe(false);
    });
  });
});
