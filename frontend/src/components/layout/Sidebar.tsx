import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PRODUCT_NAME } from '@/config/roleNavigation';
import { formatRoleLabel } from '@/utils/roles';
import type { NavItem, UserRole } from '@/types';

interface SidebarProps {
  items: NavItem[];
  role: UserRole;
  orgLabel: string;
}

function userInitials(first?: string | null, last?: string | null) {
  const a = first?.trim()?.[0] ?? '';
  const b = last?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

export function Sidebar({ items, role, orgLabel }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const brandLabel = role === 'super_admin' ? `⚕ ${PRODUCT_NAME}` : `⚕ ${orgLabel}`;

  return (
    <aside className="crm-mock-side">
      <NavLink to={items[0]?.path ?? '/'} className="crm-mock-brand" style={{ textDecoration: 'none' }}>
        {brandLabel}
      </NavLink>

      <nav className="crm-mock-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.endsWith('/dashboard')}
            className={({ isActive }) => `crm-mnav${isActive ? ' on' : ''}`}
          >
            {item.icon && <span className="crm-mnav-icon">{item.icon}</span>}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="crm-mock-side-foot">
        <div className="crm-mock-user-avatar">{userInitials(user?.firstName, user?.lastName)}</div>
        <div className="crm-mock-user-name">
          {user?.firstName} {user?.lastName}
        </div>
        <div className="crm-mock-user-role">{formatRoleLabel(role)}</div>
        <button
          type="button"
          className="crm-mock-signout"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function resolvePageTitle(pathname: string, navItems: NavItem[]) {
  const match = navItems.find((n) => pathname === n.path || pathname.startsWith(`${n.path}/`));
  return match?.label ?? PRODUCT_NAME;
}
