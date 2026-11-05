import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Copy,
  Check,
  Laptop,
  Smartphone,
  Lock,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface OneTimeQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OneTimeQRModal: React.FC<OneTimeQRModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentToken, setCurrentToken] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 minutes
  const [isConsumed, setIsConsumed] = useState<boolean>(false);
  const [consumedMeta, setConsumedMeta] = useState<any>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const pollIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Generate new one-time token and QR code
  const generateOneTimeCode = async () => {
    setIsGenerating(true);
    setIsConsumed(false);
    setConsumedMeta(null);
    setSecondsRemaining(300);

    const token = 'otl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    setCurrentToken(token);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const username = (user?.username || (user?.email ? user.email.split('@')[0] : 'admin')).toLowerCase();

    const payload = {
      type: 'ANYSHARE_ONE_TIME_LOGIN',
      version: '1.0.0',
      token,
      singleUse: true,
      createdAt: new Date().toISOString(),
      expiresAt,
      user: {
        id: user?.uid || 'CREATIVE-ADMIN-MASTER',
        name: user?.name || 'Master Architect',
        username: username,
        email: user?.email || 'admin@anything.local',
        role: user?.role || 'admin',
        avatar: user?.avatar || null
      },
      workstation: {
        nodeId: 'node_studio_master',
        label: 'Anything Master Studio Node',
        bridgePort: 5253,
        gpu: 'Hardware Accelerated Dedicated Render Node'
      }
    };

    const payloadJson = JSON.stringify(payload);

    try {
      const dataUrl = await QRCode.toDataURL(payloadJson, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 8,
        color: {
          dark: '#111827',
          light: '#FAF8F5'
        }
      });
      setQrDataUrl(dataUrl);

      // Register session with local One Tap bridge if active
      fetch('http://127.0.0.1:5253/api/generate-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          user: payload.user,
          workstation: payload.workstation
        })
      }).catch(() => {});

      // Register with Vercel /api/auth-pair if accessible
      fetch('/api/auth-pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          token,
          user: payload.user,
          workstation: payload.workstation
        })
      }).catch(() => {});

    } catch (err) {
      console.error('Failed to generate QR code', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      generateOneTimeCode();
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setQrDataUrl('');
      setCurrentToken('');
      setIsConsumed(false);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isConsumed) return;

    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          setQrDataUrl(''); // Burn QR when expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, isConsumed, currentToken]);

  // Polling for claim & burn event
  useEffect(() => {
    if (!isOpen || !currentToken || isConsumed) return;

    const checkClaimStatus = async () => {
      // 1. Check local bridge
      try {
        const localRes = await fetch(`http://127.0.0.1:5253/api/pairing-status?token=${currentToken}`);
        if (localRes.ok) {
          const data = await localRes.json();
          if (data.status === 'claimed' || data.consumed) {
            burnToken(data);
            return;
          }
        }
      } catch (e) {}

      // 2. Check Vercel serverless endpoint
      try {
        const cloudRes = await fetch(`/api/auth-pair?token=${currentToken}`);
        if (cloudRes.ok) {
          const data = await cloudRes.json();
          if (data.session?.status === 'claimed' || data.consumed) {
            burnToken(data.session || data);
            return;
          }
        }
      } catch (e) {}
    };

    const burnToken = (meta: any) => {
      setIsConsumed(true);
      setConsumedMeta(meta);
      setQrDataUrl(''); // Immediately destroy QR code from view
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };

    pollIntervalRef.current = setInterval(checkClaimStatus, 1500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, currentToken, isConsumed]);

  const handleCopyCode = () => {
    if (!currentToken) return;
    navigator.clipboard?.writeText(currentToken);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all text-left ${
          isLight
            ? 'bg-[#FAF8F5] border-[#C5A059]/40 text-stone-900 shadow-amber-900/10'
            : 'bg-zinc-900 border-[#C5A059]/30 text-stone-100 shadow-black/80'
        }`}
        role="dialog"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#C5A059]/30 flex items-center justify-between bg-gradient-to-r from-amber-100/80 via-yellow-50/50 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8A6614] text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-stone-900">AnyShare One-Time Login</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-stone-900 border border-amber-400">
                  Single-Use
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                Scan with AnyShare Mobile/Web to instantly sync account
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          
          {isConsumed ? (
            /* STATE 1: ONE-TIME TOKEN CONSUMED & DESTROYED */
            <div className="py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-base font-black text-emerald-700">
                  One-Time Code Consumed & Synced!
                </h4>
                <p className="text-xs text-stone-600 max-w-xs mx-auto mt-1">
                  AnyShare has verified your login credentials. This single-use QR code has been permanently burned and cannot be scanned again.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-700 space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500 font-sans">Synced Identity:</span>
                  <span className="font-bold text-stone-900">@{user?.username || 'admin'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-500 font-sans">Security Status:</span>
                  <span className="text-emerald-700 font-bold">Burned / Nonce Consumed</span>
                </div>
              </div>

              <button
                onClick={generateOneTimeCode}
                className="px-4 py-2 rounded-xl text-xs font-black bg-stone-900 text-amber-200 hover:bg-black transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate New One-Time Code</span>
              </button>
            </div>
          ) : secondsRemaining === 0 ? (
            /* STATE 2: EXPIRED */
            <div className="py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">QR Code Expired</h4>
              <p className="text-xs text-stone-500 max-w-xs">
                For security, single-use login codes automatically expire after 5 minutes.
              </p>
              <button
                onClick={generateOneTimeCode}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#B8860B] text-white hover:bg-[#8A6614] flex items-center gap-2 mx-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate Fresh Code</span>
              </button>
            </div>
          ) : (
            /* STATE 3: ACTIVE LIVE SINGLE-USE QR CODE */
            <>
              <div className="relative p-3 rounded-2xl bg-white border-2 border-[#C5A059] shadow-xl">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="One-Time Login QR Code"
                    className="w-56 h-56 rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-stone-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#C5A059]" />
                  </div>
                )}

                {/* Islamic Golden Badge in Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border-2 border-[#C5A059] shadow-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#8A6614]" />
                  </div>
                </div>
              </div>

              {/* Countdown & Single-Use Warning */}
              <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-[#C5A059]/30 text-xs">
                <span className="flex items-center gap-1.5 text-stone-700 font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#8A6614]" />
                  Expires in: <span className="font-mono text-stone-950 font-black">{formatTimer(secondsRemaining)}</span>
                </span>

                <span className="flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-400">
                  <Lock className="w-3 h-3 text-[#785005]" />
                  Burns After 1 Scan
                </span>
              </div>

              {/* Identity Snapshot Card */}
              <div className="w-full p-2.5 rounded-xl bg-white/80 border border-stone-200 text-left text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-[11px]">Identity being paired:</span>
                  <span className="font-black text-stone-900 font-mono text-[11px]">
                    @{user?.username || (user?.email ? user.email.split('@')[0] : 'admin')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-[11px]">Single-Use Token:</span>
                  <button
                    onClick={handleCopyCode}
                    className="font-mono text-[10px] text-stone-600 hover:text-stone-950 flex items-center gap-1 cursor-pointer"
                    title="Copy token string"
                  >
                    <span>{currentToken.substring(0, 16)}...</span>
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#C5A059]/20 bg-amber-50/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
            <Zap className="w-3.5 h-3.5 text-[#8A6614]" />
            <span>Listening for One Tap / AnyShare claim...</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
