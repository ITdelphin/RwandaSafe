import { COLORS } from "../config/constants";

export const Icon = ({ name, size = 16, color }) => (
    <i
        className={`ti ti-${name}`}
        style={{ fontSize: size, color, lineHeight: 1 }}
        aria-hidden="true"
    />
);

export const LevelBadge = ({ level }) => {
    const map = { Critical: "critical", High: "high", Medium: "medium", Low: "low" };
    const iconMap = {
        Critical: "flame",
        High: "alert-triangle",
        Medium: "alert-circle",
        Low: "info-circle",
    };
    return (
        <span className={`badge badge-${map[level] || "low"}`}>
            <Icon name={iconMap[level] || "info-circle"} size={11} />
            {level}
        </span>
    );
};

export const StatusBadge = ({ status }) => {
    const map = {
        Open: "open",
        "In Progress": "progress",
        Resolved: "closed",
        Pending: "pending",
        Rejected: "danger",
    };
    return <span className={`badge badge-${map[status] || "open"}`}>{status}</span>;
};
