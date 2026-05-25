import { COLORS } from "../config/constants";
import { Icon } from "./Badges";

const TopBar = ({ user, notifications, onToggleNotif, onLogout, onNavigate }) => (
    <div className="topbar">
        <div className="topbar-left">
            <div className="topbar-logo-icon">
                <Icon name="shield-check" size={18} color="#fff" />
            </div>
            <span className="logo-text">
                Safe<span>Rwanda</span>
            </span>
        </div>
        <div className="topbar-right">
            {user && (
                <button className="sidebar-link topbar-notif-btn" onClick={onToggleNotif}>
                    <div style={{ position: "relative" }}>
                        <Icon name="bell" size={18} />
                        {notifications > 0 && <span className="notif-count">{notifications}</span>}
                    </div>
                </button>
            )}
            {user ? (
                <div className="topbar-user">
                    <div className="topbar-avatar">{user.name[0]}</div>
                    <div className="topbar-user-info">
                        <span className="topbar-user-name">{user.name}</span>
                        <span className="topbar-user-role">{user.role}</span>
                    </div>
                    <button
                        className="btn-secondary"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        className="btn-secondary"
                        style={{ padding: "6px 14px", fontSize: 13 }}
                        onClick={() => onNavigate("/login")}
                    >
                        Log In
                    </button>
                    <button
                        className="btn-primary"
                        style={{ padding: "6px 14px", fontSize: 13 }}
                        onClick={() => onNavigate("/register")}
                    >
                        Register
                    </button>
                </div>
            )}
        </div>
    </div>
);

export default TopBar;
