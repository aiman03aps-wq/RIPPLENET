type VolunteerIconProps = { className?: string };

export const PakistanFlag = ({ className }: VolunteerIconProps) => (
  <svg viewBox="0 0 21 14" className={className} aria-hidden="true">
    <rect width="21" height="14" rx="1.6" fill="#ffffff" />
    <path d="M5.25 0h14.25A1.5 1.5 0 0 1 21 1.5v11A1.5 1.5 0 0 1 19.5 14H5.25z" fill="#01411C" />
    <circle cx="12.4" cy="7" r="3.4" fill="#ffffff" />
    <circle cx="13.4" cy="6.5" r="2.9" fill="#01411C" />
    <path d="M17.4 4.3l.42 1.05 1.05.42-1.05.42-.42 1.05-.42-1.05-1.05-.42 1.05-.42z" fill="#ffffff" />
  </svg>
);

export const FeatureIconSaveLives = ({ className }: VolunteerIconProps) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <path
      transform="translate(10.5 1.5) scale(0.8)"
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      fill="#ef4444"
    />
    <circle cx="13.5" cy="27" r="3.4" fill="#0e5a8a" />
    <path d="M7.5 38c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6" fill="#0e5a8a" />
    <circle cx="26.5" cy="27" r="3.4" fill="#38bdf8" />
    <path d="M20.5 38c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6" fill="#38bdf8" />
  </svg>
);

export const FeatureIconReachFaster = ({ className }: VolunteerIconProps) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <path
      d="M34.5 20a14.5 14.5 0 1 1-4.9-10.9"
      fill="none"
      stroke="#0e5a8a"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    <path d="M33.2 4.9l-.7 6.3-5.4-3.4z" fill="#0e5a8a" />
    <path
      transform="translate(11.2 8.2) scale(0.75)"
      d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
      fill="#38bdf8"
    />
    <circle transform="translate(11.2 8.2) scale(0.75)" cx="12" cy="10" r="3" fill="#ffffff" />
  </svg>
);

export const FeatureIconStayConnected = ({ className }: VolunteerIconProps) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <circle cx="20" cy="24" r="10.5" fill="#6ee7b7" />
    <circle cx="16.5" cy="22" r="1.5" fill="#065f46" />
    <circle cx="23.5" cy="22" r="1.5" fill="#065f46" />
    <path
      d="M15 27.5c1.5 2.4 3.2 3.6 5 3.6s3.5-1.2 5-3.6"
      fill="none"
      stroke="#065f46"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M9 20.5a6.5 6.5 0 0 0 0 7" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M5.3 18.6a10 10 0 0 0 0 10.8" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M31 20.5a6.5 6.5 0 0 1 0 7" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M34.7 18.6a10 10 0 0 1 0 10.8" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);
