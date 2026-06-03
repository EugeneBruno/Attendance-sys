'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ArrowLeft, Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type ScanStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ScanAttendancePage() {
  const router = useRouter();
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState('');

  const handleScan = async (detectedCodes: { rawValue: string }[]) => {
    if (status !== 'idle' || detectedCodes.length === 0) return;

    const qrToken = detectedCodes[0].rawValue;
    setStatus('loading');

    try {
      // Hit your new /mark route
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        // Extract course code from the nested include in your backend
        const courseCode = data.attendance?.session?.course?.courseCode || 'Class';
        setMessage(`Successfully checked into ${courseCode}!`);
        
        setTimeout(() => router.push('/dashboard/student'), 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to verify attendance.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <Link 
          href="/dashboard/student" 
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
          <div className="p-6 text-center border-b border-zinc-100">
            <h1 className="text-xl font-bold text-zinc-900">Class Attendance</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Position the lecturer's QR code inside the frame.
            </p>
          </div>

          <div className="relative bg-zinc-950 aspect-square flex items-center justify-center">
            {status === 'idle' && (
              <Scanner
                onScan={handleScan}
                formats={['qr_code']}
                components={{finder: true }}
                styles={{ container: { width: '100%', height: '100%' } }}
              />
            )}

            {status === 'loading' && (
              <div className="flex flex-col items-center text-white">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-emerald-500" />
                <p className="font-medium animate-pulse">Verifying token...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center text-white animate-in zoom-in duration-300 p-6 text-center">
                <div className="h-20 w-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Checked In!</h2>
                <p className="text-zinc-400">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center text-white animate-in zoom-in duration-300 p-6 text-center">
                <div className="h-20 w-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Scan Failed</h2>
                <p className="text-zinc-400">{message}</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-zinc-50">
            {status === 'error' ? (
              <button
                onClick={resetScanner}
                className="w-full py-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors"
              >
                Try Again
              </button>
            ) : status === 'success' ? (
              <Link
                href="/dashboard/student"
                className="block w-full py-3 rounded-lg bg-emerald-600 text-white font-medium text-center hover:bg-emerald-700 transition-colors"
              >
                Return to Dashboard
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 font-medium">
                <Camera className="h-4 w-4" />
                Camera active and searching...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}