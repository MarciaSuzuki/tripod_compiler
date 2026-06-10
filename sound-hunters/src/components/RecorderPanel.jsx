// The mic flow: tap mic → speak (live waveform) → tap stop → gentle quality
// gate (rule 6). Failure shows a friendly wordless retry animation; after two
// failed retries the take is accepted anyway with quality:"low".

import { useEffect, useRef, useState } from 'react';
import { Icons } from '../deck/icons.jsx';
import { Recorder, decodeBlob } from '../audio/recorder.js';
import { analyzeSamples, gateCheck } from '../audio/analysis.js';
import { softThud, sparkle } from '../audio/tones.js';

export function RecorderPanel({ gateMs, onAccept, resetKey }) {
  const [state, setState] = useState('idle'); // idle | recording | checking | retry | micError
  const failCount = useRef(0);
  const recorder = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const analyserRef = useRef(null);

  useEffect(() => { failCount.current = 0; setState('idle'); }, [resetKey]);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function drawLoop() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    const data = new Uint8Array(analyser.fftSize);
    const render = () => {
      analyser.getByteTimeDomainData(data);
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = '#e8554d';
      ctx.lineWidth = 3;
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * w;
        const y = (data[i] / 255) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
  }

  async function startRec() {
    try {
      recorder.current = new Recorder();
      analyserRef.current = await recorder.current.start();
      setState('recording');
      requestAnimationFrame(drawLoop);
    } catch {
      setState('micError'); // mic blocked: wordless error glyph
    }
  }

  async function stopRec() {
    cancelAnimationFrame(rafRef.current);
    setState('checking');
    const result = await recorder.current?.stop();
    if (!result || result.blob.size === 0) { setState('idle'); return; }
    let analysis = { durationMs: result.durationMs, clipped: false, silent: false, qualityScore: 0 };
    try {
      const { samples, sampleRate } = await decodeBlob(result.blob);
      analysis = analyzeSamples(samples, sampleRate);
    } catch {
      // Decoding failed (rare codec edge) — fall back to recorder duration.
    }
    const gate = gateCheck(analysis, gateMs);
    if (gate.pass) {
      failCount.current = 0;
      sparkle();
      setState('idle');
      onAccept({ ...result, analysis, quality: 'ok' });
    } else if (failCount.current >= 2) {
      // Two failed retries already — accept anyway, flagged low (rule 6).
      failCount.current = 0;
      setState('idle');
      onAccept({ ...result, analysis, quality: 'low' });
    } else {
      failCount.current += 1;
      softThud();
      setState('retry');
      setTimeout(() => setState('idle'), 1400); // wordless wiggle, then re-arm
    }
  }

  return (
    <div className="recorder-panel">
      {state === 'recording' && <canvas ref={canvasRef} width={560} height={120} className="waveform" />}
      {state === 'idle' && (
        <button className="big-btn mic" onPointerUp={startRec} aria-label="record">
          <Icons.mic width="56" height="56" />
        </button>
      )}
      {state === 'recording' && (
        <button className="big-btn stop pulse" onPointerUp={stopRec} aria-label="stop">
          <Icons.stop width="52" height="52" />
        </button>
      )}
      {state === 'checking' && <div className="big-btn checking spin"><Icons.ear width="52" height="52" /></div>}
      {state === 'retry' && (
        <div className="big-btn retry wiggle" onPointerUp={() => setState('idle')}>
          <Icons.mic width="56" height="56" />
        </div>
      )}
      {state === 'micError' && (
        <button className="big-btn mic-error" onPointerUp={startRec}>
          <Icons.mic width="48" height="48" />
          <Icons.cross width="32" height="32" className="overlay-cross" />
        </button>
      )}
    </div>
  );
}
