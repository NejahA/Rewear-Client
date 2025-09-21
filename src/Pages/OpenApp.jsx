import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OpenApp() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    const token = params.get("token");
    const id = params.get("id");

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

    // Try opening the app
    window.location.href = appLink;

    // Fallback after 2s
    const timer = setTimeout(() => {
      navigate(webFallback);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
      <h1>Opening ReWeard App...</h1>
      <p>
        If nothing happens,{" "}
        <a href={location.search.replace("?action=", "").replace("&", "/")}>
          click here
        </a>.
      </p>
    </div>
  );
}
