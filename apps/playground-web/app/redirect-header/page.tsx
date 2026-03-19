import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RedirectHeaderPage() {
  const headersList = await headers();
  const headersObject: Record<string, string> = {};

  headersList.forEach((value, key) => {
    if (key.toLowerCase().includes("vercel")) return;
    headersObject[key] = value;
  });

  const cookieStore = await cookies();
  cookieStore.set("Redirect-Timestamp", String(Date.now()));

  const data = encodeURIComponent(JSON.stringify(headersObject));
  redirect(`/dump-data?data=${data}`);
}
