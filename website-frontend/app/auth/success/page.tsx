"use client";
import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    // Notify opener window that login finished
    if (window.opener) {
      window.opener.postMessage("success", "http://localhost:3000"); 
      window.close();
    }
  }, []);

  return <p>Logging you in...</p>;
}