"use client";

export default function LocationDetailsModal({ isOpen, onClose, province }) {
  if (!isOpen || !province) return null;

  // Parse location_details if it's a JSON string
  const locationDetails = typeof province.location_details === 'string'
    ? JSON.parse(province.location_details || '{}')
    : (province.location_details || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Backdrop with blur and opacity */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with brand colors */}
        <div className="sticky top-0 bg-gradient-to-r from-brand-blue to-brand-pink text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <h2 className="text-2xl font-bold">{province.name}</h2>
              </div>
              {province.formatted_address && (
                <p className="text-white/80 text-sm">{province.formatted_address}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Full Address - Featured */}
          {locationDetails.full_address && (
            <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-brand-blue/30">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-brand-pink rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-brand-pink uppercase tracking-wide mb-1">Alamat Lengkap</p>
                  <p className="text-base font-semibold text-gray-900 leading-relaxed">{locationDetails.full_address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Coordinates - Smaller and less prominent */}
          <div className="flex items-center gap-4 mb-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Koordinat:</span>
              <span>{parseFloat(province.latitude).toFixed(4)}, {parseFloat(province.longitude).toFixed(4)}</span>
            </div>
          </div>

          {/* Essential Information Cards */}
          {(locationDetails.cost_of_living || locationDetails.housing_allowance) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {locationDetails.cost_of_living && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-brand-blue/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-brand-blue mb-1">Biaya Hidup</p>
                      <p className="text-sm text-gray-700 font-medium">{locationDetails.cost_of_living}</p>
                    </div>
                  </div>
                </div>
              )}

              {locationDetails.housing_allowance && (
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border-2 border-brand-pink/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-brand-pink rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-xl">🏠</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-brand-pink mb-1">Tunjangan Perumahan</p>
                      <p className="text-sm text-gray-700 font-medium">{locationDetails.housing_allowance}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Info Highlights */}
          {locationDetails.key_info && Array.isArray(locationDetails.key_info) && (
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-5 border-2 border-brand-blue/30 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✨</span>
                <h3 className="text-base font-bold bg-gradient-to-r from-brand-blue to-brand-pink bg-clip-text text-transparent">Keunggulan Lokasi</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {locationDetails.key_info.map((info, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-brand-pink flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Location Details Section */}
          {Object.keys(locationDetails).length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Informasi Detail
              </h3>

              {locationDetails.address && locationDetails.address !== locationDetails.full_address && (
                <div className="border-l-4 border-brand-blue pl-4 py-2">
                  <p className="text-sm font-semibold text-brand-blue mb-1">Building/Office</p>
                  <p className="text-gray-900">{locationDetails.address}</p>
                </div>
              )}

              {locationDetails.facilities && (
                <div className="border-l-4 border-brand-blue pl-4 py-2">
                  <p className="text-sm font-semibold text-brand-blue mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(locationDetails.facilities) ? (
                      locationDetails.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-brand-blue border border-brand-blue/30 font-medium"
                        >
                          {facility}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-900">{locationDetails.facilities}</p>
                    )}
                  </div>
                </div>
              )}

              {locationDetails.contact && (
                <div className="border-l-4 border-brand-pink pl-4 py-2">
                  <p className="text-sm font-semibold text-brand-pink mb-1">Contact</p>
                  <p className="text-gray-900">{locationDetails.contact}</p>
                </div>
              )}

              {locationDetails.description && (
                <div className="border-l-4 border-brand-blue pl-4 py-2">
                  <p className="text-sm font-semibold text-brand-blue mb-1">Description</p>
                  <p className="text-gray-900">{locationDetails.description}</p>
                </div>
              )}

              {/* Render any other custom fields (except the ones already shown) */}
              {Object.entries(locationDetails).map(([key, value]) => {
                if (['address', 'facilities', 'contact', 'description', 'cost_of_living', 'housing_allowance', 'key_info'].includes(key)) {
                  return null;
                }
                return (
                  <div key={key} className="border-l-4 border-gray-500 pl-4 py-2">
                    <p className="text-sm font-semibold text-gray-700 mb-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-gray-900">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="font-medium text-gray-900 mb-1">No additional details available</p>
              <p className="text-sm text-gray-600">
                Location details will be added soon.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Close
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${province.latitude},${province.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
