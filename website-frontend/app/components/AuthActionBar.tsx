import Link from "next/link";
import { User } from "../models/user";

export default function AuthActionBar({
  user,
  onLogin,
  onLogout,
  className = "",
}: {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  className?: string;
}) {
  if (user) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link
          href="/portal"
          className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 
                     text-white font-medium backdrop-blur-md 
                     border-2 border-white/30 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Portal
        </Link>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600/80 
                     text-white font-medium backdrop-blur-md 
                     border-2 border-red-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onLogin}
      className={`px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 
                  text-white font-medium backdrop-blur-md 
                  border-2 border-white/30 transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
    >
      Login
    </button>
  );
}