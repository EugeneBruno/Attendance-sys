"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";

export default function StudentScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [manualToken, setManualToken] = useState("");

  async function markAttendance(qrToken: string) {
    try {
      setMessage("Marking attendance...");

      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to mark attendance.");
        return;
      }

      setMessage("Attendance marked successfully");

      await stopScanner();

      setTimeout(() => {
        router.push("/dashboard/student");
      }, 1200);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  }

  async function startScanner() {
    if (isScanning) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    setIsScanning(true);
    setMessage("Scanning...");

    await scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      async (decodedText) => {
        await markAttendance(decodedText);
      },
      () => {}
    );
  }

  async function stopScanner() {
    if (scannerRef.current && isScanning) {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
      scannerRef.current = null;
      setIsScanning(false);
    }
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Scan Attendance QR
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Point your camera at the lecturer’s QR code.
          </p>
        </div>

        <div id="qr-reader" className="w-full overflow-hidden rounded-lg" />

        {message && (
          <div className="text-sm bg-zinc-100 border border-zinc-200 rounded-lg p-3">
            {message}
          </div>
        )}

        <button
          onClick={startScanner}
          disabled={isScanning}
          className="w-full bg-zinc-900 text-white rounded-lg py-3 text-sm font-medium disabled:bg-zinc-500"
        >
          {isScanning ? "Scanning..." : "Start Camera Scan"}
        </button>

        <button
          onClick={stopScanner}
          disabled={!isScanning}
          className="w-full bg-red-600 text-white rounded-lg py-3 text-sm font-medium disabled:bg-red-300"
        >
          Stop Scanner
        </button>

        <div className="pt-4 border-t space-y-3">
          <p className="text-xs text-zinc-500">
            Backup: paste QR token manually
          </p>

          <textarea
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Paste token here"
            className="w-full min-h-24 border border-zinc-300 rounded-lg p-3 text-sm"
          />

          <button
            onClick={() => markAttendance(manualToken.trim())}
            className="w-full bg-green-600 text-white rounded-lg py-3 text-sm font-medium"
          >
            Submit Token
          </button>
        </div>
      </div>
    </main>
  );
}