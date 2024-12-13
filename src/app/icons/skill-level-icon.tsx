import React from "react";

import skillLevelIcons from "@/app/icons/skill-level-icons";

interface SkillLevelIconProps extends React.SVGProps<SVGSVGElement> {
  level: number;
}

const SkillLevelIcon: React.FC<SkillLevelIconProps> = ({ level, ...props }) => {
  const IconComponent = skillLevelIcons[level] || skillLevelIcons[1];
  return <IconComponent {...props} />;
};

export default SkillLevelIcon;
