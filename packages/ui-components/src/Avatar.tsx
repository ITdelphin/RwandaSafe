interface Props {
  name?: string;
  email?: string;
  size?: number;
  color?: string;
  src?: string;
}

export function Avatar({ name, email, size = 32, color = '#1a73e8', src }: Props) {
  const letter = name?.charAt(0)?.toUpperCase() ?? email?.charAt(0)?.toUpperCase() ?? 'U';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: src ? 'transparent' : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: size * 0.4,
        fontWeight: 700,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : letter}
    </div>
  );
}
