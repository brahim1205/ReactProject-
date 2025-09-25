import { useState, useRef, useCallback } from 'react';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting audio recording...');
      setError(null);

      // Vérifier le support de l'API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Votre navigateur ne supporte pas l\'enregistrement audio');
      }

      console.log(' Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log(' Microphone access granted');

      streamRef.current = stream;

      // Essayer différents mimeTypes selon le support du navigateur
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
      console.log('🎤 Using mimeType:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      console.log('🎤 MediaRecorder created');

      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        console.log('🎤 Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('🎤 Recording stopped, creating blob from', chunks.length, 'chunks');
        const blob = new Blob(chunks, { type: 'audio/webm' });
        console.log('🎤 Blob created:', blob.size, 'bytes');
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        console.log('🎤 Recording complete');
      };

      mediaRecorder.start(100); // Collecter les données toutes les 100ms
      setIsRecording(true);
      console.log('🎤 Recording started');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible d\'accéder au microphone';
      console.error('🎤 Recording error:', err);
      setError(errorMessage);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Les event listeners géreront le nettoyage
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    // Nettoyer les ressources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Réinitialiser l'état
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
    setIsRecording(false);

    // Nettoyer l'URL d'objet
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [isRecording, audioUrl]);

  const resetRecording = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  // Nettoyer automatiquement lors du démontage du composant
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
    cleanup,
    hasRecording: !!audioBlob
  };
};

export default useAudioRecording;