import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OpenApp() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { action, token, id } = router.query;

    let appLink = "reweard://home";
    let webFallback = "/";

    switch (action) {
      case "verify-email":
        appLink = `reweard://verify-email?token=${token}`;
        webFallback = `/verify-email/${token}`;
        break;
      case "reset-password":
        appLink = `reweard://reset-password?token=${token}`;
        webFallback = `/reset-password/${token}`;
        break;
      case "product":
        appLink = `reweard://product?id=${id}`;
        webFallback = `/product/${id}`;
        break;
      case "profile":
        appLink = "reweard://profile";
        webFallback = "/profile";
        break;
      default:
        appLink = "reweard://home";
        webFallback = "/";
    }

    // Try app first
    window.location.href = appLink;

    // Fallback
    const timer = setTimeout(() => {
      window.location.href = webFallback;
    }, 2000);

    return () => clearTimeout(timer);
  }, [router.isReady, router.query]);

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
      <h1>Opening ReWeard App...</h1>
      <p>If nothing happens, <a href={router.asPath.replace("/open-app", "")}>click here</a>.</p>
    </div>
  );
}
