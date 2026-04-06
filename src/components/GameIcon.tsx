import { cn } from '@/lib/utils';

interface IconProps {
  size?: number;
  className?: string;
  glow?: boolean;
  color?: string;
}

const svgBase = (size: number, glow: boolean, className?: string, color?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  className: cn(
    'inline-block shrink-0',
    glow && 'drop-shadow-[0_0_6px_currentColor]',
    className
  ),
  style: color ? { color } : undefined,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconGamepad = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
    <circle cx="13" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
    <line x1="7.5" y1="12" x2="10.5" y2="12" />
    <line x1="9" y1="10.5" x2="9" y2="13.5" />
  </svg>
);

export const IconSearch = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <circle cx="11" cy="11" r="6" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
    <circle cx="11" cy="11" r="2.5" strokeWidth="0.8" strokeDasharray="2 2" />
  </svg>
);

export const IconBell = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <line x1="12" y1="2" x2="12" y2="4" strokeWidth="2" />
  </svg>
);

export const IconSettings = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconSend = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M22 2L11 13" />
    <polygon points="22,2 15,22 11,13 2,9" fill="currentColor" fillOpacity="0.15" />
    <polygon points="22,2 15,22 11,13 2,9" fill="none" />
  </svg>
);

export const IconZap = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor" fillOpacity="0.1" />
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="none" />
  </svg>
);

export const IconUsers = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <circle cx="9" cy="7" r="3" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="17" cy="8" r="2.5" strokeWidth="1.5" />
    <path d="M21 21v-1.5a3 3 0 0 0-2-2.83" strokeWidth="1.5" />
  </svg>
);

export const IconPlus = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
    <rect x="4" y="4" width="16" height="16" rx="3" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.3" />
  </svg>
);

export const IconHeadphones = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

export const IconClock = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12,7 12,12 16,14" />
    <line x1="12" y1="3.5" x2="12" y2="4.5" strokeWidth="1" strokeOpacity="0.4" />
    <line x1="20.5" y1="12" x2="19.5" y2="12" strokeWidth="1" strokeOpacity="0.4" />
    <line x1="12" y1="20.5" x2="12" y2="19.5" strokeWidth="1" strokeOpacity="0.4" />
    <line x1="3.5" y1="12" x2="4.5" y2="12" strokeWidth="1" strokeOpacity="0.4" />
  </svg>
);

export const IconTrending = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" strokeWidth="2" />
    <polyline points="17,6 23,6 23,12" />
  </svg>
);

export const IconMessage = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.08" />
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" />
    <line x1="8" y1="8" x2="16" y2="8" strokeWidth="1.2" strokeOpacity="0.4" />
    <line x1="8" y1="12" x2="13" y2="12" strokeWidth="1.2" strokeOpacity="0.4" />
  </svg>
);

export const IconPaperclip = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export const IconSmile = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <circle cx="9" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPhone = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const IconVideo = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <rect x="1" y="5" width="15" height="14" rx="2" fill="currentColor" fillOpacity="0.08" />
    <rect x="1" y="5" width="15" height="14" rx="2" fill="none" />
    <polygon points="23,7 16,12 23,17" fill="currentColor" fillOpacity="0.2" />
    <polygon points="23,7 16,12 23,17" fill="none" />
  </svg>
);

export const IconPin = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M15 4.5L18.5 8l-4 4 1.5 1.5-5.5 5.5-1-3.5L4 21l5.5-5.5-3.5-1 5.5-5.5L13 10.5z" fill="currentColor" fillOpacity="0.1" />
    <path d="M15 4.5L18.5 8l-4 4 1.5 1.5-5.5 5.5-1-3.5L4 21l5.5-5.5-3.5-1 5.5-5.5L13 10.5z" fill="none" />
  </svg>
);

export const IconArrowLeft = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <line x1="19" y1="12" x2="5" y2="12" strokeWidth="2" />
    <polyline points="12,19 5,12 12,5" strokeWidth="2" />
  </svg>
);

export const IconHash = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export const IconVolume = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" fillOpacity="0.1" />
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="none" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeWidth="1.5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeWidth="1.2" strokeOpacity="0.5" />
  </svg>
);

export const IconEye = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const IconScreenShare = ({ size = 20, glow = false, className, color }: IconProps) => (
  <svg {...svgBase(size, glow, className, color)}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="9,10 12,7 15,10" />
    <line x1="12" y1="7" x2="12" y2="14" />
  </svg>
);

const iconComponents: Record<string, React.FC<IconProps>> = {
  gamepad: IconGamepad,
  search: IconSearch,
  bell: IconBell,
  settings: IconSettings,
  send: IconSend,
  zap: IconZap,
  users: IconUsers,
  plus: IconPlus,
  headphones: IconHeadphones,
  clock: IconClock,
  trending: IconTrending,
  message: IconMessage,
  paperclip: IconPaperclip,
  smile: IconSmile,
  phone: IconPhone,
  video: IconVideo,
  pin: IconPin,
  'arrow-left': IconArrowLeft,
  hash: IconHash,
  volume: IconVolume,
  eye: IconEye,
  'eye-off': IconEyeOff,
  'screen-share': IconScreenShare,
  'shield': ({ size = 20, glow = false, className, color }: IconProps) => (
    <svg {...svgBase(size, glow, className, color)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

interface GameIconProps extends IconProps {
  name: string;
}

const GameIcon = ({ name, ...props }: GameIconProps) => {
  const Component = iconComponents[name];
  if (!Component) return null;
  return <Component {...props} />;
};

export default GameIcon;
