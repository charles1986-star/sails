export default function Avatar({ name, size = 40, avatar = null, onClick = null, className = '' }) {
  const initials = (name || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  
  // Avatar presets - can be selected by user
  const avatarPresets = {
    default: { bg: '#e6f8ec', color: '#0b5e3c' },
    blue: { bg: '#e3f2fd', color: '#1565c0' },
    purple: { bg: '#f3e5f5', color: '#7b1fa2' },
    red: { bg: '#ffebee', color: '#c62828' },
    orange: { bg: '#ffe0b2', color: '#e65100' },
    green: { bg: '#c8e6c9', color: '#2e7d32' },
    pink: { bg: '#fce4ec', color: '#c2185b' },
    teal: { bg: '#b2dfdb', color: '#00695c' },
  };

  const selectedPreset = avatarPresets[avatar] || avatarPresets.default;
  
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: selectedPreset.bg,
    color: selectedPreset.color,
    fontWeight: 700,
    fontSize: size * 0.4,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease',
  };
  
  return (
    <div 
      style={style} 
      className={`avatar ${className}`}
      onClick={onClick}
      title={onClick ? 'Go to My Account' : ''}
    >
      {initials}
    </div>
  );
}
