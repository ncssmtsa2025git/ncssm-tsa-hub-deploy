import Link from "next/link";
import { User } from "../models/user";

const primary =
  "inline-flex items-center rounded-lg bg-paper px-4 py-2 font-semibold text-tsa-deep transition-colors hover:bg-tsa-tint";
const quiet =
  "inline-flex items-center rounded-lg px-3 py-2 font-medium text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper";

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
      <div className={`flex items-center gap-2 ${className}`}>
        <Link href="/portal" className={primary}>
          Portal
        </Link>
        <button onClick={onLogout} className={quiet}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <button onClick={onLogin} className={`${primary} ${className}`}>
      Log in
    </button>
  );
}
