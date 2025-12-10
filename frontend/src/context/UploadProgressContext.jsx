import { useState, useEffect, useRef, useCallback } from 'react';
import { UploadProgressContext } from './UploadProgressContextDef';

export const UploadProgressProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [progress, setProgress] = useState({
    status: 'pending',
    saved: 0,
    total: 0,
    error: null,
  });
  const [isVisible, setIsVisible] = useState(false);
  const eventSourceRef = useRef(null);

  const startTracking = useCallback((newSessionId) => {
    setSessionId(newSessionId);
    setIsVisible(true);
    setProgress({ status: 'pending', saved: 0, total: 0, error: null });
  }, []);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setSessionId(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

    let baseUrl;
    if (apiBase) {
      const cleanBase = apiBase.replace(/\/$/, '');
      if (cleanBase.endsWith('/api/v1')) {
        baseUrl = cleanBase;
      } else {
        baseUrl = `${cleanBase}/api/v1`;
      }
    } else {
      baseUrl =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5000/api/v1'
          : `${window.location.origin}/api/v1`;
    }

    const url = `${baseUrl}/leads/upload-status/${sessionId}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        if (event.data === ': keep-alive') return;

        const data = JSON.parse(event.data);
        setProgress(data);

        if (data.status === 'complete') {
          eventSource.close();
          setTimeout(() => {
            setIsVisible(false);
            setSessionId(null);
          }, 8000);
        }

        if (data.status === 'error') {
          eventSource.close();
        }
      } catch {
        // Silent error
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [sessionId]);

  return (
    <UploadProgressContext.Provider
      value={{
        startTracking,
        dismiss,
        progress,
        isVisible,
        sessionId,
      }}
    >
      {children}
    </UploadProgressContext.Provider>
  );
};
