'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';

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
  const [containerReady, setContainerReady] = useState(false);
  
  const scannerRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(false);
  const mountedRef = useRef(true);
  const lastScannedRef = useRef<string | null>(null);

  const stopScanner = useCallback(() => {
    if (isRunningRef.current) {
      try {
        Quagga.offDetected();
        Quagga.stop();
      } catch (err) {
        // Ignore - scanner may already be stopped
      }
      isRunningRef.current = false;
    }
  }, []);

  // Wait for container to be rendered with actual dimensions
  useEffect(() => {
    if (manualEntry) {
      setContainerReady(false);
      return;
    }

    const checkContainer = () => {
      if (!scannerRef.current) return false;
      const { offsetWidth, offsetHeight } = scannerRef.current;
      return offsetWidth > 0 && offsetHeight > 0;
    };

    // Check immediately
    if (checkContainer()) {
      setContainerReady(true);
      return;
    }

    // Poll until ready (handles async rendering)
    const interval = setInterval(() => {
      if (checkContainer()) {
        setContainerReady(true);
        clearInterval(interval);
      }
    }, 50);

    // Cleanup
    return () => clearInterval(interval);
  }, [manualEntry]);

  // Initialize Quagga only when container is ready
  useEffect(() => {
    if (!containerReady || manualEntry) {
      return;
    }

    mountedRef.current = true;
    lastScannedRef.current = null;
    
    const initScanner = async () => {
      const container = scannerRef.current;
      if (!container) {
        console.error('[Scanner] Container ref is null');
        setError('Scanner container not found. Tap "Enter Manually" below.');
        setIsInitializing(false);
        return;
      }

      // Double-check dimensions
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      if (!width || !height || width <= 0 || height <= 0) {
        console.error(`[Scanner] Invalid dimensions: ${width}x${height}`);
        setError('Scanner failed to initialize. Tap "Enter Manually" below.');
        setIsInitializing(false);
        return;
      }

      console.log(`[Scanner] Container ready: ${width}x${height}`);

      try {
        await new Promise<void>((resolve, reject) => {
          Quagga.init({
            inputStream: {
              type: 'LiveStream',
              target: container,
              constraints: {
                facingMode: 'environment',
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
              },
            },
            locator: {
              patchSize: 'medium',
              halfSample: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            frequency: 10,
            decoder: {
              readers: [
                'upc_reader',
                'upc_e_reader',
                'ean_reader',
                'ean_8_reader',
                'code_128_reader',
                'code_39_reader',
              ],
            },
            locate: true,
          }, (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });

        if (!mountedRef.current) {
          Quagga.stop();
          return;
        }

        Quagga.start();
        isRunningRef.current = true;

        // Handle successful scans
        Quagga.onDetected((result) => {
          if (!mountedRef.current) return;
          
          const code = result.codeResult?.code;
          if (!code) return;
          
          // Debounce: ignore if same code scanned within 1 second
          if (lastScannedRef.current === code) return;
          lastScannedRef.current = code;
          
          // Stop scanner and report result
          stopScanner();
          onScan(code);
        });

        if (mountedRef.current) {
          setHasPermission(true);
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error('[Scanner] Init error:', err);
        
        if (mountedRef.current) {
          setIsInitializing(false);
          setHasPermission(false);
          
          const msg = err?.message || String(err);
          if (msg.includes('Permission') || msg.includes('NotAllowed')) {
            setError('Camera permission denied. Tap "Enter Manually" below.');
          } else if (msg.includes('NotFound') || msg.includes('not found')) {
            setError('No camera found. Tap "Enter Manually" below.');
          } else if (msg.includes('NotReadable') || msg.includes('in use')) {
            setError('Camera is in use by another app. Tap "Enter Manually" below.');
          } else {
            setError('Could not start camera. Tap "Enter Manually" below.');
          }
        }
      }
    };

    initScanner();

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [containerReady, manualEntry, onScan, stopScanner]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = manualBarcode.trim();
    if (barcode) {
      onScan(barcode);
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const toggleManualEntry = () => {
    if (!manualEntry) {
      stopScanner();
      setContainerReady(false);
    }
    setManualEntry(!manualEntry);
    setIsInitializing(true);
    setError(null);
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
              <div className="text-white text-center mb-4">
                <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Starting camera...</p>
              </div>
            )}
            
            {/* Container is ALWAYS rendered so we can measure it */}
            <div 
              ref={scannerRef}
              className="w-full max-w-lg bg-gray-900 rounded-lg overflow-hidden relative"
              style={{ 
                height: '350px',
                minHeight: '350px',
                opacity: isInitializing ? 0.3 : 1,
              }}
            />

            {!isInitializing && hasPermission && (
              <p className="text-gray-400 text-sm mt-4 text-center">
                Point camera at barcode — it will scan automatically
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
