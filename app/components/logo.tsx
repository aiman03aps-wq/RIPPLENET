import Image from "next/image";

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <Image
      src="/images/ripplenet_logo.png"
      alt="RippleNet AI"
      width={256}
      height={256}
      className={`object-contain ${className}`}
      priority
    />
  );
}
