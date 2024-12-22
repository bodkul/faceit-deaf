import { setDefaultOptions } from "date-fns";
import { enGB } from "date-fns/locale";

const customFormatRelativeLocale = {
  ...enGB,
  formatRelative: (token: string) => {
    const formatOptions: Record<string, string> = {
      lastWeek: "'last' eeee 'at' p",
      yesterday: "'yesterday at' p",
      today: "'today at' p",
      tomorrow: "'tomorrow at' p",
      nextWeek: "eeee 'at' p",
      other: "P p",
    };
    return formatOptions[token];
  },
};

setDefaultOptions({
  locale: customFormatRelativeLocale,
});
