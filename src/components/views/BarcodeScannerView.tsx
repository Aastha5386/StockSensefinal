import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useApp } from '../../context/AppContext';
import { apiProducts } from '../../lib/api';
import { Product } from '../../types';
import {
  QrCode,
  Camera,
  CameraOff,
  Search,
  Plus,
  Minus,
  Package,
  MapPin,
  Loader2,
  CheckCircle2,
  Scan,
  Upload,
  Volume2,
  VolumeX,
  Printer,
  FileImage,
  RefreshCw,
  ExternalLink,
  Barcode,
  Layers,
  AlertTriangle,
  X,
} from 'lucide-react';

export const BarcodeScannerView: React.FC = () => {
  const { products, updateProduct, addMoveRecord, userProfile, showToast } = useApp();

  // Core state
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

  // Camera scanner states
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [cameraStarting, setCameraStarting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [continuousScan, setContinuousScan] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scanPulse, setScanPulse] = useState<boolean>(false);

  // File upload state
  const [fileDecoding, setFileDecoding] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Print label modal
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Refs
  const scannerContainerId = 'stocksense-qr-reader';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const printBarcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  // Audio confirmation beep
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  // Supported formats: all major 1D & 2D formats used in logistics
  const supportedFormats = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
  ];

  // Enumerate cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
          // Prefer environment (back) camera if found
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.info('Camera enumeration notice:', err);
      });

    return () => {
      stopCameraScanner();
    };
  }, []);

  // Render 1D barcode with JsBarcode whenever activeProduct changes
  useEffect(() => {
    if (activeProduct) {
      const codeToRender = activeProduct.barcode || activeProduct.sku;
      if (barcodeSvgRef.current) {
        try {
          JsBarcode(barcodeSvgRef.current, codeToRender, {
            format: 'CODE128',
            lineColor: '#0f172a',
            width: 1.8,
            height: 52,
            displayValue: true,
            fontSize: 12,
            font: 'monospace',
            margin: 8,
            background: 'transparent',
          });
        } catch (e) {
          console.warn('JsBarcode render error:', e);
        }
      }

      if (printBarcodeSvgRef.current) {
        try {
          JsBarcode(printBarcodeSvgRef.current, codeToRender, {
            format: 'CODE128',
            lineColor: '#000000',
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14,
            font: 'monospace',
            margin: 10,
            background: '#ffffff',
          });
        } catch (e) {
          console.warn('Print JsBarcode error:', e);
        }
      }
    }
  }, [activeProduct, showPrintModal]);

  // Global listener for USB/Bluetooth handheld barcode scanner guns
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.trim().length >= 3 && !isInput) {
          handleLookup(buffer.trim());
          buffer = '';
        }
        return;
      }

      if (e.key.length === 1) {
        // Barcode scanners send characters with < 50ms intervals
        if (diff > 80 && !isInput) {
          buffer = e.key;
        } else {
          buffer += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Core Product Lookup
  const handleLookup = async (code: string) => {
    if (!code || !code.trim()) return;
    const clean = code.trim();
    setLoading(true);
    setScannedCode(clean);
    setManualCode(clean);

    try {
      const res = await apiProducts.lookup(clean);
      if (res.success && res.product) {
        setActiveProduct(res.product);
        playBeep();
        triggerPulse();
        showToast(`SKU IDENTIFIED: ${res.product.sku}`);

        // Generate 2D QR Code data URL
        try {
          const url = await QRCode.toDataURL(res.product.sku, {
            width: 220,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
          setQrDataUrl(url);
        } catch (e) {
          console.warn('QR gen error:', e);
        }
      }
    } catch (err: any) {
      showToast(`LOOKUP FAILED: ${err.message || 'Product not found'}`);
      setActiveProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const triggerPulse = () => {
    setScanPulse(true);
    setTimeout(() => setScanPulse(false), 900);
  };

  // Launch Camera Scanner
  const startCameraScanner = async () => {
    setCameraError(null);
    setCameraStarting(true);

    try {
      // Clean up any lingering instance
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch {}
      }

      const scanner = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: supportedFormats,
        verbose: false,
      });
      html5QrCodeRef.current = scanner;

      const scanConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const width = Math.min(Math.floor(viewfinderWidth * 0.88), 340);
          const height = Math.min(Math.floor(viewfinderHeight * 0.65), 180);
          return { width, height };
        },
        aspectRatio: 1.7777778,
      };

      const onScanSuccess = (decodedText: string) => {
        const now = Date.now();
        // Prevent rapid duplicate scans within 1.8 seconds of same code
        if (now - lastScannedTimeRef.current < 1800) return;
        lastScannedTimeRef.current = now;

        handleLookup(decodedText);

        if (!continuousScan) {
          stopCameraScanner();
        }
      };

      // Determine camera constraint: selected device or environment facing
      const cameraConstraint = selectedCameraId
        ? selectedCameraId
        : { facingMode: 'environment' };

      try {
        await scanner.start(cameraConstraint, scanConfig, onScanSuccess, () => {});
      } catch (firstErr) {
        // Fallback to front camera or default if facingMode: environment failed (common on laptops)
        console.warn('Primary camera start failed, trying generic constraints:', firstErr);
        await scanner.start({ facingMode: 'user' }, scanConfig, onScanSuccess, () => {});
      }

      setScannerActive(true);
      setCameraStarting(false);
    } catch (err: any) {
      console.error('Camera Scanner start error:', err);
      setCameraError(err.message || 'Camera permission denied or camera device in use.');
      setScannerActive(false);
      setCameraStarting(false);
      showToast(`CAMERA ERROR: ${err.message || 'Could not access camera'}`);
    }
  };

  // Stop Camera Scanner
  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
    setCameraStarting(false);
  };

  // Scan from Uploaded Image File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileDecoding(true);
    setCameraError(null);

    try {
      const scanner = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: supportedFormats,
        verbose: false,
      });

      const decodedText = await scanner.scanFile(file, false);
      scanner.clear();

      showToast(`CODE DECODED FROM IMAGE: ${decodedText}`);
      handleLookup(decodedText);
    } catch (err: any) {
      showToast(`DECODE FAILED: No barcode or QR code recognized in image.`);
    } finally {
      setFileDecoding(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and drop image file scanner
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileDecoding(true);
    try {
      const scanner = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: supportedFormats,
        verbose: false,
      });
      const decodedText = await scanner.scanFile(file, false);
      scanner.clear();
      showToast(`CODE DECODED: ${decodedText}`);
      handleLookup(decodedText);
    } catch {
      showToast('No recognizable barcode/QR in dropped image.');
    } finally {
      setFileDecoding(false);
    }
  };

  // Rapid Stock In (+) / Out (-)
  const handleStockAction = async (isIncrement: boolean) => {
    if (!activeProduct) return;
    const qty = Math.abs(adjustQty);
    const newOnHand = isIncrement ? activeProduct.onHand + qty : Math.max(0, activeProduct.onHand - qty);
    const newFree = isIncrement ? activeProduct.freeToUse + qty : Math.max(0, activeProduct.freeToUse - qty);

    try {
      await updateProduct(activeProduct.sku, {
        ...activeProduct,
        onHand: newOnHand,
        freeToUse: newFree,
      });

      await addMoveRecord({
        reference: `SCAN-${Date.now().toString().slice(-6)}`,
        timestampUtc: new Date().toISOString(),
        carrier: 'Optical Barcode Station',
        carrierTag: 'SCAN-TERMINAL-01',
        from: isIncrement ? 'INBOUND RECEIVING DOCK' : (activeProduct.location || 'WH-A'),
        to: isIncrement ? (activeProduct.location || 'WH-A') : 'OUTBOUND DISPATCH STAGE',
        quantity: `${isIncrement ? '+' : '-'}${qty} ${activeProduct.unit}`,
        isPositive: isIncrement,
        status: 'DONE',
        kind: isIncrement ? 'inbound' : 'outbound',
        productSku: activeProduct.sku,
        productName: activeProduct.name,
        balanceAfter: newOnHand,
        operator: userProfile?.name || 'OPERATOR',
        notes: `Terminal adjustment by ${userProfile?.name || 'Operator'} (${userProfile?.operatorId || 'OP-SCAN'})`,
      });

      setActiveProduct((prev) => (prev ? { ...prev, onHand: newOnHand, freeToUse: newFree } : null));
      playBeep();
      showToast(`STOCK ${isIncrement ? 'RECEIVED' : 'DEDUCTED'}: ${isIncrement ? '+' : '-'}${qty} ${activeProduct.unit}`);
    } catch (err: any) {
      showToast(`OPERATION FAILED: ${err.message}`);
    }
  };

  // Print Label Handler
  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto py-7 px-4 sm:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Optical Barcode &amp; QR Terminal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              LIVE ENGINE
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real camera barcode reader, 1D &amp; 2D image decoding, instant SKU ledger lookups, and rapid stock updates.
          </p>
        </div>

        {/* Audio & Continuous Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
            title="Toggle scanner confirmation beep"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span>Beep Sound</span>
          </button>

          <button
            type="button"
            onClick={() => setContinuousScan((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              continuousScan
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Continuous scanning mode keeps camera alive after each scan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${continuousScan ? 'text-blue-600 animate-spin' : ''}`} />
            <span>Continuous: {continuousScan ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner Viewfinder & Inputs (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Scanner Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/90 border transition-all duration-300 shadow-xs ${
              scanPulse
                ? 'border-emerald-500 ring-4 ring-emerald-500/20'
                : 'border-slate-200/80 dark:border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Scanner Viewfinder
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aim device camera at 1D Barcode (Code 128 / EAN / UPC) or 2D QR Code.
                </p>
              </div>

              {/* Camera device picker if multiple available */}
              {availableCameras.length > 1 && (
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  disabled={scannerActive}
                  aria-label="Select optical camera device"
                  className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 outline-none"
                >
                  {availableCameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Camera ${cam.id.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Viewfinder Frame */}
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[310px]">
              {/* HTML5 QR Code Container (ALWAYS in DOM) */}
              <div
                id={scannerContainerId}
                className={`w-full ${scannerActive ? 'block' : 'hidden'}`}
                style={{ width: '100%', minHeight: '300px' }}
              />

              {/* Viewfinder Overlay when Inactive */}
              {!scannerActive && (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-3">
                  <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-900/60">
                    <Scan className="w-10 h-10 text-blue-500 animate-pulse" />
                    {/* Corner Reticle Markers */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Camera Feed Inactive</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Click below to activate live webcam/mobile scanning, or upload a photo of any barcode/QR.
                    </p>
                  </div>

                  {cameraError && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-left max-w-md">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Loading Spinner during camera setup */}
              {cameraStarting && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-xs font-semibold">Initializing optical feed...</span>
                </div>
              )}

              {/* Laser Scan line effect when active */}
              {scannerActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-10">
                  <div className="w-[85%] max-w-[340px] h-[160px] border-2 border-blue-500/80 rounded-xl relative shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-bounce" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-blue-300/80 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">
                      Align Barcode in Reticle
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Camera Toggle & File Upload */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              {scannerActive ? (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm transition-colors"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCameraScanner}
                  disabled={cameraStarting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch Live Camera Scanner</span>
                </button>
              )}

              {/* Upload Image Option */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={fileDecoding}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                title="Scan barcode from photo or screenshot file"
              >
                {fileDecoding ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{fileDecoding ? 'Decoding Image...' : 'Upload Barcode Image'}</span>
              </button>

              <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
                Supports USB barcode guns &amp; mobile lenses
              </span>
            </div>

            {/* Manual Form & USB Gun Entry */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(manualCode);
              }}
              className="flex items-center gap-2 mt-5"
            >
              <div className="flex-1 relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Scan or type barcode (e.g. SKU-48201-AX)..."
                  className="w-full h-11 pl-10 pr-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Lookup</span>
              </button>
            </form>

            {/* Quick Test SKU Chips */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Quick Test Samples (Click to simulate scan):
              </span>
              <div className="flex flex-wrap gap-2">
                {products.slice(0, 6).map((p) => (
                  <button
                    key={p.sku}
                    type="button"
                    onClick={() => {
                      setManualCode(p.sku);
                      handleLookup(p.sku);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 rounded-lg font-mono text-xs cursor-pointer transition-colors"
                  >
                    {p.sku} <span className="opacity-60 text-[10px]">({p.name.split(' ')[0]})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scanned Product Dossier & Real Barcode (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-700/60 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Scanned Article Dossier
                  </h2>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    activeProduct
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {activeProduct ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Verified Match
                    </>
                  ) : (
                    'Awaiting Scan'
                  )}
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="text-xs font-semibold">Querying MongoDB Inventory Ledger...</span>
                </div>
              ) : activeProduct ? (
                <div className="flex flex-col gap-4">
                  {/* Product Header */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {activeProduct.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                        {activeProduct.sku}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 rounded-md font-medium">
                        {activeProduct.category}
                      </span>
                    </div>
                  </div>

                  {/* Dual Barcode Display: 1D Barcode & 2D QR Code */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center gap-3">
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5" />
                        Code 128 Barcode &amp; QR
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPrintModal(true)}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Label
                      </button>
                    </div>

                    {/* Real 1D Barcode SVG */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 w-full flex justify-center shadow-2xs">
                      <svg ref={barcodeSvgRef} className="max-w-full" />
                    </div>

                    {/* QR Code thumbnail & specs */}
                    <div className="w-full flex items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="text-xs space-y-0.5">
                        <div className="text-slate-500 dark:text-slate-400">
                          Format: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">CODE-128 &amp; QR</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          Data: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{activeProduct.sku}</span>
                        </div>
                      </div>
                      {qrDataUrl && (
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          className="w-16 h-16 p-1 bg-white rounded-lg border border-slate-200 object-contain shadow-2xs shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  {/* Stock Metrics */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div>
                      <span className="text-xs text-slate-400">On-Hand Stock</span>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {activeProduct.onHand} {activeProduct.unit}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Storage Bay</span>
                      <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {activeProduct.location || 'WH-A / BAY-01'}
                      </div>
                    </div>
                  </div>

                  {/* Rapid Inbound / Outbound Actions */}
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Scan Adjustment Quantity
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400">Qty:</span>
                        <input
                          type="number"
                          min={1}
                          value={adjustQty}
                          onChange={(e) => setAdjustQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-16 h-7 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-center font-bold text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStockAction(true)}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Stock In (+{adjustQty})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStockAction(false)}
                        className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Stock Out (-{adjustQty})</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <Scan className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs">Scan a barcode or enter an SKU above to inspect inventory.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Asset Tag Modal */}
      {showPrintModal && activeProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                Thermal Asset Tag Preview
              </h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Tag Card */}
            <div
              id="printable-asset-label"
              className="p-4 bg-white text-slate-900 border-2 border-slate-900 rounded-lg flex flex-col gap-3 font-sans"
            >
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <div>
                  <div className="font-extrabold text-sm tracking-tight">STOCKSENSE INTERNAL</div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-600">
                    Warehouse Logistics Tag
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold">{activeProduct.location || 'WH-A / BAY-01'}</div>
                  <div className="text-[9px] text-slate-500">{new Date().toISOString().slice(0, 10)}</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-base leading-tight">{activeProduct.name}</div>
                <div className="font-mono text-xs font-bold text-slate-700 mt-0.5">
                  SKU: {activeProduct.sku}
                </div>
              </div>

              {/* 1D Barcode */}
              <div className="flex justify-center py-1">
                <svg ref={printBarcodeSvgRef} className="max-w-full" />
              </div>

              {/* QR and Details footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-300">
                <div className="text-[10px] space-y-0.5">
                  <div>Category: <span className="font-semibold">{activeProduct.category}</span></div>
                  <div>Balance: <span className="font-bold">{activeProduct.onHand} {activeProduct.unit}</span></div>
                  <div>Operator: <span className="font-mono">{userProfile?.operatorId || 'OP-SCAN'}</span></div>
                </div>
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-14 h-14 object-contain" />
                )}
              </div>
            </div>

            {/* Print Dialog Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintLabel}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Physical Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
