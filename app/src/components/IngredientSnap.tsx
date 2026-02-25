'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SproutScanIcon } from './SproutScanIcon';
import { useTesseract } from '@/hooks/useTesseract';

interface IngredientSnapProps {
  onComplete: (ingredientsText: string) => void;
  onClose: () => void;
}

type Step = 'camera' | 'preview' | 'processing' | 'review';

export default function IngredientSnap({ onComplete, onClose }: IngredientSnapProps) {
  const [step, setStep] = useState<Step>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [ocrError, setOcrError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  const { recognize, progress, status } = useTesseract();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      const msg = err?.message || String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setCameraError('Camera permission denied. Please enable it in your browser settings.');
      } else if (msg.includes('NotFound') || msg.includes('not found')) {
        setCameraError('No camera found on this device.');
      } else if (msg.includes('NotReadable') || msg.includes('in use')) {
        setCameraError('Camera is being used by another app.');
      } else {
        setCameraError('Could not start camera.');
      }
    }
  }, []);

  useEffect(() => {
    if (step === 'camera') {
      startCamera();
    }
    return () => {
      if (step === 'camera') {
        stopCamera();
      }
    };
  }, [step, startCamera, stopCamera]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    stopCamera();

    canvas.toBlob((blob) => {
      if (!blob || !mountedRef.current) return;
      setCapturedBlob(blob);
      setCapturedUrl(URL.createObjectURL(blob));
      setStep('preview');
    }, 'image/jpeg', 0.9);
  };

  const handleRetake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);
    setExtractedText('');
    setOcrError(null);
    setStep('camera');
  };

  const handleUsePhoto = async () => {
    if (!capturedBlob) return;
    setStep('processing');
    setOcrError(null);
    const text = await recognize(capturedBlob);
    if (!mountedRef.current) return;
    if (text.trim()) {
      setExtractedText(text);
      setStep('review');
    } else {
      setOcrError('Could not read any text. Try taking another photo with better lighting.');
      setStep('camera');
    }
  };

  const handleSubmit = () => {
    const text = extractedText.trim();
    if (text) {
      onComplete(text);
    }
  };

  const statusLabel = status === 'loading'
    ? 'Loading text recognition...'
    : status === 'recognizing'
      ? 'Reading ingredients...'
      : 'Processing...';

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1A1A2E' }}>
      {/* Top Bar */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button
          onClick={onClose}
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
        {/* Camera Step */}
        {step === 'camera' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {cameraError ? (
              <div style={{ maxWidth: '340px', textAlign: 'center' }}>
                <div style={{ padding: '16px', background: 'rgba(200,40,40,0.15)', borderRadius: '12px', border: '1px solid rgba(200,40,40,0.3)', marginBottom: '16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>{cameraError}</p>
                </div>
                {ocrError && (
                  <div style={{ padding: '12px', background: 'rgba(255,165,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,165,0,0.3)', marginBottom: '16px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{ocrError}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="relative w-full max-w-lg" style={{ height: '400px', minHeight: '350px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full rounded-2xl object-cover"
                    style={{ background: '#0D0D1A' }}
                  />
                  {/* Corner accents */}
                  <div style={{ position: 'absolute', top: 24, left: 24, width: 24, height: 24, borderTop: '3px solid var(--brand-coral)', borderLeft: '3px solid var(--brand-coral)', borderTopLeftRadius: '4px' }} />
                  <div style={{ position: 'absolute', top: 24, right: 24, width: 24, height: 24, borderTop: '3px solid var(--brand-coral)', borderRight: '3px solid var(--brand-coral)', borderTopRightRadius: '4px' }} />
                  <div style={{ position: 'absolute', bottom: 24, left: 24, width: 24, height: 24, borderBottom: '3px solid var(--brand-coral)', borderLeft: '3px solid var(--brand-coral)', borderBottomLeftRadius: '4px' }} />
                  <div style={{ position: 'absolute', bottom: 24, right: 24, width: 24, height: 24, borderBottom: '3px solid var(--brand-coral)', borderRight: '3px solid var(--brand-coral)', borderBottomRightRadius: '4px' }} />
                </div>
                {ocrError && (
                  <div style={{ padding: '12px', background: 'rgba(255,165,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,165,0,0.3)', marginTop: '12px', maxWidth: '340px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', textAlign: 'center' }}>{ocrError}</p>
                  </div>
                )}
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>
                  Point at the ingredient list on the package
                </p>
              </>
            )}
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && capturedUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg" style={{ height: '400px', minHeight: '350px' }}>
              <img
                src={capturedUrl}
                alt="Captured ingredient label"
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>
              Does the ingredient list look clear and readable?
            </p>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && capturedUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg" style={{ height: '400px', minHeight: '350px' }}>
              <img
                src={capturedUrl}
                alt="Processing"
                className="w-full h-full rounded-2xl object-cover"
                style={{ opacity: 0.4 }}
              />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div
                  className="animate-spin w-10 h-10 rounded-full"
                  style={{ border: '3px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--brand-coral)' }}
                />
                <p style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>{statusLabel}</p>
              </div>
            </div>
            <div className="w-full max-w-lg mt-4">
              <div className="ocr-progress-bar">
                <div className="ocr-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                {progress}%
              </p>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="flex-1 flex flex-col p-4 overflow-auto">
            <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}>
              <h3 style={{ fontFamily: 'var(--font-display, Nunito, system-ui)', fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '8px' }}>
                Review Ingredients
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '12px' }}>
                Review the text below and fix any errors before checking.
              </p>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={10}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'Inter, system-ui',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Bottom Buttons */}
      <div style={{ padding: '12px 16px', flexShrink: 0, display: 'flex', gap: '10px' }}>
        {step === 'camera' && !cameraError && (
          <button
            onClick={capturePhoto}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #E8836B, #D4567A)',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Take Photo
          </button>
        )}

        {step === 'camera' && cameraError && (
          <button
            onClick={onClose}
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
            }}
          >
            Type Manually Instead
          </button>
        )}

        {step === 'preview' && (
          <>
            <button
              onClick={handleRetake}
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
              }}
            >
              Retake
            </button>
            <button
              onClick={handleUsePhoto}
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #E8836B, #D4567A)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
              }}
            >
              Use This Photo
            </button>
          </>
        )}

        {step === 'review' && (
          <>
            <button
              onClick={handleRetake}
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
              }}
            >
              Retake
            </button>
            <button
              onClick={handleSubmit}
              disabled={!extractedText.trim()}
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '14px',
                background: extractedText.trim() ? 'linear-gradient(135deg, #E8836B, #D4567A)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                cursor: extractedText.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Check Ingredients
            </button>
          </>
        )}
      </div>
    </div>
  );
}
