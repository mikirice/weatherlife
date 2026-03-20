type IconProps = { size?: number; className?: string };

const defaults = { size: 24, className: "" };

function Svg({ size, className, children }: IconProps & { children: React.ReactNode }) {
  const s = size ?? defaults.size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? defaults.className}
    >
      {children}
    </svg>
  );
}

/** Clothing — T-shirt */
export function ClothingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2l-5 5 3 2v11h12V9l3-2-5-5-2 2a3 3 0 0 1-4 0L8 2z" />
    </Svg>
  );
}

/** Umbrella */
export function UmbrellaIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2v1" />
      <path d="M12 23a2 2 0 0 1-2-2v-4" />
      <path d="M22 12H2a10 10 0 0 1 20 0z" />
    </Svg>
  );
}

/** Pollen — flower/allergen */
export function PollenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </Svg>
  );
}

/** Laundry — hanging clothes on line */
export function LaundryIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 6h20" />
      <path d="M6 6v2a3 3 0 0 0 6 0V6" />
      <path d="M14 6v3a3 3 0 0 0 6 0V6" />
      <path d="M6 20V11M12 20V11" />
      <path d="M6 20h6" />
    </Svg>
  );
}

/** UV — sun with rays */
export function UvIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </Svg>
  );
}

/** Cold Risk — thermometer low */
export function ColdRiskIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      <circle cx="11.5" cy="17.5" r="1.5" fill="currentColor" />
    </Svg>
  );
}

/** Exercise — running figure */
export function ExerciseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="14" cy="4" r="2" />
      <path d="M10 9l-3 7h4l-2 6 7-9h-4l3-5" />
    </Svg>
  );
}

/** Comfort — leaf / breeze */
export function ComfortIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M17 8c2.5-1 4-4 4-7-3 0-6 1.5-7 4" />
      <path d="M14 5c-3 0-7 2-7 8 0 4 3 8 8 8 0-5-1.5-9-5-11" />
      <path d="M7 21l1.5-6" />
    </Svg>
  );
}

/** Stargazing — stars */
export function StargazingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2l2.12 6.54h6.88l-5.56 4.04 2.12 6.54L12 15.08l-5.56 4.04 2.12-6.54L3 8.54h6.88z" />
    </Svg>
  );
}

/** Car Wash — car with water */
export function CarWashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 17h14a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2a2 2 0 0 0 2 2z" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
      <path d="M6 4v2M12 4v2M18 4v2" />
    </Svg>
  );
}

/** Skin Dryness — droplet with warning */
export function SkinDrynessIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2.7c-4 4.5-7 8-7 11.3a7 7 0 0 0 14 0c0-3.3-3-6.8-7-11.3z" />
      <path d="M12 11v3M12 17h.01" />
    </Svg>
  );
}

/** Pipe Freezing — snowflake */
export function PipeFreezingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2v20M2 12h20" />
      <path d="M5.6 5.6l3.4 3.4M15 15l3.4 3.4M18.4 5.6L15 9M9 15l-3.4 3.4" />
    </Svg>
  );
}

/** Heating/Cooling — house with thermometer */
export function HeatingCoolingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M12 11v6M10 14h4" />
    </Svg>
  );
}

/** Nabe — hot pot / bowl with steam */
export function NabeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 14h16a0 0 0 0 1 0 0 8 8 0 0 1-16 0 0 0 0 0 1 0 0z" />
      <path d="M8 4c0 2 2 2 2 4M12 4c0 2 2 2 2 4M16 4c0 2 2 2 2 4" />
      <path d="M2 14h20" />
    </Svg>
  );
}

/** Beer — beer mug */
export function BeerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 6h10v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z" />
      <path d="M15 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
      <path d="M8 6V4M12 6V4" />
    </Svg>
  );
}

/** Ice Cream — cone */
export function IceCreamIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22l-4-10h8l-4 10z" />
      <circle cx="12" cy="8" r="4" />
      <path d="M8.5 10.5a4 4 0 0 0 7 0" />
    </Svg>
  );
}

export const lifeIndexIcons: Record<string, React.ComponentType<IconProps>> = {
  clothing: ClothingIcon,
  umbrella: UmbrellaIcon,
  pollen: PollenIcon,
  laundry: LaundryIcon,
  uv: UvIcon,
  coldRisk: ColdRiskIcon,
  exercise: ExerciseIcon,
  comfort: ComfortIcon,
  stargazing: StargazingIcon,
  carWash: CarWashIcon,
  skinDryness: SkinDrynessIcon,
  pipeFreezing: PipeFreezingIcon,
  heatingCooling: HeatingCoolingIcon,
  nabe: NabeIcon,
  beer: BeerIcon,
  iceCream: IceCreamIcon
};
