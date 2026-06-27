import Image from "next/image";

interface AtmosphereBackdropProps {
  /** Atmosphere image under the brand wash. */
  imageSrc?: string;
  /** CSS object-position for art-directed crop. */
  imagePosition?: string;
  priority?: boolean;
}

/** Shared Seoul dusk atmosphere stack used on poster-style dark sections. */
export default function AtmosphereBackdrop({
  imageSrc = "/atmosphere/atmosphere-seoul-dusk.jpg",
  imagePosition = "center 38%",
  priority = false,
}: AtmosphereBackdropProps) {
  return (
    <>
      <div className="atmosphere-backdrop__bg" aria-hidden="true">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="atmosphere-backdrop__image"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <div className="poster-hero__wash" aria-hidden="true" />
      <div className="poster-hero__grain" aria-hidden="true" />
    </>
  );
}
