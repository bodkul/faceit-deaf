import { RecentMatchesLayout } from "./layout";
import renderLoadingRows from "@/app/player/[username]/_components/renderLoadingRows";

export function RecentMatchesLoading() {
  return <RecentMatchesLayout>{renderLoadingRows(10)}</RecentMatchesLayout>;
}
