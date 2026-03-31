import React from 'react';
import type { SvgProps } from 'react-native-svg';
import SunIcon from '../../assets/svg/icons/sun.svg';
import MoonIcon from '../../assets/svg/icons/moon.svg';
import SearchIcon from '../../assets/svg/icons/search.svg';
import CheckIcon from '../../assets/svg/icons/check.svg';
import EmailIcon from '../../assets/svg/icons/email.svg';
import LockIcon from '../../assets/svg/icons/lock.svg';
import UnlockIcon from '../../assets/svg/icons/unlock.svg';
import EyeIcon from '../../assets/svg/icons/eye.svg';
import KeyIcon from '../../assets/svg/icons/key.svg';
import NumberIcon from '../../assets/svg/icons/number.svg';
import MobileIcon from '../../assets/svg/icons/mobile.svg';
import PhoneIcon from '../../assets/svg/icons/phone.svg';
import CalendarIcon from '../../assets/svg/icons/calendar.svg';
import ClockIcon from '../../assets/svg/icons/clock.svg';
import WarningIcon from '../../assets/svg/icons/warning.svg';
import PackageIcon from '../../assets/svg/icons/package.svg';
import UserIcon from '../../assets/svg/icons/user.svg';
import UsersIcon from '../../assets/svg/icons/users.svg';
import TagIcon from '../../assets/svg/icons/tag.svg';
import BellIcon from '../../assets/svg/icons/bell.svg';
import StarIcon from '../../assets/svg/icons/star.svg';
import ArrowRightIcon from '../../assets/svg/icons/arrow-right.svg';
import ArrowLeftIcon from '../../assets/svg/icons/arrow-left.svg';
import RocketIcon from '../../assets/svg/icons/rocket.svg';
import SparklesIcon from '../../assets/svg/icons/sparkles.svg';
import PaletteIcon from '../../assets/svg/icons/palette.svg';
import TextIcon from '../../assets/svg/icons/text.svg';
import ButtonIcon from '../../assets/svg/icons/button.svg';
import InputIcon from '../../assets/svg/icons/input.svg';
import CardIcon from '../../assets/svg/icons/card.svg';
import CheckboxIcon from '../../assets/svg/icons/checkbox.svg';
import ModalIcon from '../../assets/svg/icons/modal.svg';
import MailboxIcon from '../../assets/svg/icons/mailbox.svg';
import CameraIcon from '../../assets/svg/icons/camera.svg';
import CloseIcon from '../../assets/svg/icons/close.svg';
import ImageIcon from '../../assets/svg/icons/image.svg';
import { ColorVariant, useTheme } from '@theme/index';
import { getIconStyle } from '@theme/components/Icon.styles';

export type IconName =
  | 'sun'
  | 'moon'
  | 'search'
  | 'check'
  | 'email'
  | 'lock'
  | 'unlock'
  | 'eye'
  | 'key'
  | 'number'
  | 'mobile'
  | 'phone'
  | 'calendar'
  | 'clock'
  | 'warning'
  | 'package'
  | 'user'
  | 'users'
  | 'tag'
  | 'bell'
  | 'star'
  | 'arrow-right'
  | 'arrow-left'
  | 'rocket'
  | 'sparkles'
  | 'palette'
  | 'text'
  | 'button'
  | 'input'
  | 'card'
  | 'checkbox'
  | 'modal'
  | 'mailbox'
  | 'camera'
  | 'close'
  | 'image';

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorVariant;
  strokeWidth?: number;
}

const ICON_COMPONENTS: Record<IconName, React.ComponentType<SvgProps>> = {
  sun: SunIcon,
  moon: MoonIcon,
  search: SearchIcon,
  check: CheckIcon,
  email: EmailIcon,
  lock: LockIcon,
  unlock: UnlockIcon,
  eye: EyeIcon,
  key: KeyIcon,
  number: NumberIcon,
  mobile: MobileIcon,
  phone: PhoneIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  warning: WarningIcon,
  package: PackageIcon,
  user: UserIcon,
  users: UsersIcon,
  tag: TagIcon,
  bell: BellIcon,
  star: StarIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-left': ArrowLeftIcon,
  rocket: RocketIcon,
  sparkles: SparklesIcon,
  palette: PaletteIcon,
  text: TextIcon,
  button: ButtonIcon,
  input: InputIcon,
  card: CardIcon,
  checkbox: CheckboxIcon,
  modal: ModalIcon,
  mailbox: MailboxIcon,
  camera: CameraIcon,
  close: CloseIcon,
  image: ImageIcon,
};

export function Icon({ name, size = 20, color, strokeWidth = 1.8 }: IconProps) {
  const SvgIcon = ICON_COMPONENTS[name];
  const theme = useTheme();

  const styles = getIconStyle({
    size,
    color,
    strokeWidth,
    mode: theme.mode,
  });

  return (
    <SvgIcon
      width={styles.svg.width}
      height={styles.svg.height}
      color={styles.svg.color}
      strokeWidth={styles.svg.strokeWidth}
    />
  );
}
