export const FaceitLevelUnranked = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="12" fill="#121212" />
    <path
      d="M 6.5, 18.4 A 8.4, 8.4 0 1 1 17.5, 18.4"
      stroke="#1d1d1d"
      strokeWidth="2.4"
    />
    <text
      className="select-none font-bold font-mono text-[8px] leading-4 tracking-[0.02em]"
      x="51%"
      y="49%"
      dominantBaseline="central"
      textAnchor="middle"
      fill="#f1f1f1"
    >
      ?
    </text>
  </svg>
);
