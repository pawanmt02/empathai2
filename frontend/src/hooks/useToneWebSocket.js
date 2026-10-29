import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = 'ws://127.0.0.1:8000/ws/tone';
const REST_URL = 'http://127.0.0.1:8000/api/analyze';

export function useToneWebSocket(text, apiKey = '') {
  const [analysis, setAnalysis] = useState({
    text: '',
    score: 0,
    level: 'green',
    primary_tone: 'Calm & Neutral',
    secondary_tones: [],
    triggers: [],
    breakdown: {
      sentiment_score: 0,
      negative_intensity: 0,
      passive_aggressive_score: 0,
      aggression_score: 0,
      defensiveness_score: 0,
    },
    requires_rewrite: false,
    suggestions: [],
    latency_ms: 0,
  });

  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, fallback
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const wsRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const activeReqRef = useRef(0);

  // Setup WebSocket connection
  useEffect(() => {
    let socket;
    let reconnectTimeout;

    const connect = () => {
      try {
        socket = new WebSocket(WS_URL);
        wsRef.current = socket;

        socket.onopen = () => {
          setConnectionStatus('connected');
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setAnalysis(data);
            setIsAnalyzing(false);
          } catch (err) {
            console.error('Failed to parse WebSocket message', err);
          }
        };

        socket.onerror = () => {
          // Fall back gracefully to REST API if WebSocket fails
          setConnectionStatus('fallback');
        };

        socket.onclose = () => {
          setConnectionStatus((prev) => (prev === 'connected' ? 'connecting' : prev));
          reconnectTimeout = setTimeout(connect, 3500);
        };
      } catch (err) {
        setConnectionStatus('fallback');
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, []);

  // Debounced sending of input text
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setAnalysis({
        text: '',
        score: 0,
        level: 'green',
        primary_tone: 'Calm & Neutral',
        secondary_tones: [],
        triggers: [],
        breakdown: {
          sentiment_score: 0,
          negative_intensity: 0,
          passive_aggressive_score: 0,
          aggression_score: 0,
          defensiveness_score: 0,
        },
        requires_rewrite: false,
        suggestions: [],
        latency_ms: 0,
      });
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    const reqId = ++activeReqRef.current;

    debounceTimerRef.current = setTimeout(async () => {
      // If WebSocket is open, send via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            text,
            api_key: apiKey || undefined,
          })
        );
      } else {
        // Fallback to REST API
        try {
          const t0 = performance.now();
          const response = await fetch(REST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              api_key: apiKey || undefined,
            }),
          });
          const data = await response.json();
          if (reqId === activeReqRef.current) {
            data.latency_ms = Math.round(performance.now() - t0);
            setAnalysis(data);
          }
        } catch (err) {
          console.error('REST fallback error', err);
        } finally {
          if (reqId === activeReqRef.current) {
            setIsAnalyzing(false);
          }
        }
      }
    }, 220); // 220ms debounce for natural typing pace

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [text, apiKey]);

  // Explicit manual trigger for rewrites
  const triggerRewrite = useCallback(async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const t0 = performance.now();
      const response = await fetch(REST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          force_rewrite: true,
          api_key: apiKey || undefined,
        }),
      });
      const data = await response.json();
      data.latency_ms = Math.round(performance.now() - t0);
      setAnalysis(data);
    } catch (err) {
      console.error('Manual rewrite error', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [text, apiKey]);

  return {
    analysis,
    isAnalyzing,
    connectionStatus,
    triggerRewrite,
  };
}
