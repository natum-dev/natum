import { headers } from "next/headers";
import A2WIntermediary from "./A2WIntermediary";

export default async function A2WIntermediaryPage() {
  const headersList = await headers();
  const token = headersList.get("X-A2W-Token") ?? "";

  return <A2WIntermediary token={token} />;
}
