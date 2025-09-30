"use client";
import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    // Notify opener window that login finished
    if (window.opener) {
      window.opener.postMessage("success", process.env.NEXT_PUBLIC_SELF_URL); 
      window.close();
    }
  }, []);

  return <p>Logging you in...</p>;
}