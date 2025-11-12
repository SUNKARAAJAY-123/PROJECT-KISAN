import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DiagnosisResult, TFunction } from '../types';
import { diagnoseCrop } from '../services/geminiService';
import { UploadIcon, CameraIcon, LeafIcon, SparklesIcon, XCircleIcon } from './Icons';
import ResponsiveCard from './ResponsiveCard';

const MAX_IMAGE_SIZE = 1024; // px
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Resize if needed
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          if (width > height) {
            height = Math.round((MAX_IMAGE_SIZE / width) * height);
            width = MAX_IMAGE_SIZE;
          } else {
            width = Math.round((MAX_IMAGE_SIZE / height) * width);
            height = MAX_IMAGE_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl.split(',')[1]);
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = error => reject(error);
  });
};

const DiagnosisSection: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
  <div>
    <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-700 dark:text-gray-200 mb-2">
      {icon}
      {title}
    </h4>
    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 pl-2">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const CameraView: React.FC<{ onCapture: (dataUrl: string) => void; onCancel: () => void }> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

  React.useEffect(() => {
    let mediaStream: MediaStream;
    const enableStream = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        onCancel();
      }
    };

    enableStream();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
              context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              onCapture(canvas.toDataURL('image/jpeg'));
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-lg mb-4 aspect-video bg-black"></video>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                 <button onClick={handleCapture} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-blue-400 focus:outline-none">
                    Capture Photo
                </button>
                <button onClick={onCancel} className="w-full px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-gray-500 focus:outline-none">
                    Cancel
                </button>
            </div>
        </div>
    );
};

interface CropDoctorProps {
  language: string;
  t: TFunction;
}

export default function CropDoctor({ language, t }: CropDoctorProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setCameraOpen] = useState(false);


  // Restore diagnosis state from localStorage on mount, and clear on unmount
  useEffect(() => {
    const saved = localStorage.getItem('cropDoctorState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.result && parsed.imagePreview) {
          setResult(parsed.result);
          setImagePreview(parsed.imagePreview);
        }
      } catch {}
    }
    return () => {
      setResult(null);
      setImagePreview(null);
      setBase64Image(null);
      setError(null);
      setCameraOpen(false);
      localStorage.removeItem('cropDoctorState');
    };
  }, []);

  // Save diagnosis state to localStorage after successful diagnosis
  useEffect(() => {
    if (result && imagePreview) {
      localStorage.setItem('cropDoctorState', JSON.stringify({ result, imagePreview }));
    }
  }, [result, imagePreview]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResult(null);
      setError(null);
      // Clean up previous blob URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
      const base64 = await fileToBase64(file);
      setBase64Image(base64);
    }
  };

  const handleDiagnose = async () => {
    if (!base64Image) {
      setError("Please select an image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const diagnosis = await diagnoseCrop(base64Image, language);
      if(diagnosis.error) {
        setError(diagnosis.error);
      } else {
        setResult(diagnosis);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unknown error occurred during diagnosis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    setResult(null);
    setError(null);
    setImagePreview(dataUrl);
    setCameraOpen(false);
  };

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-8 px-2 sm:px-0">
      {/* Animated background shapes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-spin-slow" />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <ResponsiveCard className="w-full" title={t.cropDoctorTitle}>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t.cropDoctorDescription}</p>
          <div className="mb-6">
            <div className="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 overflow-hidden" role="region" aria-label={t.imagePreviewPlaceholder}>
              {imagePreview ? (
                <img src={imagePreview} alt={t.imagePreviewPlaceholder} className="h-full w-full object-contain" />
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500 p-4">
                  <UploadIcon className="mx-auto h-12 w-12" aria-hidden="true" />
                  <p>{t.imagePreviewPlaceholder}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 shadow-inner">
              <UploadIcon className="w-5 h-5"/>
              {t.uploadPhotoButton}
            </button>
            <button onClick={() => setCameraOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-lg">
              <CameraIcon className="w-5 h-5"/>
              {t.useCameraButton}
            </button>
          </div>
          <button
            onClick={handleDiagnose}
            disabled={!base64Image || isLoading}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.diagnosingButton}
              </>
            ) : t.diagnoseCropButton}
          </button>
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600/50 text-red-700 dark:text-red-300 rounded-lg animate-shake text-center">
              <strong>{t.errorPrefix}</strong> {error}
            </div>
          )}
          {result && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4">{result.diseaseName}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <DiagnosisSection 
                      title={t.symptomsTitle} 
                      items={result.symptoms} 
                      icon={<LeafIcon className="w-6 h-6 text-yellow-600" />} 
                    />
                  </div>
                  <div className="space-y-6">
                    <DiagnosisSection 
                      title={t.organicRemediesTitle} 
                      items={result.remedies.organic} 
                      icon={<SparklesIcon className="w-6 h-6 text-green-600" />} 
                    />
                  </div>
                </div>
                {/* Fertilizer Recommendations */}
                {result.fertilizers && result.fertilizers.length > 0 ? (
                  <div className="mt-8">
                    <h4 className="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-2">Fertilizer Recommendations</h4>
                    <ul className="space-y-4">
                      {result.fertilizers.map((fert, idx) => (
                        <li key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="font-bold text-blue-800 dark:text-blue-200">{fert.name}</div>
                          <div className="text-gray-700 dark:text-gray-200 mb-1">{fert.description}</div>
                          <div className="text-green-700 dark:text-green-300 font-semibold">Estimated Price: {fert.price}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-8">
                    <h4 className="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-2">Fertilizer Recommendations</h4>
                    <div className="text-gray-600 dark:text-gray-300">No fertilizer recommendations available for this disease.</div>
                  </div>
                )}
            </div>
          )}
          {isCameraOpen && <CameraView onCapture={handleCameraCapture} onCancel={() => setCameraOpen(false)} />}
        </ResponsiveCard>
      </div>
    </div>
  );
}