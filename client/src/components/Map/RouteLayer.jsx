import React from 'react';

function RouteLayer({ route }) {
  if (!route || !route.coordinates || route.coordinates.length === 0) {
    return null;
  }

  // Convert coordinates to SVG path
  const points = route.coordinates.map((c) => {
    const x = ((c.lng - 77.35) / (77.80 - 77.35)) * 500;
    const y = ((13.15 - c.lat) / (13.15 - 12.75)) * 400;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  return (
    <g>
      {/* Route shadow */}
      <path d={pathD} fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="6" strokeLinecap="round" />
      {/* Route line */}
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8,4">
        <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.5s" repeatCount="indefinite" />
      </path>
      {/* Route waypoints */}
      {route.coordinates.map((c, i) => {
        const x = ((c.lng - 77.35) / (77.80 - 77.35)) * 500;
        const y = ((13.15 - c.lat) / (13.15 - 12.75)) * 400;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="#3b82f6" />
            <text x={x + 6} y={y - 6} fill="#94a3b8" fontSize="6" fontFamily="Inter">
              {c.name || `Stop ${i + 1}`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default RouteLayer;
