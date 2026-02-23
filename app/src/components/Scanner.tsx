'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';
import { SproutScanIcon } from './SproutScanIcon';

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
  const readCountRef = useRef<Record<string, number>>({});

  const REQUIRED_READS = 3; // barcode must be detected this many times before accepting

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

    if (checkContainer()) {
      setContainerReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (checkContainer()) {
        setContainerReady(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [manualEntry]);

  // Initialize Quagga only when container is ready
  useEffect(() => {
    if (!containerReady || manualEntry) {
      return;
    }

    mountedRef.current = true;
    lastScannedRef.current = null;
    readCountRef.current = {};

    const initScanner = async () => {
      const container = scannerRef.current;
      if (!container) {
        console.error('[Scanner] Container ref is null');
        setError('Scanner container not found. Tap "Enter Manually" below.');
        setIsInitializing(false);
        return;
      }

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

        Quagga.onDetected((result) => {
          if (!mountedRef.current) return;

          const code = result.codeResult?.code;
          if (!code) return;

          // Skip if we already accepted this barcode
          if (lastScannedRef.current === code) return;

          // Require multiple consistent reads to avoid misreads
          readCountRef.current[code] = (readCountRef.current[code] || 0) + 1;
          if (readCountRef.current[code] < REQUIRED_READS) return;

          lastScannedRef.current = code;
          readCountRef.current = {};

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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1A1A2E' }}>
      {/* Top Bar */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button
          onClick={handleClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SproutScanIcon size={24} />
          <span style={{ fontFamily: 'var(--font-display, Nunito, system-ui)', fontWeight: 800, fontSize: '16px', color: 'white' }}>
            SproutScan
          </span>
        </div>

        <div style={{ width: 40, height: 40 }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!manualEntry ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {isInitializing && (
              <div className="text-center mb-4">
                <div
                  className="animate-spin w-10 h-10 rounded-full mx-auto mb-4"
                  style={{ border: '3px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--brand-coral)' }}
                ></div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Starting camera...</p>
              </div>
            )}

            {/* Scanner container with viewfinder overlay */}
            <div className="relative w-full max-w-lg" style={{ height: '350px', minHeight: '350px' }}>
              {/* Camera feed container */}
              <div
                ref={scannerRef}
                className="w-full h-full rounded-2xl overflow-hidden"
                style={{
                  background: '#0D0D1A',
                  opacity: isInitializing ? 0.3 : 1,
                }}
              />

              {/* Viewfinder overlay */}
              {!isInitializing && hasPermission && (
                <>
                  {/* Corner accents */}
                  <div style={{ position: 'absolute', top: 24, left: 24, width: 24, height: 24, borderTop: '3px solid var(--brand-coral)', borderLeft: '3px solid var(--brand-coral)', borderTopLeftRadius: '4px' }} />
                  <div style={{ position: 'absolute', top: 24, right: 24, width: 24, height: 24, borderTop: '3px solid var(--brand-coral)', borderRight: '3px solid var(--brand-coral)', borderTopRightRadius: '4px' }} />
                  <div style={{ position: 'absolute', bottom: 24, left: 24, width: 24, height: 24, borderBottom: '3px solid var(--brand-coral)', borderLeft: '3px solid var(--brand-coral)', borderBottomLeftRadius: '4px' }} />
                  <div style={{ position: 'absolute', bottom: 24, right: 24, width: 24, height: 24, borderBottom: '3px solid var(--brand-coral)', borderRight: '3px solid var(--brand-coral)', borderBottomRightRadius: '4px' }} />

                  {/* Animated scan line */}
                  <div className="scan-line" />
                </>
              )}
            </div>

            {!isInitializing && hasPermission && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>
                Align barcode within the frame
              </p>
            )}

            {error && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(200,40,40,0.15)', borderRadius: '12px', maxWidth: '340px', border: '1px solid rgba(200,40,40,0.3)' }}>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', textAlign: 'center' }}>{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <form onSubmit={handleManualSubmit} className="w-full max-w-sm">
              <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', display: 'block', marginBottom: '8px' }}>Enter barcode number:</label>
              <input
                type="text"
                inputMode="numeric"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="e.g., 049000006346"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: '16px',
                  marginBottom: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  background: manualBarcode.trim() ? 'linear-gradient(135deg, #E8836B, #D4567A)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '16px',
                  border: 'none',
                  cursor: manualBarcode.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Check Product
              </button>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '14px', textAlign: 'center' }}>
                The barcode is usually on the back or bottom of the package
              </p>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div style={{ padding: '12px 16px', flexShrink: 0, display: 'flex', gap: '10px' }}>
        <button
          onClick={toggleManualEntry}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {manualEntry ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Use Camera
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Enter Manually
            </>
          )}
        </button>
      </div>
    </div>
  );
}
