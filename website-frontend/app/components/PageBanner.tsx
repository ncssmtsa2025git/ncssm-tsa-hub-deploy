import Image from "next/image";
import React from "react";

type Props = {
  title: string;
  image: string;
  alt: string;
  /** CSS object-position for the photo, e.g. "70% 35%" to keep faces clear of the title. */
  focus?: string;
  children?: React.ReactNode;
};

/** Full-bleed chapter photo with a left-weighted scrim and a left-aligned title. */
export default function PageBanner({ title, image, alt, focus = "center", children }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-tsa-deep text-paper">
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
        style={{ objectPosition: focus }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,oklch(0.2_0.09_264/0.94)_0%,oklch(0.24_0.1_264/0.78)_38%,oklch(0.26_0.1_264/0.18)_75%,transparent_100%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-tsa-deep/70 to-transparent" />

      <div className="mx-auto flex min-h-[clamp(300px,46vh,500px)] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pb-14">
        <h1 className="display text-[clamp(3.25rem,9vw,7.5rem)]">{title}</h1>
        {children && <div className="mt-5 max-w-xl text-lg leading-relaxed text-paper/90">{children}</div>}
      </div>
    </section>
  );
}
