import type { SVGProps, ReactNode } from "react";

export type IconProps = SVGProps<SVGSVGElement>;
export type IconType = (props: IconProps) => ReactNode;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconRipple = (props: IconProps) => (
  <Svg {...props} strokeWidth={0}>
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle
      cx="12"
      cy="12"
      r="5.5"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeDasharray="0.1 3.2"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeDasharray="0.1 4.2"
      strokeLinecap="round"
    />
  </Svg>
);

export const IconAlertTriangle = (props: IconProps) => (
  <Svg {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Svg>
);

export const IconArrowRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Svg>
);

export const IconChevronRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const IconChevronDown = (props: IconProps) => (
  <Svg {...props}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconMenu = (props: IconProps) => (
  <Svg {...props}>
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </Svg>
);

export const IconVideo = (props: IconProps) => (
  <Svg {...props}>
    <path d="m22 8-6 4 6 4V8Z" />
    <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
  </Svg>
);

export const IconPhone = (props: IconProps) => (
  <Svg {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

export const IconWhatsApp = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"
    />
  </svg>
);

export const IconKeypad = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="5" r="1.9" />
    <circle cx="12" cy="5" r="1.9" />
    <circle cx="19" cy="5" r="1.9" />
    <circle cx="5" cy="12" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="19" cy="12" r="1.9" />
    <circle cx="5" cy="19" r="1.9" />
    <circle cx="12" cy="19" r="1.9" />
    <circle cx="19" cy="19" r="1.9" />
  </svg>
);

export const IconIdCard = (props: IconProps) => (
  <Svg {...props}>
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <circle cx="8.5" cy="10" r="2" />
    <path d="M5.3 16.5c.5-1.7 1.7-2.5 3.2-2.5s2.7.8 3.2 2.5" />
    <path d="M14.5 9h4" />
    <path d="M14.5 13h4" />
  </Svg>
);

export const IconShieldPin = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="M12 7.8a2.4 2.4 0 0 1 2.4 2.4c0 1.8-2.4 3.6-2.4 3.6s-2.4-1.8-2.4-3.6A2.4 2.4 0 0 1 12 7.8Z" />
  </Svg>
);

export const IconChevronLeft = (props: IconProps) => (
  <Svg {...props}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const IconThermometer = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </Svg>
);

export const IconBandage = (props: IconProps) => (
  <Svg {...props}>
    <rect x="1.5" y="7" width="21" height="10" rx="2" transform="rotate(-45 12 12)" />
    <path d="M10.2 10.2h.01" />
    <path d="M13.8 13.8h.01" />
  </Svg>
);

export const IconDroplet = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </Svg>
);

export const IconBowlSpoon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 12h16a8 8 0 0 1-16 0Z" />
    <path d="m12.5 12 4.4-4.4" />
    <ellipse cx="17.9" cy="4.6" rx="1.7" ry="2.5" transform="rotate(45 17.9 4.6)" />
  </Svg>
);

export const IconPregnant = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="10" cy="4" r="2" />
    <path d="M7 8.5V21h2v-6h2v6h2V8.5" />
    <path d="M13 8.5c1.7 0 3 1.3 3 3v1.5h-3" />
  </Svg>
);

export const IconBaby = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9 12h.01" />
    <path d="M15 12h.01" />
    <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
    <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
  </Svg>
);

export const IconDots = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="19" cy="12" r="1.4" />
  </svg>
);

export const IconMaximize = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </Svg>
);

export const IconInfo = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </Svg>
);

export const IconSend = (props: IconProps) => (
  <Svg {...props}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </Svg>
);

export const IconPlayFilled = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </svg>
);

export const IconClock = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);

export const IconHome = (props: IconProps) => (
  <Svg {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

export const IconClipboardList = (props: IconProps) => (
  <Svg {...props}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </Svg>
);

export const IconClipboardCheck = (props: IconProps) => (
  <Svg {...props}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </Svg>
);

export const IconPlus = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Svg>
);

export const IconMapPin = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const IconUser = (props: IconProps) => (
  <Svg {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const IconUsers = (props: IconProps) => (
  <Svg {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

export const IconShield = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </Svg>
);

export const IconGlobe = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </Svg>
);

export const IconSignalHigh = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2 20h.01" />
    <path d="M7 20v-4" />
    <path d="M12 20v-8" />
    <path d="M17 20V8" />
    <path d="M22 4v16" />
  </Svg>
);

export const IconMic = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </Svg>
);

export const IconSparkles = (props: IconProps) => (
  <Svg {...props}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </Svg>
);

export const IconTarget = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Svg>
);

export const IconTruck = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.656a.5.5 0 0 0-.152-.345l-2.172-2.172A2 2 0 0 0 18.172 10H15" />
    <path d="M2 12h12" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </Svg>
);

export const IconPackage = (props: IconProps) => (
  <Svg {...props}>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </Svg>
);

export const IconHeart = (props: IconProps) => (
  <Svg {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

export const IconNavigation = (props: IconProps) => (
  <Svg {...props}>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </Svg>
);

export const IconSignalBars = ({ className }: IconProps) => (
  <svg viewBox="0 0 18 12" className={className} fill="currentColor" aria-hidden="true">
    <rect x="0" y="8" width="3" height="4" rx="1" />
    <rect x="5" y="6" width="3" height="6" rx="1" />
    <rect x="10" y="3.5" width="3" height="8.5" rx="1" />
    <rect x="15" y="0" width="3" height="12" rx="1" />
  </svg>
);

export const IconWifi = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 16 12"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M1.5 4.5a10 10 0 0 1 13 0" />
    <path d="M4 7.3a6.3 6.3 0 0 1 8 0" />
    <circle cx="8" cy="10.2" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconBattery = ({ className }: IconProps) => (
  <svg viewBox="0 0 27 12" className={className} fill="none" aria-hidden="true">
    <rect x="0.75" y="0.75" width="22" height="10.5" rx="3.2" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
    <rect x="2.4" y="2.4" width="16.5" height="7.2" rx="1.8" fill="currentColor" />
    <path d="M24.6 4.2v3.6a2.1 2.1 0 0 0 0-3.6z" fill="currentColor" fillOpacity="0.45" />
  </svg>
);

export const IconCheck = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const IconBell = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

export const IconActivity = (props: IconProps) => (
  <Svg {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Svg>
);

export const IconPill = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10.5 20.5 3.5 13.5A4.95 4.95 0 1 1 10.5 6.55l7 7a4.95 4.95 0 1 1-7 7z" />
    <path d="m8.5 8.5 7 7" />
  </Svg>
);

export const IconCopy = (props: IconProps) => (
  <Svg {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);

export const IconLocate = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 2v2.5" />
    <path d="M12 19.5V22" />
    <path d="M2 12h2.5" />
    <path d="M19.5 12H22" />
  </Svg>
);

export const IconEye = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconEyeOff = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61" />
    <path d="m2 2 20 20" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
);

export const IconHouseHand = (props: IconProps) => (
  <Svg {...props} strokeWidth={1.6}>
    <path d="m2.5 10 9.5-7 9.5 7" />
    <path d="M4.5 8.7V20a1.5 1.5 0 0 0 1.5 1.5h12A1.5 1.5 0 0 0 19.5 20V8.7" />
    <g transform="translate(4.3 6.2) scale(0.66)">
      <path d="M6 11V4a1 1 0 0 1 2 0v6" />
      <path d="M8 10V2.5a1 1 0 0 1 2 0V10" />
      <path d="M10 9.5V3a1 1 0 0 1 2 0v7" />
      <path d="M12 9.5V4a1 1 0 0 1 2 0v9" />
      <path d="M14 12.5V6a1 1 0 0 1 2 0v9a7 7 0 0 1-7 7h-1c-2 0-3.5-1-4.5-2.5L1.6 15.5c-.5-.7-.4-1.7.3-2.2a1.6 1.6 0 0 1 2.2.2L6 15" />
    </g>
  </Svg>
);

export const IconBike = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="18.5" cy="17.5" r="3.5" />
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="15" cy="5" r="1" />
    <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
  </Svg>
);

export const IconFileQuestion = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9.9 16.5a2.5 2.5 0 0 1 3.8 3.6 4 4 0 0 1-.8.9c-.4.4-.8.8-.9 1.4" />
    <path d="M12 18h.01" />
  </Svg>
);

export const IconSearch = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

export const IconX = (props: IconProps) => (
  <Svg {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

export const IconRotateCcw = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);

export const IconLayoutDashboard = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="3" width="7" height="9" rx="2" />
    <rect x="14" y="3" width="7" height="5" rx="2" />
    <rect x="14" y="12" width="7" height="9" rx="2" />
    <rect x="3" y="16" width="7" height="5" rx="2" />
  </Svg>
);

export const IconMessageSquareWarning = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M12 9v3" />
    <path d="M12 16h.01" />
  </Svg>
);

export const IconDownload = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </Svg>
);

export const IconTent = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 4 4 20h16L12 4Z" />
    <path d="M12 4v16" />
    <path d="M9 20h6" />
  </Svg>
);

export const IconReportChart = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 18v-3" />
    <path d="M12 18v-5" />
    <path d="M16 18v-2" />
  </Svg>
);

export const IconCalendar = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </Svg>
);

export const IconTrendingUp = (props: IconProps) => (
  <Svg {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <path d="M17 6h6v6" />
  </Svg>
);

export const IconFunnel = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 5h18" />
    <path d="M6 5v6a3 3 0 0 0 1.2 2.4l4.8 3.6 4.8-3.6A3 3 0 0 0 18 11V5" />
  </Svg>
);

export const IconUserCheck = (props: IconProps) => (
  <Svg {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m16 11 2 2 4-4" />
  </Svg>
);

export const IconUserExclamation = (props: IconProps) => (
  <Svg {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 5v6" />
    <path d="M19 15h.01" />
  </Svg>
);

export const IconRoute = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="6" cy="19" r="3" />
    <circle cx="18" cy="5" r="3" />
    <path d="M12 19h4a2 2 0 0 0 2-2v-8" />
    <path d="M12 5h-2a2 2 0 0 0-2 2v6" />
  </Svg>
);

export const IconFileChart = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 18v-3" />
    <path d="M12 18v-5" />
    <path d="M16 18v-2" />
  </Svg>
);

export const IconBarChart = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 16v-4" />
    <path d="M11 16V8" />
    <path d="M15 16v-6" />
    <path d="M19 16v-9" />
  </Svg>
);

export const IconPackageChart = (props: IconProps) => (
  <Svg {...props}>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2.5-1.43" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
    <path d="M17 16v5" />
    <path d="M21 16v3" />
  </Svg>
);

export const IconUserChart = (props: IconProps) => (
  <Svg {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 15v5" />
    <path d="M22 11v2" />
  </Svg>
);

export const IconLogOut = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

export const IconFloodAgent = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2 12h20" />
    <path d="M20 12v8H4v-8" />
    <path d="M4 8l8-5 8 5" />
    <path d="M7 16c1.5 1 3.5 1 5 0s3.5-1 5 0" />
  </Svg>
);

export const IconHealthAgent = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="6" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <circle cx="12" cy="12" r="2" />
  </Svg>
);

export const IconLogisticsAgent = (props: IconProps) => (
  <Svg {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Svg>
);

export const IconRouteAgent = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a4.5 4.5 0 0 0 0-9H15" />
    <circle cx="18" cy="5" r="3" />
    <polyline points="12 13 15 10 12 7" />
  </Svg>
);

export const IconResourceAgent = (props: IconProps) => (
  <Svg {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Svg>
);

export const IconWaterKit = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M9 14h6" />
    <path d="M12 11v6" />
  </Svg>
);

export const IconBrain = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54z" />
  </Svg>
);

export const IconZap = (props: IconProps) => (
  <Svg {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);

export const IconRefresh = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </Svg>
);

export const IconCoins = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="M16 10h.01" />
  </Svg>
);

