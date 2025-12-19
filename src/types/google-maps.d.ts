declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement | null, options: google.maps.MapOptions) => google.maps.Map;
        Marker: new (options?: google.maps.MarkerOptions) => google.maps.Marker;
        event: {
          addListener(
            instance: any,
            eventName: string,
            handler: (...args: any[]) => void
          ): google.maps.MapsEventListener;
          clearListeners(instance: any, eventName: string): void;
          clearInstanceListeners(instance: any): void;
        };
        places: {
          Autocomplete: new (
            inputField: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
        };
        MapOptions: {
          [key: string]: any;
        };
        MapTypeId: {
          ROADMAP: string;
          SATELLITE: string;
          HYBRID: string;
          TERRAIN: string;
        };
        ControlPosition: {
          TOP_LEFT: number;
          TOP_RIGHT: number;
          BOTTOM_LEFT: number;
          BOTTOM_RIGHT: number;
        };
      };
      maps: {
        Map: class {
          constructor(element: HTMLElement | null, options: google.maps.MapOptions);
          setCenter(latlng: google.maps.LatLng | google.maps.LatLngLiteral): void;
          setZoom(zoom: number): void;
          getCenter(): google.maps.LatLng;
          getZoom(): number;
          panTo(latlng: google.maps.LatLng | google.maps.LatLngLiteral): void;
          addListener(eventName: string, handler: (...args: any[]) => void): google.maps.MapsEventListener;
        };
        Marker: class {
          constructor(options?: google.maps.MarkerOptions);
          setPosition(latlng: google.maps.LatLng | google.maps.LatLngLiteral): void;
          getPosition(): google.maps.LatLng | null;
          setMap(map: google.maps.Map | null): void;
          setMap(map: null): void;
          addListener(eventName: string, handler: (...args: any[]) => void): google.maps.MapsEventListener;
        };
        LatLng: class {
          constructor(lat: number, lng: number);
          lat(): number;
          lng(): number;
        };
        LatLngLiteral: {
          lat: number;
          lng: number;
        };
        MapOptions: {
          center?: google.maps.LatLng | google.maps.LatLngLiteral;
          zoom?: number;
          mapTypeId?: string;
          mapTypeControl?: boolean;
          streetViewControl?: boolean;
          fullscreenControl?: boolean;
          zoomControl?: boolean;
          [key: string]: any;
        };
        MarkerOptions: {
          position?: google.maps.LatLng | google.maps.LatLngLiteral;
          map?: google.maps.Map | null;
          draggable?: boolean;
          title?: string;
          [key: string]: any;
        };
        MapsEventListener: {
          remove(): void;
        };
        places: {
          Autocomplete: class {
            constructor(
              inputField: HTMLInputElement,
              options?: google.maps.places.AutocompleteOptions
            );
            addListener(
              eventName: string,
              handler: (event: google.maps.places.PlaceResult) => void
            ): google.maps.MapsEventListener;
            getPlace(): google.maps.places.PlaceResult;
          };
          AutocompleteOptions: {
            types?: string[];
            fields?: string[];
            componentRestrictions?: {
              country?: string | string[];
            };
            bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
            [key: string]: any;
          };
          PlaceResult: {
            place_id?: string;
            geometry?: {
              location?: google.maps.LatLng;
              viewport?: google.maps.LatLngBounds;
            };
            formatted_address?: string;
            name?: string;
            address_components?: google.maps.places.PlaceComponent[];
            [key: string]: any;
          };
          PlaceComponent: {
            long_name?: string;
            short_name?: string;
            types?: string[];
          };
          LatLngBounds: class {
            constructor(
              sw?: google.maps.LatLng | google.maps.LatLngLiteral,
              ne?: google.maps.LatLng | google.maps.LatLngLiteral
            );
          };
          LatLngBoundsLiteral: {
            east: number;
            west: number;
            north: number;
            south: number;
          };
        };
      };
    };
  }
}

export {};