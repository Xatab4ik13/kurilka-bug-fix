const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playSendSound() {
  playTone(880, 0.08, 'sine', 0.06);
  setTimeout(() => playTone(1100, 0.06, 'sine', 0.04), 50);
}

export function playReceiveSound() {
  playTone(660, 0.1, 'sine', 0.06);
  setTimeout(() => playTone(880, 0.08, 'sine', 0.05), 80);
}

export function playNotificationSound() {
  playTone(523, 0.12, 'triangle', 0.07);
  setTimeout(() => playTone(659, 0.1, 'triangle', 0.06), 100);
  setTimeout(() => playTone(784, 0.15, 'triangle', 0.05), 200);
}

export function playConnectSound() {
  playTone(440, 0.15, 'sine', 0.05);
  setTimeout(() => playTone(660, 0.15, 'sine', 0.05), 120);
}

export function playDisconnectSound() {
  playTone(660, 0.15, 'sine', 0.05);
  setTimeout(() => playTone(440, 0.15, 'sine', 0.05), 120);
}
