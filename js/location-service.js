// Location Service using Leaflet and Geolocation API
class LocationService {
    constructor() {
        this.userLocation = null;
        this.map = null;
        this.marker = null;
        this.address = null;
    }

    // Get user's current location
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    
                    // Store location in localStorage
                    localStorage.setItem('userLocation', JSON.stringify(this.userLocation));
                    
                    console.log('📍 Location obtained:', this.userLocation);
                    resolve(this.userLocation);
                },
                (error) => {
                    console.error('Location error:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    // Get address from coordinates using reverse geocoding
    async getAddressFromCoords(lat, lon) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'LiveMart/1.0'
                    }
                }
            );
            
            const data = await response.json();
            
            this.address = {
                fullAddress: data.display_name,
                city: data.address.city || data.address.town || data.address.village || '',
                state: data.address.state || '',
                country: data.address.country || '',
                postcode: data.address.postcode || '',
                road: data.address.road || '',
                suburb: data.address.suburb || ''
            };
            
            localStorage.setItem('userAddress', JSON.stringify(this.address));
            
            console.log('📍 Address obtained:', this.address);
            return this.address;
        } catch (error) {
            console.error('Error getting address:', error);
            return null;
        }
    }

    // Create a map in a given container
    createMap(containerId, lat, lon, zoom = 15) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('Map container not found:', containerId);
            return null;
        }

        // Initialize map
        this.map = L.map(containerId).setView([lat, lon], zoom);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add marker at location
        this.marker = L.marker([lat, lon]).addTo(this.map);
        
        return this.map;
    }

    // Update marker position
    updateMarker(lat, lon, popupText = '') {
        if (this.marker && this.map) {
            this.marker.setLatLng([lat, lon]);
            if (popupText) {
                this.marker.bindPopup(popupText).openPopup();
            }
            this.map.setView([lat, lon]);
        }
    }

    // Calculate distance between two coordinates (in km)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance.toFixed(2);
    }

    toRad(deg) {
        return deg * (Math.PI / 180);
    }

    // Get stored location from localStorage
    getStoredLocation() {
        const stored = localStorage.getItem('userLocation');
        if (stored) {
            this.userLocation = JSON.parse(stored);
            return this.userLocation;
        }
        return null;
    }

    // Get stored address from localStorage
    getStoredAddress() {
        const stored = localStorage.getItem('userAddress');
        if (stored) {
            this.address = JSON.parse(stored);
            return this.address;
        }
        return null;
    }

    // Request location permission and get location
    async requestLocationPermission() {
        try {
            const location = await this.getCurrentLocation();
            const address = await this.getAddressFromCoords(location.latitude, location.longitude);
            
            return {
                location,
                address,
                success: true
            };
        } catch (error) {
            console.error('Error requesting location:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Display location info in UI
    displayLocationInfo(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const location = this.getStoredLocation();
        const address = this.getStoredAddress();

        if (location && address) {
            element.innerHTML = `
                <div class="location-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>${address.city || 'Unknown'}, ${address.state || ''}</strong>
                        <p style="font-size: 12px; color: #666;">${address.road || address.fullAddress}</p>
                    </div>
                </div>
            `;
        } else {
            element.innerHTML = `
                <div class="location-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Location not set</span>
                    <button onclick="locationService.requestLocationPermission()" class="btn-small">
                        Enable Location
                    </button>
                </div>
            `;
        }
    }
}

// Create global instance
window.locationService = new LocationService();

// Auto-request location on page load (if not already stored)
document.addEventListener('DOMContentLoaded', () => {
    const stored = locationService.getStoredLocation();
    
    if (!stored) {
        // Show location permission prompt after 2 seconds
        setTimeout(() => {
            if (confirm('Live Mart would like to access your location to show nearby retailers and calculate delivery charges. Allow?')) {
                locationService.requestLocationPermission().then(result => {
                    if (result.success) {
                        console.log('✅ Location enabled:', result.address.city);
                        // Reload any location-dependent UI
                        window.dispatchEvent(new Event('locationUpdated'));
                    } else {
                        console.log('❌ Location access denied');
                    }
                });
            }
        }, 2000);
    } else {
        console.log('📍 Using stored location:', stored);
        // Dispatch event for location-dependent components
        window.dispatchEvent(new Event('locationUpdated'));
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationService;
}

console.log('🗺️ Location Service loaded successfully!');
