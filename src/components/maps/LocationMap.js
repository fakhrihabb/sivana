"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: -2.5489, // Center of Indonesia
  lng: 118.0149,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function LocationMap({ provinces = [], onMarkerClick }) {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    version: "weekly",
  });

  const onLoad = useCallback((map) => {
    setMap(map);

    // Fit bounds to show all markers if there are provinces
    if (provinces && provinces.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      provinces.forEach((province) => {
        if (province.latitude && province.longitude) {
          bounds.extend({
            lat: parseFloat(province.latitude),
            lng: parseFloat(province.longitude),
          });
        }
      });
      map.fitBounds(bounds);
    }
  }, [provinces]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (province) => {
    // Just show the info window, don't open modal yet
    setSelectedProvince(province);
  };

  const handleViewDetailsClick = (province) => {
    // Open the modal when "View Details" is clicked
    if (onMarkerClick) {
      onMarkerClick(province);
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-600 font-medium">Error loading maps</p>
          <p className="text-sm text-gray-600 mt-1">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-3"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {provinces && provinces.length > 0 && provinces.map((province, index) => {
          if (!province.latitude || !province.longitude) return null;

          const position = {
            lat: parseFloat(province.latitude),
            lng: parseFloat(province.longitude),
          };

          return (
            <Marker
              key={`${province.id}-${index}`}
              position={position}
              onClick={() => handleMarkerClick(province)}
              title={province.name}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: "#DE1B5D", // brand-pink
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                scale: 1.5,
                anchor: new window.google.maps.Point(12, 22),
              }}
            />
          );
        })}

        {selectedProvince && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedProvince.latitude),
              lng: parseFloat(selectedProvince.longitude),
            }}
            onCloseClick={() => setSelectedProvince(null)}
          >
            <div className="p-3" style={{ minWidth: '280px', maxWidth: '320px' }}>
              <h3 className="font-bold text-gray-900 mb-3 text-base">{selectedProvince.name}</h3>

              {/* Essential Info Grid */}
              <div className="space-y-2 mb-3">
                {/* Cost of Living */}
                {selectedProvince.location_details?.cost_of_living && (
                  <div className="bg-blue-50 rounded-lg p-2 border border-brand-blue/20">
                    <div className="flex items-start gap-2">
                      <span className="text-base">💰</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-brand-blue">Biaya Hidup</p>
                        <p className="text-xs text-gray-900">{selectedProvince.location_details.cost_of_living}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Housing Allowance */}
                {selectedProvince.location_details?.housing_allowance && (
                  <div className="bg-pink-50 rounded-lg p-2 border border-brand-pink/20">
                    <div className="flex items-start gap-2">
                      <span className="text-base">🏠</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-brand-pink">Tunjangan Perumahan</p>
                        <p className="text-xs text-gray-900">{selectedProvince.location_details.housing_allowance}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Info Highlights */}
                {selectedProvince.location_details?.key_info && Array.isArray(selectedProvince.location_details.key_info) && (
                  <div className="bg-gradient-to-br from-blue-50 to-pink-50 rounded-lg p-2 border border-brand-blue/20">
                    <p className="text-xs font-semibold text-brand-blue mb-1.5">✨ Keunggulan</p>
                    <ul className="space-y-1">
                      {selectedProvince.location_details.key_info.slice(0, 2).map((info, idx) => (
                        <li key={idx} className="text-xs text-gray-900 flex items-start gap-1">
                          <span className="text-brand-pink mt-0.5">•</span>
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleViewDetailsClick(selectedProvince)}
                className="w-full text-sm text-white bg-brand-blue hover:opacity-90 font-medium py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Lihat Detail Lengkap</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
