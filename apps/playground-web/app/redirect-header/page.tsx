import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RedirectHeaderPage() {
  const headersList = await headers();
  const headersObject: Record<string, string> = {};

  headersList.forEach((value, key) => {
    headersObject[key] = value;
  });

  const data = encodeURIComponent(JSON.stringify(headersObject));
  redirect(`/dump-data?data=${data}`);
}
