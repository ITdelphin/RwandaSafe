import { COLORS } from "../config/constants";
import { Icon } from "./Badges";

const NotificationsPanel = ({ notifications }) => (
    <div className="notifications-panel">
        <div className="notif-header">
            <h3>Notifications</h3>
            <span className="badge badge-critical">
                {notifications.filter((n) => n.unread).length} new
            </span>
        </div>
        {notifications.map((n, i) => (
            <div key={n.id || i} className={`notification-item ${n.unread ? "unread" : ""}`}>
                <div
                    className="notif-icon"
                    style={{ background: `${n.color}20` }}
                >
                    <Icon name={n.icon} size={15} color={n.color} />
                </div>
                <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-sub">{n.sub}</div>
                </div>
            </div>
        ))}
    </div>
);

export default NotificationsPanel;
