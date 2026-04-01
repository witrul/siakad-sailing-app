/*
 * Capacitor Bridge for SIAKAD Sailing Malang
 * This script provides a unified interface for Camera and Geolocation,
 * automatically switching between Capacitor native plugins and standard Web APIs.
 */

const AppInterface = {
  // Check if running in Capacitor
  isCapacitor: () => {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform());
  },

  // Geolocation
  async getCurrentPosition() {
    if (this.isCapacitor()) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const coordinates = await Geolocation.getCurrentPosition();
        return {
          latitude: coordinates.coords.latitude,
          longitude: coordinates.coords.longitude,
          accuracy: coordinates.coords.accuracy,
          source: 'native'
        };
      } catch (error) {
        console.error('Capacitor Geolocation Error:', error);
        throw error;
      }
    } else {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser.'));
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              source: 'web'
            });
          },
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }
  },

  // Camera / QR Scanner
  async takePicture() {
    if (this.isCapacitor()) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt // Asks user: Camera or Photos
        });
        return image.webPath; // Returns local URI to be used in <img> or uploaded
      } catch (error) {
        console.error('Capacitor Camera Error:', error);
        throw error;
      }
    } else {
      // Fallback: Trigger standard file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            resolve(URL.createObjectURL(file));
          }
        };
        input.click();
      });
    }
  },

  // Example: Request Permissions
  async requestPermissions() {
    if (this.isCapacitor()) {
      const { Geolocation } = await import('@capacitor/geolocation');
      const { Camera } = await import('@capacitor/camera');
      
      await Geolocation.requestPermissions();
      await Camera.requestPermissions();
    }
  }
};

// Export to window if not using modules
window.AppInterface = AppInterface;
