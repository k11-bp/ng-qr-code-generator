import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {qrcodegen} from "../qrcodegen";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './qr-generator.component.html',
  styleUrl: './qr-generator.component.css'
})
export class QrGeneratorComponent implements OnInit, AfterViewInit{
  qr_code_content: string|undefined
  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>|undefined;
  private ctx: CanvasRenderingContext2D|undefined;
  canvasDimension=500;
  dimension: number|undefined;
  img: HTMLImageElement|undefined;
  icon_image_border_size = 10;
  square_size = 10;
  qr_code_color: string|undefined;
  icon_image_border_color: string|undefined;
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if(this.canvas) {
      const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
      this.ctx = canvasEl.getContext('2d')!;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img = new Image();
        this.img.onload = () => {
          this.inputChange();
        };
        this.img.src = e.target!.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  inputChange(): void {
    let qrCode: qrcodegen.QrCode|undefined;
    let qr_offset: number = 0;
    if(this.qr_code_content) {
      let segs: Array<qrcodegen.QrSegment> = qrcodegen.QrSegment.makeSegments(this.qr_code_content)
      qrCode = qrcodegen.QrCode.encodeSegments(segs,qrcodegen.QrCode.Ecc.HIGH,5,40,-1,true)
      this.dimension = qrCode.size
      this.square_size = Math.floor(this.canvasDimension/this.dimension)//Math.floor(this.canvasDimension/qrCode.size)
      qr_offset = Math.ceil((this.canvasDimension - (this.square_size*this.dimension))/2)
      // this.square_size=max_square_size>2?max_square_size:2;
      console.log(qrCode)
    }else{
      this.dimension=undefined
    }
    this.ctx?.reset();
    if (this.ctx && qrCode && this.dimension) {
      this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
      for(let i=0;i<this.dimension;i++){
        for(let ii=0;ii < this.dimension;ii++){
          if(qrCode.getModule(i,ii)===true){
            this.ctx.fillRect(i*this.square_size+qr_offset, ii*this.square_size+qr_offset, Math.ceil(this.square_size), Math.ceil(this.square_size));
          }
        }
      }
      if(this.dimension){
        let sizeOfIcon = Math.floor(this.dimension*0.3)
        let startingPoint = (this.dimension-sizeOfIcon)/2
        if(this.img){
          // this.ctx.clearRect(startingPoint*this.square_size+qr_offset, startingPoint*this.square_size+qr_offset,sizeOfIcon*this.square_size, sizeOfIcon*this.square_size);
          this.ctx.drawImage(this.img, startingPoint*this.square_size+qr_offset, startingPoint*this.square_size+qr_offset,sizeOfIcon*this.square_size, sizeOfIcon*this.square_size);
          if(this.icon_image_border_size > 0){
            this.ctx.strokeStyle = this.icon_image_border_color?this.icon_image_border_color:"black";
            this.ctx.lineWidth = this.icon_image_border_size;
            this.ctx.beginPath();
            this.ctx.roundRect(startingPoint*this.square_size+qr_offset+Math.ceil(this.ctx.lineWidth/2), startingPoint*this.square_size+qr_offset+Math.ceil(this.ctx.lineWidth/2),sizeOfIcon*this.square_size-this.ctx.lineWidth, sizeOfIcon*this.square_size-this.ctx.lineWidth, [10,10,10,10]);
            this.ctx.stroke();
          }else{

          }
        }
      }
    }
    console.log(this.qr_code_content)
  }

  onBorderChanged(event: Event): void {
    this.inputChange();
  }

  onColorChanged(event: Event) {
    this.inputChange();
  }
  onBorderColorChanged(event: Event) {
    this.inputChange();
  }

  download(event: Event) {
    if(this.ctx) {
      var link = document.createElement('a');
      link.download = 'filename.png';
      link.href = this.ctx.canvas.toDataURL('image/png');
      link.click();
    }
  }
}
