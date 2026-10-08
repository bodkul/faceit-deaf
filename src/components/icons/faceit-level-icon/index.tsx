import { getSkillLevel } from "@/lib/faceit/levels";

import { FaceitLevel1 } from "./level-1";
import { FaceitLevel2 } from "./level-2";
import { FaceitLevel3 } from "./level-3";
import { FaceitLevel4 } from "./level-4";
import { FaceitLevel5 } from "./level-5";
import { FaceitLevel6 } from "./level-6";
import { FaceitLevel7 } from "./level-7";
import { FaceitLevel8 } from "./level-8";
import { FaceitLevel9 } from "./level-9";
import { FaceitLevel10 } from "./level-10";
import { FaceitLevelUnranked } from "./unranked";

const levels: Record<
  number,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  0: FaceitLevelUnranked,
  1: FaceitLevel1,
  2: FaceitLevel2,
  3: FaceitLevel3,
  4: FaceitLevel4,
  5: FaceitLevel5,
  6: FaceitLevel6,
  7: FaceitLevel7,
  8: FaceitLevel8,
  9: FaceitLevel9,
  10: FaceitLevel10,
};

interface FaceitLevelIconProps extends React.SVGProps<SVGSVGElement> {
  level?: number | null;
  elo?: number | null;
}

export function FaceitLevelIcon({
  level,
  elo,
  ...props
}: FaceitLevelIconProps) {
  const resolvedLevel = level ?? getSkillLevel(elo);
  const Icon = levels[resolvedLevel];
  return Icon ? <Icon {...props} /> : null;
}
