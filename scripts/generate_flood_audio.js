const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const durationSeconds = 12; // 12 seconds seamless loop
const numChannels = 2;
const numSamples = sampleRate * durationSeconds;
const bytesPerSample = 2;
const dataSize = numSamples * numChannels * bytesPerSample;

const buffer = Buffer.alloc(44 + dataSize);

// Write WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk1 size
buffer.writeUInt16LE(1, 20); // PCM format
buffer.writeUInt16LE(numChannels, 22); // channels
buffer.writeUInt32LE(sampleRate, 24); // sample rate
buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // byte rate
buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // block align
buffer.writeUInt16LE(16, 34); // bits per sample
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Generate Realistic Flood Torrent Sound
// Layer 1: Low-frequency turbulence
// Layer 2: Rushing river rapids with wave swell modulation
// Layer 3: Surface spray and water churn

let b0_L = 0, b1_L = 0, b2_L = 0, b3_L = 0, b4_L = 0, b5_L = 0, b6_L = 0;
let b0_R = 0, b1_R = 0, b2_R = 0, b3_R = 0, b4_R = 0, b5_R = 0, b6_R = 0;
let brown_L = 0, brown_R = 0;

let offset = 44;
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;

  // Modulate wave surge frequency (flood current surges every 3-4 seconds)
  const surge1 = Math.sin(2 * Math.PI * 0.28 * t) * 0.35 + 0.65;
  const surge2 = Math.sin(2 * Math.PI * 0.17 * t + 1.2) * 0.25 + 0.75;
  const totalSurge = surge1 * surge2;

  // White noise sources
  const white_L = Math.random() * 2 - 1;
  const white_R = Math.random() * 2 - 1;

  // Pink noise filter (Paul Kellet's method)
  b0_L = 0.99886 * b0_L + white_L * 0.0555179;
  b1_L = 0.99332 * b1_L + white_L * 0.0750759;
  b2_L = 0.96900 * b2_L + white_L * 0.1538520;
  b3_L = 0.86650 * b3_L + white_L * 0.3104856;
  b4_L = 0.55000 * b4_L + white_L * 0.5329522;
  b5_L = -0.7616 * b5_L - white_L * 0.0168980;
  const pink_L = b0_L + b1_L + b2_L + b3_L + b4_L + b5_L + b6_L + white_L * 0.5362;
  b6_L = white_L * 0.115926;

  b0_R = 0.99886 * b0_R + white_R * 0.0555179;
  b1_R = 0.99332 * b1_R + white_R * 0.0750759;
  b2_R = 0.96900 * b2_R + white_R * 0.1538520;
  b3_R = 0.86650 * b3_R + white_R * 0.3104856;
  b4_R = 0.55000 * b4_R + white_R * 0.5329522;
  b5_R = -0.7616 * b5_R - white_R * 0.0168980;
  const pink_R = b0_R + b1_R + b2_R + b3_R + b4_R + b5_R + b6_R + white_R * 0.5362;
  b6_R = white_R * 0.115926;

  // Brown noise (Deep subterranean water roar)
  brown_L = (brown_L + 0.02 * white_L) / 1.02;
  brown_R = (brown_R + 0.02 * white_R) / 1.02;

  // Water Spray / Churn
  const spray_L = white_L * (0.08 + 0.06 * Math.sin(2 * Math.PI * 0.9 * t));
  const spray_R = white_R * (0.08 + 0.06 * Math.cos(2 * Math.PI * 0.9 * t));

  // Combine layers into realistic flood current:
  let sampleL = (brown_L * 3.8 + pink_L * 0.22 * totalSurge + spray_L * 0.4) * 0.55;
  let sampleR = (brown_R * 3.8 + pink_R * 0.22 * totalSurge + spray_R * 0.4) * 0.55;

  // Soft clipping
  sampleL = Math.max(-1, Math.min(1, Math.tanh(sampleL)));
  sampleR = Math.max(-1, Math.min(1, Math.tanh(sampleR)));

  // Convert to 16-bit integer (-32768 to 32767)
  const intL = Math.round(sampleL * 30000);
  const intR = Math.round(sampleR * 30000);

  buffer.writeInt16LE(intL, offset);
  offset += 2;
  buffer.writeInt16LE(intR, offset);
  offset += 2;
}

const dir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const target = path.join(dir, 'flood_sound.wav');
fs.writeFileSync(target, buffer);
console.log('Successfully created authentic flood sound file at:', target, 'size:', buffer.length);
