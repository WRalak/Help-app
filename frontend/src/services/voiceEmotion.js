import * as ml5 from 'ml5';

class VoiceEmotionDetector {
  constructor() {
    this.audioContext = null;
    this.analyzer = null;
    this.microphone = null;
    this.isListening = false;
    this.emotionModel = null;
  }

  async initialize() {
    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 256;

      // Get microphone access
      this.microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.microphone);
      source.connect(this.analyzer);

      // Load ML model for emotion detection
      this.emotionModel = await ml5.soundClassifier('https://teachablemachine.withgoogle.com/models/your-model-url/');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize voice detection:', error);
      return false;
    }
  }

  startDetection(callback) {
    if (!this.emotionModel) return;

    this.isListening = true;
    
    // Get audio features
    const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
    
    const detectEmotion = () => {
      if (!this.isListening) return;
      
      this.analyzer.getByteFrequencyData(dataArray);
      
      // Calculate audio features
      const features = {
        volume: this.calculateVolume(dataArray),
        pitch: this.calculatePitch(dataArray),
        rhythm: this.calculateRhythm(dataArray),
        spectralCentroid: this.calculateSpectralCentroid(dataArray)
      };

      // Classify emotion based on features
      const emotion = this.classifyEmotion(features);
      
      callback({
        emotion,
        confidence: this.calculateConfidence(features),
        features,
        timestamp: Date.now()
      });

      requestAnimationFrame(detectEmotion);
    };

    detectEmotion();
  }

  stopDetection() {
    this.isListening = false;
    if (this.microphone) {
      this.microphone.getTracks().forEach(track => track.stop());
    }
  }

  calculateVolume(dataArray) {
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    return sum / dataArray.length;
  }

  calculatePitch(dataArray) {
    // Simplified pitch detection
    const maxIndex = dataArray.indexOf(Math.max(...dataArray));
    return (maxIndex / dataArray.length) * 1000;
  }

  calculateRhythm(dataArray) {
    // Detect rhythm patterns
    let crossings = 0;
    for (let i = 1; i < dataArray.length; i++) {
      if (dataArray[i] > 128 && dataArray[i-1] <= 128) crossings++;
    }
    return crossings;
  }

  calculateSpectralCentroid(dataArray) {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      numerator += i * dataArray[i];
      denominator += dataArray[i];
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  classifyEmotion(features) {
    // Simple rule-based classification
    if (features.volume > 200 && features.pitch > 500) {
      return 'excited';
    } else if (features.volume < 50 && features.pitch < 200) {
      return 'calm';
    } else if (features.rhythm > 50) {
      return 'anxious';
    } else {
      return 'neutral';
    }
  }

  calculateConfidence(features) {
    // Calculate confidence based on feature clarity
    const clarity = (features.volume / 255 + features.pitch / 1000 + features.rhythm / 100) / 3;
    return Math.min(0.95, Math.max(0.5, clarity));
  }
}

export default VoiceEmotionDetector;