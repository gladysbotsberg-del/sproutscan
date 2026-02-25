'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

type TesseractWorker = Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>>;

export function useTesseract() {
  const workerRef = useRef<TesseractWorker | null>(null);
  const mountedRef = useRef(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'recognizing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const getWorker = useCallback(async (): Promise<TesseractWorker> => {
    if (workerRef.current) return workerRef.current;

    setStatus('loading');
    setProgress(0);

    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker('eng', 1, {
      logger: (m: { status: string; progress: number }) => {
        if (!mountedRef.current) return;
        if (m.status === 'loading tesseract core') {
          setProgress(Math.round(m.progress * 20));
        } else if (m.status === 'initializing tesseract') {
          setProgress(20 + Math.round(m.progress * 10));
        } else if (m.status === 'loading language traineddata') {
          setProgress(30 + Math.round(m.progress * 20));
        } else if (m.status === 'recognizing text') {
          setProgress(50 + Math.round(m.progress * 50));
        }
      },
    });

    workerRef.current = worker;
    return worker;
  }, []);

  const recognize = useCallback(async (image: Blob | string): Promise<string> => {
    setError(null);
    setStatus('loading');
    setProgress(0);

    try {
      const worker = await getWorker();
      if (!mountedRef.current) return '';

      setStatus('recognizing');
      const { data } = await worker.recognize(image);
      if (!mountedRef.current) return '';

      setStatus('done');
      setProgress(100);
      return data.text;
    } catch (err: any) {
      if (mountedRef.current) {
        setStatus('error');
        setError(err?.message || 'OCR failed');
      }
      return '';
    }
  }, [getWorker]);

  return { recognize, progress, status, error };
}
