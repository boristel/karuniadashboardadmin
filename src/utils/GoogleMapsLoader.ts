'use client';

// Global state to track if Google Maps API is loading or loaded
let isLoading = false;
let isLoaded = false;
let loadCallbacks: (() => void)[] = [];

export const GoogleMapsLoader = {
  /**
   * Load Google Maps API with callback
   */
  load: (apiKey: string, callback?: () => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (isLoaded && window.google && window.google.maps) {
        callback?.();
        resolve();
        return;
      }

      // Add callback to queue
      if (callback) {
        loadCallbacks.push(callback);
      }

      // If already loading, just add to queue and wait
      if (isLoading) {
        const checkLoaded = setInterval(() => {
          if (isLoaded) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 100);
        return;
      }

      // Start loading
      isLoading = true;

      const scriptId = 'google-maps-api-script';

      // Check if script already exists
      if (document.getElementById(scriptId)) {
        // Script exists but API not loaded yet
        const checkApi = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkApi);
            GoogleMapsLoader.onApiLoaded();
            resolve();
          }
        }, 100);
        return;
      }

      // Create and append script
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=googleMapsApiCallback`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        isLoading = false;
        const error = new Error('Failed to load Google Maps API');
        reject(error);
      };

      // Global callback for Google Maps API
      (window as any).googleMapsApiCallback = () => {
        GoogleMapsLoader.onApiLoaded();
        resolve();
      };

      document.head.appendChild(script);
    });
  },

  /**
   * Called when Google Maps API is loaded
   */
  onApiLoaded: () => {
    isLoading = false;
    isLoaded = true;

    // Execute all queued callbacks
    loadCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in Google Maps callback:', error);
      }
    });

    // Clear callbacks
    loadCallbacks = [];
  },

  /**
   * Check if Google Maps API is loaded
   */
  isLoaded: (): boolean => {
    return isLoaded && !!(window.google && window.google.maps);
  },

  /**
   * Wait for Google Maps to be loaded
   */
  waitForLoad: (): Promise<void> => {
    return new Promise((resolve) => {
      if (GoogleMapsLoader.isLoaded()) {
        resolve();
        return;
      }

      const checkLoaded = setInterval(() => {
        if (GoogleMapsLoader.isLoaded()) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
    });
  }
};

// Add TypeScript declarations for Google Maps
declare global {
  interface Window {
    google: any;
    googleMapsApiCallback?: () => void;
  }
}