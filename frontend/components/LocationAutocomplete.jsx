import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';

export default function LocationAutocomplete({ 
  onSelect, 
  onInputChange,
  defaultValue = "", 
  className = "",
  placeholder = "Search for an address..." 
}) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  
  // Get current location hook
  const { 
    location: gpsCoords, 
    address: gpsAddress, 
    loading: gpsLoading, 
    getCurrentLocation 
  } = useLocation();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3 || !isOpen) return;
      
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update query if default value changes (e.g. edit mode)
  useEffect(() => {
    if (defaultValue) {
        setQuery(defaultValue);
    }
  }, [defaultValue]);

  // Handle GPS Update
  useEffect(() => {
    if (gpsCoords && gpsAddress) {
      setQuery(gpsAddress);
      onSelect({
        display_name: gpsAddress,
        lat: gpsCoords.latitude,
        lon: gpsCoords.longitude
      });
      if (onInputChange) onInputChange(gpsAddress);
    } else if (gpsLoading) {
        setQuery("Locating...");
    }
  }, [gpsCoords, gpsAddress, gpsLoading]);

  const handleSelect = (item) => {
    setQuery(item.display_name);
    setIsOpen(false);
    onSelect(item);
    if (onInputChange) onInputChange(item.display_name);
  };

  const handleManualChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (onInputChange) onInputChange(val);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
        Pickup Location
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          type="text"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-12 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
          placeholder={placeholder}
          value={query}
          onChange={handleManualChange}
          onFocus={() => setIsOpen(true)}
          required
        />
        
        {/* GPS Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gpsLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
          title="Use Current Location"
        >
          {gpsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {results.map((item) => (
            <li
              key={item.place_id}
              className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-teal-50 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              <div className="flex items-start gap-2">
                 <MapPin className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                 <span className="block truncate">{item.display_name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {/* Loading State for Search */}
      {isOpen && loading && query.length >= 3 && (
         <div className="absolute z-50 mt-1 w-full rounded-xl bg-white py-2 px-4 shadow-lg ring-1 ring-black ring-opacity-5 text-sm text-gray-500">
            Searching...
         </div>
      )}
      
      {/* No Results */}
      {isOpen && !loading && results.length === 0 && query.length >= 3 && (
         <div className="absolute z-50 mt-1 w-full rounded-xl bg-white py-2 px-4 shadow-lg ring-1 ring-black ring-opacity-5 text-sm text-gray-500">
            No address found. Try a different query.
         </div>
      )}
      
      <p className="mt-1 text-xs text-gray-500 ml-1">
        Search and select an address to set precise GPS location.
      </p>
    </div>
  );
}
