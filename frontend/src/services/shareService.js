// frontend/src/services/shareService.js
import api from './api';

class ShareService {
  async createShare(routeData, locations, weatherData, options = {}) {
    const response = await api.post('/share/create', {
      routeData,
      locations,
      weatherData,
      options
    });
    return response.data.data;
  }

  async getSharedRoute(shareToken) {
    const response = await api.get(`/share/${shareToken}`);
    return response.data.data;
  }

  async getUserShares() {
    const response = await api.get('/share/user/shares');
    return response.data.data.shares;
  }

  async deleteShare(shareToken) {
    await api.delete(`/share/${shareToken}`);
  }

  async generateShareMessage(routeData, startLocation, endLocation) {
    const response = await api.post('/share/generate-message', {
      routeData,
      startLocation,
      endLocation
    });
    return response.data.data.message;
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  shareViaWhatsApp(message, url) {
    const encodedMessage = encodeURIComponent(`${message}\n\n${url}`);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  }

  shareViaEmail(message, url, subject = 'My Travel Plan on WeatherRoute') {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(`${message}\n\n${url}`);
    window.open(`mailto:?subject=${encodedSubject}&body=${encodedBody}`);
  }

  downloadQRCode(qrCodeDataUrl) {
    const link = document.createElement('a');
    link.download = 'route-share-qrcode.png';
    link.href = qrCodeDataUrl;
    link.click();
  }
}

export default new ShareService();