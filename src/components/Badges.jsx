import { ShieldCheck, CheckCircle, Crown } from 'lucide-react';

/**
 * A reusable component to display Admin and Verified badges
 * @param {object} props
 * @param {object} props.user - The user object
 * @param {string[]} [props.user.roles] - Array of user roles (e.g., ['ADMIN', 'VERIFIED'])
 * @param {boolean} [props.user.isSuperAdmin] - Flag for Super Admin
 */
export default function Badges({ user }) {
  if (!user) {
    return null;
  }

  // --- SUPER ADMIN LOGIC ---
  // If user is Super Admin, show only the Super Admin badge.
  if (user.isSuperAdmin) {
    return (
      <div className="flex items-center gap-1.5" title="Super Admin">
        <span title="Super Admin">
          {/*  */}
          <Crown className="h-5 w-5 text-yellow-400" />
        </span>
      </div>
    );
  }

  // --- Regular Admin/Verified Logic ---
  if (!user.roles || user.roles.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5" title="User Badges">
      {user.roles.includes('ADMIN') && (
        <span title="Admin">
          {/*  */}
          <ShieldCheck className="h-5 w-5 text-yellow-500" />
        </span>
      )}
      {user.roles.includes('VERIFIED') && (
        <span title="Verified">
          {/*  */}
          <CheckCircle className="h-5 w-5 text-blue-500" />
        </span>
      )}
    </div>
  );
}