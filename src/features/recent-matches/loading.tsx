import renderLoadingRows from "@/app/player/[username]/_components/renderLoadingRows";

import { RecentMatchesLayout } from "./layout";

export function RecentMatchesLoading() {
  return <RecentMatchesLayout>{renderLoadingRows(10)}</RecentMatchesLayout>;
}
