'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const mountedRef = useRef(true);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        // Ignore - scanner may already be stopped
      }
      isRunningRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let html5QrCode: Html5Qrcode | null = null;
    
    const startScanner = async () => {
      if (manualEntry) {
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);
      setError(null);

      // Wait for DOM
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!mountedRef.current) return;

      const containerId = 'scanner-video-container';
      const container = document.getElementById(containerId);
      
      if (!container) {
        setError('Scanner container not found');
        setIsInitializing(false);
        return;
      }

      try {
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: 250
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          async (decodedText) => {
            if (!mountedRef.current) return;
            await stopScanner();
            onScan(decodedText);
          },
          () => {
            // Scan error - ignore, keep trying
          }
        );

        isRunningRef.current = true;
        
        if (mountedRef.current) {
          setHasPermission(true);
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error('Scanner error:', err);
        
        if (mountedRef.current) {
          setIsInitializing(false);
          setHasPermission(false);
          
          const msg = err?.message || String(err);
          if (msg.includes('Permission') || msg.includes('NotAllowed')) {
            setError('Camera permission denied. Tap "Enter Manually" below.');
          } else if (msg.includes('NotFound')) {
            setError('No camera found. Tap "Enter Manually" below.');
          } else {
            setError('Could not start camera. Tap "Enter Manually" below.');
          }
        }
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      if (html5QrCode && isRunningRef.current) {
        html5QrCode.stop().catch(() => {});
        isRunningRef.current = false;
      }
    };
  }, [manualEntry, onScan, stopScanner]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = manualBarcode.trim();
    if (barcode) {
      onScan(barcode);
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  const toggleManualEntry = async () => {
    if (!manualEntry) {
      await stopScanner();
    }
    setManualEntry(!manualEntry);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Scan Barcode</h2>
          <button 
            onClick={handleClose}
            className="text-white p-2 text-2xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!manualEntry ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {isInitializing && (
              <div className="text-white text-center">
                <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Starting camera...</p>
              </div>
            )}
            
            <div 
              id="scanner-video-container"
              className="w-full max-w-md bg-gray-900 rounded-lg overflow-hidden"
              style={{ 
                height: '300px',
                display: isInitializing ? 'none' : 'block'
              }}
            />

            {!isInitializing && hasPermission && (
              <p className="text-gray-400 text-sm mt-4 text-center">
                Point camera at barcode
              </p>
            )}
            
            {error && (
              <div className="text-white text-center p-4 mt-4 bg-red-900/70 rounded-lg max-w-sm">
                <p>{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <form onSubmit={handleManualSubmit} className="w-full max-w-sm">
              <label className="text-white block mb-2 text-lg">Enter barcode number:</label>
              <input
                type="text"
                inputMode="numeric"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="e.g., 049000006346"
                className="w-full p-4 rounded-lg text-lg mb-4 text-black"
                autoFocus
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-semibold"
              >
                Check Product
              </button>
              <p className="text-gray-400 text-sm mt-4 text-center">
                The barcode is usually on the back or bottom of the package
              </p>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="bg-black p-4 flex-shrink-0">
        <button
          onClick={toggleManualEntry}
          className="w-full text-white py-3 border border-white/50 rounded-lg"
        >
          {manualEntry ? '📷 Use Camera' : '⌨️ Enter Manually'}
        </button>
      </div>
    </div>
  );
}
