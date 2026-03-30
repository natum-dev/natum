import { redirect } from "next/navigation";

export default function ProfileRedirectPage() {
  redirect(
    "snssdk1180://webview?url=https://www.tiktok.com/coin&use_external_browser=true",
  );
}
