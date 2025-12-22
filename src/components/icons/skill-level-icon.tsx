import React from "react";

import LevelIcon1 from "./faceit/levels/1.svg";
import LevelIcon2 from "./faceit/levels/2.svg";
import LevelIcon3 from "./faceit/levels/3.svg";
import LevelIcon4 from "./faceit/levels/4.svg";
import LevelIcon5 from "./faceit/levels/5.svg";
import LevelIcon6 from "./faceit/levels/6.svg";
import LevelIcon7 from "./faceit/levels/7.svg";
import LevelIcon8 from "./faceit/levels/8.svg";
import LevelIcon9 from "./faceit/levels/9.svg";
import LevelIcon10 from "./faceit/levels/10.svg";

const skillLevelIcons: Record<number, React.FC<React.SVGProps<SVGElement>>> = {
  1: LevelIcon1,
  2: LevelIcon2,
  3: LevelIcon3,
  4: LevelIcon4,
  5: LevelIcon5,
  6: LevelIcon6,
  7: LevelIcon7,
  8: LevelIcon8,
  9: LevelIcon9,
  10: LevelIcon10,
};

interface SkillLevelIconProps extends React.SVGProps<SVGSVGElement> {
  level: number;
}

const SkillLevelIcon: React.FC<SkillLevelIconProps> = ({ level, ...props }) => {
  const IconComponent = skillLevelIcons[level] || skillLevelIcons[1];
  return <IconComponent {...props} />;
};

export default SkillLevelIcon;
