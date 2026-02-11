import React, { useRef,  useEffect } from 'react';
import MapGL, { Marker, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '../../lib/utils'; // Assuming this exists, if not I'll create or remove

// Basic Map Component
const Map = ({ 
    initialViewState, 
    style, 
    mapStyle = "https://demotiles.maplibre.org/style.json",
    children,
    className,
    ...props 
}) => {
    return (
        <div className={cn("relative w-full h-full rounded-md overflow-hidden", className)} style={style}>
            <MapGL
                initialViewState={initialViewState || {
                    longitude: 0,
                    latitude: 0,
                    zoom: 3.5
                }}
                mapStyle={mapStyle}
                {...props}
            >
                <GeolocateControl position="top-left" />
                <FullscreenControl position="top-left" />
                <NavigationControl position="top-left" />
                <ScaleControl />
                {children}
            </MapGL>
        </div>
    );
};

// Map Marker Component
const MapMarker = ({ longitude, latitude, color = "red", onClick, children }) => {
    return (
        <Marker longitude={longitude} latitude={latitude} onClick={onClick}>
            {children ? children : (
                <svg
                    height="30"
                    viewBox="0 0 24 24"
                    style={{
                        cursor: 'pointer',
                        fill: color,
                        stroke: 'none',
                        transform: `translate(${-30 / 2}px,${-30}px)`
                    }}
                >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
            )}
        </Marker>
    );
};

export { Map, MapMarker };
