
import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-search',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './test-search.component.html',
  styleUrl: './test-search.component.css'
})
export class VoiceSearchComponent implements AfterViewInit {
  @ViewChild('waveformCanvas') waveformCanvas!: ElementRef<HTMLCanvasElement>;
  searchKeywords: string = '';
  isListening = false;
  recognition: any;

  audioContext: any;
  analyser: any;
  source: any;
  dataArray: any;
  animationId: any;

  lang: 'en' | 'ar' = 'en';

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.initSpeechRecognition();
  }

  initSpeechRecognition(): void {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.lang === 'ar' ? 'ar-SA' : 'en-US';
      this.recognition.interimResults = false;
      this.recognition.continuous = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.searchKeywords = transcript;
        this.cdr.detectChanges();
        console.log('Search:', this.searchKeywords);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.stopVisualizer();
        this.cdr.detectChanges();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        this.isListening = false;
        this.stopVisualizer();
        this.cdr.detectChanges();
      };
    } 
    // else {
    //   alert('Speech Recognition not supported');
    // }
  }

  toggleSpeechRecognition(): void {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.stopVisualizer();
    } else {
      this.recognition.start();
      this.isListening = true;
      this.startVisualizer();
    }
    this.cdr.detectChanges();
  }

  startVisualizer(): void {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);

      const canvas = this.waveformCanvas.nativeElement;
      const ctx = canvas.getContext('2d')!;
      canvas.width = 150;
      canvas.height = 50;

      const barWidth = 3;
      const barGap = 1;
      const maxBarHeight = canvas.height * 0.8;
      let waveOffset = 0;

      const draw = () => {
        this.animationId = requestAnimationFrame(draw);
        this.analyser.getByteFrequencyData(this.dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e60000';
        waveOffset += 0.15;
        const centerY = canvas.height / 2;

        for (let i = 0; i < bufferLength; i++) {
          const amplitude = this.dataArray[i] / 255;
          const wave = Math.sin(i * 0.6 + waveOffset) * 0.4 + 0.6;
          const barHeight = amplitude * maxBarHeight * wave;
          const x = i * (barWidth + barGap);
          const y = centerY - barHeight / 2;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      };

      draw();
    });
  }

  stopVisualizer(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.audioContext) this.audioContext.close();
  }
}
