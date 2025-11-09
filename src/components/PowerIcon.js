import React from 'react';
import Svg, { Path } from 'react-native-svg';

const PowerIcon = ({ size = 24, color = '#fff' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2V12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M8.5 4.5C6.3 5.7 5 8.1 5 11C5 15.4 8.6 19 13 19C17.4 19 21 15.4 21 11C21 8.1 19.7 5.7 17.5 4.5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default PowerIcon;
