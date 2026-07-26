(function () {
  const SYNC_PATTERN_LSB = [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0];
  const SYNC_PATTERN_MSB = [...SYNC_PATTERN_LSB].reverse();

  function bitsToInt(bits) {
    return bits.reduce((acc, bit, idx) => acc + (bit ? (1 << idx) : 0), 0);
  }

  function matchSync(bits) {
    if (bits.length < 16) return false;
    let matchLsb = true;
    let matchMsb = true;
    for (let i = 0; i < 16; i += 1) {
      if (bits[i] !== SYNC_PATTERN_LSB[i]) matchLsb = false;
      if (bits[i] !== SYNC_PATTERN_MSB[i]) matchMsb = false;
    }
    return matchLsb || matchMsb;
  }

  function decodeTimecode(bits) {
    if (bits.length < 64) return null;

    const frameUnits = bitsToInt(bits.slice(0, 4));
    const frameTens = bitsToInt(bits.slice(8, 10));
    const frames = frameUnits + frameTens * 10;

    const secUnits = bitsToInt(bits.slice(16, 20));
    const secTens = bitsToInt(bits.slice(24, 27));
    const seconds = secUnits + secTens * 10;

    const minUnits = bitsToInt(bits.slice(32, 36));
    const minTens = bitsToInt(bits.slice(40, 43));
    const minutes = minUnits + minTens * 10;

    const hourUnits = bitsToInt(bits.slice(48, 52));
    const hourTens = bitsToInt(bits.slice(56, 58));
    const hours = hourUnits + hourTens * 10;

    if (hours > 23 || minutes > 59 || seconds > 59) return null;

    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  }

  class LtcDecoder {
    constructor({ sampleRate, frameRate = 30, onTimecode } = {}) {
      this.sampleRate = sampleRate || 48000;
      this.frameRate = frameRate;
      this.onTimecode = typeof onTimecode === 'function' ? onTimecode : null;
      this.bits = [];
      this.lastSign = null;
      this.samplesSinceCrossing = 0;
      this.pendingHalf = false;
      this.lastTimecode = null;
    this.halfBitEstimate = this.halfBitSamples;
      this._updateTiming();
    }

    setFrameRate(frameRate) {
      this.frameRate = frameRate || 30;
      this._updateTiming();
    }

    _updateTiming() {
      const bitRate = this.frameRate * 80;
      this.halfBitSamples = this.sampleRate / (bitRate * 2);
      this.halfBitMin = this.halfBitSamples * 0.4;
      this.halfBitMax = this.halfBitSamples * 2.2;
      this.halfBitEstimate = this.halfBitSamples;
    }

    process(buffer) {
      for (let i = 0; i < buffer.length; i += 1) {
        const sample = buffer[i];
        const sign = sample >= 0;

        if (this.lastSign === null) {
          this.lastSign = sign;
          continue;
        }

        this.samplesSinceCrossing += 1;

        if (sign !== this.lastSign) {
          const interval = this.samplesSinceCrossing;
          this.samplesSinceCrossing = 0;
          this.lastSign = sign;
          this._handleInterval(interval);
        }
      }
    }

    _handleInterval(interval) {
      if (interval < this.halfBitMin) return;

      const halfEstimate = this.halfBitEstimate || this.halfBitSamples;
      const fullBitMin = halfEstimate * 1.6;

      if (interval >= fullBitMin) {
        this.pendingHalf = false;
        this._pushBit(0);
        return;
      }

      if (!this.pendingHalf) {
        this.pendingHalf = true;
        return;
      }

      this.pendingHalf = false;
      this.halfBitEstimate = (this.halfBitEstimate * 0.85) + (interval * 0.15);
      this._pushBit(1);
    }

    _pushBit(bit) {
      this.bits.push(bit ? 1 : 0);
      if (this.bits.length < 80) return;

      if (this.bits.length > 160) {
        this.bits.splice(0, this.bits.length - 80);
      }

      const syncBits = this.bits.slice(-16);
      if (!matchSync(syncBits)) return;

      const payload = this.bits.slice(-80, -16);
      const timecode = decodeTimecode(payload);
      if (!timecode || timecode === this.lastTimecode) return;

      this.lastTimecode = timecode;
      if (this.onTimecode) {
        this.onTimecode(timecode);
      }
    }
  }

  window.LtcDecoder = LtcDecoder;
})();
