import Script from "next/script";

/** Umami (cloud.umami.is), website id reused from former pomodoro site. */
export default function Analytics() {
  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id="1f208a06-4824-4a79-963a-55e59502137a"
      strategy="afterInteractive"
    />
  );
}
