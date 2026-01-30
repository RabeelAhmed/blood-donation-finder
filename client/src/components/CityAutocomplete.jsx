import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", 
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
  "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington",
  "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City",
  "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore",
  "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa",
  "Sacramento", "Atlanta", "Kansas City", "Colorado Springs", "Miami",
  "Raleigh", "Omaha", "Long Beach", "Virginia Beach", "Oakland",
  "Minneapolis", "Tulsa", "Arlington", "Tampa", "New Orleans"
];

const CityAutocomplete = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Close suggestions if clicked outside
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    
    if (val.length > 0) {
      const filtered = CITIES.filter(city => 
        city.toLowerCase().startsWith(val.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (city) => {
    onChange(city);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Enter City"
          value={value}
          onChange={handleChange}
          onFocus={() => value && setIsOpen(true)}
        />
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
          {suggestions.map((city) => (
            <li
              key={city}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
              onClick={() => handleSelect(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityAutocomplete;
