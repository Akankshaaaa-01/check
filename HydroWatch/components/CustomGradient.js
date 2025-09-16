import React from 'react';
import { View } from 'react-native';

// Simple gradient effect using overlapping views
const CustomGradient = ({ colors, style, children, ...props }) => {
  // Use the primary color as base, with some transparency for gradient effect
  const primaryColor = colors[0] || '#1e3a8a';
  
  return (
    <View 
      style={[
        {
          backgroundColor: primaryColor,
        },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

export default CustomGradient;