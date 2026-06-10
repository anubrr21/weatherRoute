// frontend/src/components/share/ShareModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Mail, MessageCircle, Download, Clock, Eye, AlertCircle, Share2 } from 'lucide-react';
import shareService from '../../services/shareService';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, routeData, locations, weatherData }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [shareToken, setShareToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [error, setError] = useState(null);
  const [expiryDays, setExpiryDays] = useState(7);
  const [allowTracking, setAllowTracking] = useState(false);
  
  useEffect(() => {
    if (isOpen && !shareUrl && !isGenerating) {
      generateShare();
    }
  }, [isOpen]);
  
  const generateShare = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Validate data before sending
      if (!routeData || !locations || !weatherData) {
        throw new Error('Missing route data. Please plan a route first.');
      }
      
      console.log('Generating share with:', { routeData, locations, weatherData });
      
      // FIXED: Cache buster added here at the right place
      const result = await shareService.createShare(
        routeData,
        locations,
        weatherData,
        {
          expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null,
          allowTracking,
          _t: Date.now()  // Cache buster - prevents old links from persisting
        }
      );
      
      setShareUrl(result.shareUrl);
      setShareToken(result.shareToken);
      
      // Generate QR Code dynamically (import qrcode only when needed)
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.default.toDataURL(result.shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#3B82F6',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
      
      // Generate share message
      try {
        const message = await shareService.generateShareMessage(
          routeData,
          locations.start.name,
          locations.end.name
        );
        setShareMessage(message);
      } catch (msgError) {
        console.error('Failed to generate message:', msgError);
        // Fallback message
        setShareMessage(`Check out my trip from ${locations.start.name} to ${locations.end.name} on WeatherRoute!`);
      }
      
      toast.success('Share link created successfully!');
      
    } catch (error) {
      console.error('Failed to generate share:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate share link';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    shareService.copyToClipboard(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareViaWhatsApp = () => {
    shareService.shareViaWhatsApp(shareMessage, shareUrl);
  };
  
  const shareViaEmail = () => {
    shareService.shareViaEmail(shareMessage, shareUrl);
  };
  
  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = 'route-share-qrcode.png';
      link.href = qrCodeDataUrl;
      link.click();
      toast.success('QR Code downloaded!');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-300 sticky top-0 bg-white dark:bg-dark-200">
          <h2 className="text-xl font-semibold dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-green-500" />
            Share Route
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {isGenerating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-3"></div>
              <p className="text-gray-500">Generating share link...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
              <button
                onClick={generateShare}
                className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-dark-300 rounded-lg text-sm border border-gray-200 dark:border-dark-400"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    title="Copy link"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scan QR Code
                  </label>
                  <div className="flex justify-center">
                    <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32 rounded-lg shadow" />
                  </div>
                  <button
                    onClick={downloadQRCode}
                    className="mt-2 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1 mx-auto"
                  >
                    <Download className="w-3 h-3" />
                    Download QR Code
                  </button>
                </div>
              )}
              
              {/* Share Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Share via
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={shareViaEmail}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </div>
              </div>
              
              {/* Route Summary */}
              {shareMessage && (
                <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {shareMessage}
                  </p>
                </div>
              )}
              
              {/* Settings */}
              <div className="border-t border-gray-200 dark:border-dark-300 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Link expires in {expiryDays} days
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <Eye className="w-3 h-3" />
                  Anyone with this link can view your route
                </p>
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-300 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;