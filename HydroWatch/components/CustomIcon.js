import React from 'react';
import { Text } from 'react-native';

// Simple icon component using text symbols
const CustomIcon = ({ name, size = 16, color = '#000', style, ...props }) => {
  const getIconSymbol = (iconName) => {
    const iconMap = {
      // Navigation and UI
      'chevron-up': '▲',
      'chevron-down': '▼',
      'chevron-left': '◀',
      'chevron-right': '▶',
      'arrow-up': '↑',
      'arrow-down': '↓',
      'arrow-left': '←',
      'arrow-right': '→',
      'times': '✕',
      'plus': '+',
      'minus': '-',
      'check': '✓',
      
      // Location and mapping
      'map': '🗺',
      'map-pin': '📍',
      'search-location': '🔍',
      'satellite-dish': '📡',
      'location-arrow': '🧭',
      
      // Data and monitoring
      'tint': '💧',
      'chart-line': '📈',
      'chart-bar': '📊',
      'clipboard-list': '📋',
      'database': '🗄',
      'server': '💾',
      
      // Actions
      'search': '🔍',
      'filter': '🔽',
      'refresh': '🔄',
      'download': '⬇',
      'upload': '⬆',
      'share': '📤',
      
      // Status
      'wifi': '📶',
      'signal': '📶',
      'battery': '🔋',
      'power-off': '⏻',
      
      // General
      'home': '🏠',
      'user': '👤',
      'users': '👥',
      'cog': '⚙',
      'bell': '🔔',
      'heart': '❤',
      'star': '⭐',
      'bookmark': '🔖',
      'tag': '🏷',
      'calendar': '📅',
      'clock': '🕐',
      'eye': '👁',
      'eye-slash': '🚫',
      'lock': '🔒',
      'unlock': '🔓',
      'key': '🔑',
      'shield': '🛡',
      'warning': '⚠',
      'info': 'ℹ',
      'question': '?',
      'exclamation': '!',
      
      // Building and places
      'building': '🏢',
      'home-alt': '🏠',
      'city': '🏙',
      
      // List and layout
      'list': '☰',
      'th': '▦',
      'th-list': '☷',
      
      // Default fallback
      'default': '●'
    };
    
    return iconMap[iconName] || iconMap['default'];
  };

  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color,
          textAlign: 'center',
          includeFontPadding: false,
        },
        style
      ]}
      {...props}
    >
      {getIconSymbol(name)}
    </Text>
  );
};

export default CustomIcon;