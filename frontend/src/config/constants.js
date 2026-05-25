// ── Color Palette ────────────────────────────────────────
export const COLORS = {
    primary: "#C8102E", // Red (Danger / Branding)
    primaryDark: "#A80D26",
    primaryLight: "#DC2626",
    secondary: "#1E3A8A", // Dark Blue (Standard Action / Success / System Online)
    secondaryDark: "#172554",
    secondaryLight: "#1E40AF",
    accent: "#F4B400", // Yellow (Warning / Accent)
    bg: "#FFFFFF", // White
    bgCard: "#FFFFFF",
    bgPanel: "#F8FAFC",
    bgInput: "#FFFFFF",
    border: "rgba(0, 0, 0, 0.08)",
    borderStrong: "rgba(0, 0, 0, 0.12)",
    text: "#1E293B",
    textMuted: "#64748B",
    textDim: "#94A3B8",
    success: "#1E3A8A", // Dark Blue
    warning: "#F4B400", // Yellow
    danger: "#C8102E", // Red
    info: "#1E3A8A", // Dark Blue
};


// ── Emergency Types ──────────────────────────────────────
export const EMERGENCY_TYPES = [
    { name: "Theft", icon: "wallet", defaultLevel: "Medium" },
    { name: "Road Accident", icon: "car-crash", defaultLevel: "High" },
    { name: "Fire", icon: "flame", defaultLevel: "Critical" },
    { name: "Assault", icon: "hand-off", defaultLevel: "High" },
    { name: "Suspicious", icon: "search", defaultLevel: "Medium" },
    { name: "Medical", icon: "ambulance", defaultLevel: "High" },
    { name: "Terrorism", icon: "alert-octagon", defaultLevel: "Critical" },
    { name: "Other", icon: "dots", defaultLevel: "Low" },
];

// ── Police Stations ──────────────────────────────────────
export const STATIONS = [
    "Remera Police Station",
    "Kacyiru Police Station",
    "Nyabugogo Police Station",
    "Kanombe Police Station",
    "Nyarugenge Police Station",
    "Gikondo Police Station",
];

// ── Hospitals ────────────────────────────────────────────
export const HOSPITALS = [
    "CHUK Hospital",
    "King Faisal Hospital",
    "Kibagabaga Hospital",
    "Kacyiru Hospital",
];

// ── Officers ─────────────────────────────────────────────
export const OFFICERS = [
    "Sgt. Uwimana K.",
    "Insp. Nkurunziza A.",
    "Sgt. Habimana D.",
    "Insp. Mutesi G.",
    "Cpl. Niyonzima P.",
];

// ── Districts ────────────────────────────────────────────
export const DISTRICTS = [
    "Nyarugenge",
    "Gasabo",
    "Kicukiro",
    "Bugesera",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Nyagatare",
    "Rwamagana",
];
