import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {qrcodegen} from "../qrcodegen";
import {FormsModule} from "@angular/forms";
import QrCode = qrcodegen.QrCode;

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
  qr_style: string|undefined = "1";
  error_rate: number|undefined = 5;
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

  getQrCodeCorner(qrCode: QrCode){
    var continuesSquares = [
      {
        p: [
          [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
          [0,1],                              [6,1],
          [0,2],                              [6,2],
          [0,3],                              [6,3],
          [0,4],                              [6,4],
          [0,5],                              [6,5],
          [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
        ],
        c_tl: [0,0],
        c_tr: [6,0],
        c_bl: [0,6],
        c_br: [6,6],
      },
      {
        p: [
          [2,2],[3,2],[4,2],
          [2,3],[3,3],[4,3],
          [2,4],[3,4],[4,4],
        ],
        c_tl: [2,2],
        c_tr: [4,2],
        c_bl: [2,4],
        c_br: [4,4],
      },
      {
        p: [
          [qrCode.size-7,0],[qrCode.size-6,0],[qrCode.size-5,0],[qrCode.size-4,0],[qrCode.size-3,0],[qrCode.size-2,0],[qrCode.size-1,0],
          [qrCode.size-7,1],                                                                                          [qrCode.size-1,1],
          [qrCode.size-7,2],                                                                                          [qrCode.size-1,2],
          [qrCode.size-7,3],                                                                                          [qrCode.size-1,3],
          [qrCode.size-7,4],                                                                                          [qrCode.size-1,4],
          [qrCode.size-7,5],                                                                                          [qrCode.size-1,5],
          [qrCode.size-7,6],[qrCode.size-6,6],[qrCode.size-5,6],[qrCode.size-4,6],[qrCode.size-3,6],[qrCode.size-2,6],[qrCode.size-1,6],
        ],
        c_tl: [qrCode.size-7,0],
        c_tr: [qrCode.size-1,0],
        c_bl: [qrCode.size-7,6],
        c_br: [qrCode.size-1,6],
      },
      {
        p: [
          [qrCode.size-5,2],[qrCode.size-4,2],[qrCode.size-3,2],
          [qrCode.size-5,3],[qrCode.size-4,3],[qrCode.size-3,3],
          [qrCode.size-5,4],[qrCode.size-4,4],[qrCode.size-3,4],
        ],
        c_tl: [qrCode.size-5,2],
        c_tr: [qrCode.size-3,2],
        c_bl: [qrCode.size-5,4],
        c_br: [qrCode.size-3,4],
      },
      {
        p: [
          [0,qrCode.size-7],[1,qrCode.size-7],[2,qrCode.size-7],[3,qrCode.size-7],[4,qrCode.size-7],[5,qrCode.size-7],[6,qrCode.size-7],
          [0,qrCode.size-6],                                                                                          [6,qrCode.size-6],
          [0,qrCode.size-5],                                                                                          [6,qrCode.size-5],
          [0,qrCode.size-4],                                                                                          [6,qrCode.size-4],
          [0,qrCode.size-3],                                                                                          [6,qrCode.size-3],
          [0,qrCode.size-2],                                                                                          [6,qrCode.size-2],
          [0,qrCode.size-1],[1,qrCode.size-1],[2,qrCode.size-1],[3,qrCode.size-1],[4,qrCode.size-1],[5,qrCode.size-1],[6,qrCode.size-1],
        ],
        c_tl: [0,qrCode.size-7],
        c_tr: [6,qrCode.size-7],
        c_bl: [0,qrCode.size-1],
        c_br: [6,qrCode.size-1],
      },
      {
        p: [
          [2,qrCode.size-5],[3,qrCode.size-5],[4,qrCode.size-5],
          [2,qrCode.size-4],[3,qrCode.size-4],[4,qrCode.size-4],
          [2,qrCode.size-3],[3,qrCode.size-3],[4,qrCode.size-3],
        ],
        c_tl: [2,qrCode.size-5],
        c_tr: [4,qrCode.size-5],
        c_bl: [2,qrCode.size-3],
        c_br: [4,qrCode.size-3],
      }
    ];
    return continuesSquares;
  }

  inputChange(): void {
    let qrCode: qrcodegen.QrCode|undefined;
    let qr_offset: number = 0;
    if(this.qr_code_content) {
      let segs: Array<qrcodegen.QrSegment> = qrcodegen.QrSegment.makeSegments(this.qr_code_content)
      qrCode = qrcodegen.QrCode.encodeSegments(segs,qrcodegen.QrCode.Ecc.HIGH, this.error_rate,40,-1,true)
      this.dimension = qrCode.size
      this.square_size = Math.floor(this.canvasDimension/this.dimension)//Math.floor(this.canvasDimension/qrCode.size)
      qr_offset = Math.ceil((this.canvasDimension - (this.square_size*this.dimension))/2)
      // this.square_size=max_square_size>2?max_square_size:2;
      console.log(qrCode)
    }else{
      this.dimension=undefined
    }
    this.ctx?.reset();
    //draw QR code
    if (this.ctx && qrCode && this.dimension) {
      this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
      var continuesSquares = this.getQrCodeCorner(qrCode)

      //draw the QR code content
      for(let i=0;i<this.dimension;i++){
        for(let ii=0;ii < this.dimension;ii++){
          if(qrCode.getModule(i, ii)){
            if(this.qr_style==="1"){
              this.drawSquare(qrCode,i,ii,qr_offset);
            }else if(this.qr_style==="2"){
              this.drawRoundSquare(qrCode,i,ii,qr_offset);
            }else if(this.qr_style==="3"){
              this.drawRoundDot(qrCode,i,ii,qr_offset,
                continuesSquares.map((v,i,a)=>{
                  return v.p
                }).flat().map((v,i)=>{ return v[0]+","+v[1] }),
                continuesSquares.map((v,i)=>{ return [
                  v.c_tl[0]+","+v.c_tl[1],
                  v.c_tr[0]+","+v.c_tr[1],
                  v.c_bl[0]+","+v.c_bl[1],
                  v.c_br[0]+","+v.c_br[1]
                ] }).flat())
            }else{
              this.drawSquare(qrCode,i,ii,qr_offset);
            }
          }
        }
      }

      if(this.qr_style==="3")
        this.drawRoundDotCorner(continuesSquares,qr_offset)

      //draw the icon
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

  drawSquare(qrCode: qrcodegen.QrCode, i: number,ii: number, qr_offset: number){
    if(this.ctx)
      this.ctx.fillRect(i*this.square_size+qr_offset, ii*this.square_size+qr_offset, Math.ceil(this.square_size), Math.ceil(this.square_size))
  }

  drawRoundSquare(qrCode: qrcodegen.QrCode, i: number,ii: number, qr_offset: number) {
    if(!this.ctx)
      return
    this.ctx.beginPath();
    this.ctx.arc(i*this.square_size+qr_offset+this.square_size/2, ii*this.square_size+qr_offset+this.square_size/2,this.square_size/2,0,2 * Math.PI);
    this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
    this.ctx.fill();
    if(qrCode.getModule(i + 1, ii)){
      this.ctx.fillRect(i*this.square_size+qr_offset+this.square_size/2, ii*this.square_size+qr_offset, Math.ceil(this.square_size), Math.ceil(this.square_size));
    }
    if(qrCode.getModule(i, ii + 1)){
      this.ctx.fillRect(i*this.square_size+qr_offset, ii*this.square_size+qr_offset+this.square_size/2, Math.ceil(this.square_size), Math.ceil(this.square_size));
    }
  }

  drawRoundDot(qrCode: qrcodegen.QrCode, i: number,ii: number, qr_offset: number, cornerPointArrays:string[],cornerCornerPointArrays:string[]){
    if(!this.ctx)
      return

    //Find 3 corner
    // for(let k=0;k<corners.length;k++){
    //   corners[k].tl.x == i
    //   corners[k].tl.y == ii
    // }
    console.log(cornerPointArrays)
    if(cornerPointArrays.includes(i+","+ii)){
      if(cornerCornerPointArrays.includes(i+","+ii)){

      } else {
        this.ctx.fillRect(i*this.square_size+qr_offset, ii*this.square_size+qr_offset, Math.ceil(this.square_size), Math.ceil(this.square_size))
      }
    } else {
      this.ctx.beginPath();
      this.ctx.arc(i*this.square_size+qr_offset+this.square_size/2, ii*this.square_size+qr_offset+this.square_size/2,this.square_size/2,0,2 * Math.PI);
      this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
      this.ctx.fill();
    }
    // if(qrCode.getModule(i + 1, ii)){
    //   this.ctx.fillRect(i*this.square_size+qr_offset+this.square_size/2, ii*this.square_size+qr_offset, Math.ceil(this.square_size), Math.ceil(this.square_size));
    // }
    // if(qrCode.getModule(i, ii + 1)){
    //   this.ctx.fillRect(i*this.square_size+qr_offset, ii*this.square_size+qr_offset+this.square_size/2, Math.ceil(this.square_size), Math.ceil(this.square_size));
    // }
  }

  drawRoundDotCorner(continuesSquares: any[], qr_offset: number){
    let x:number, y:number, dx:number, dy:number;
    if(this.ctx)
      for(let i=0;i<continuesSquares.length;i++){
        {
          x = continuesSquares[i].c_tl[0]
          y = continuesSquares[i].c_tl[1]
          dx = 1
          dy = 1
          this.ctx.beginPath();
          this.ctx.moveTo((x+dx)*this.square_size+qr_offset,(y+dy)*this.square_size+qr_offset)
          this.ctx.arc((x+dx)*this.square_size+qr_offset, (y+dy)*this.square_size+qr_offset,this.square_size,Math.PI,1.5*Math.PI);
          this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
          this.ctx.fill();

          x = continuesSquares[i].c_tl[0]+1
          y = continuesSquares[i].c_tl[1]+1
          dx = 1
          dy = 1
          this.ctx.beginPath();
          this.ctx.moveTo((x)*this.square_size+qr_offset,(y)*this.square_size+qr_offset)
          this.ctx.arc((x+dx)*this.square_size+qr_offset, (y+dy)*this.square_size+qr_offset,this.square_size,Math.PI,1.5*Math.PI);
          this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
          this.ctx.fill();
        }

        {
          x = continuesSquares[i].c_bl[0]
          y = continuesSquares[i].c_bl[1]
          dx = 1
          dy = 0
          this.ctx.beginPath();
          this.ctx.moveTo((x+dx)*this.square_size+qr_offset,(y+dy)*this.square_size+qr_offset)
          this.ctx.arc((x+dx)*this.square_size+qr_offset, (y+dy)*this.square_size+qr_offset,this.square_size,0.5*Math.PI,Math.PI);
          this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
          this.ctx.fill();

          x = continuesSquares[i].c_bl[0]+1
          y = continuesSquares[i].c_bl[1]-1
          dx = 1
          dy = 0
          this.ctx.beginPath();
          this.ctx.moveTo((x)*this.square_size+qr_offset,(y+1)*this.square_size+qr_offset)
          this.ctx.arc((x+dx)*this.square_size+qr_offset, (y+dy)*this.square_size+qr_offset,this.square_size,0.5*Math.PI,Math.PI);
          this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
          this.ctx.fill();
        }

        {
          x = continuesSquares[i].c_tr[0]
          y = continuesSquares[i].c_tr[1]
          dx = 0
          dy = 1
          this.ctx.beginPath();
          this.ctx.moveTo((x+dx)*this.square_size+qr_offset,(y+dy)*this.square_size+qr_offset)
          this.ctx.arc((x+dx)*this.square_size+qr_offset, (y+dy)*this.square_size+qr_offset,this.square_size,1.5*Math.PI,0);
          this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
          this.ctx.fill();

          x = continuesSquares[i].c_tr[0]-1
          y = continuesSquares[i].c_tr[1]+1
          dx = 0
          dy = 1
          this.ctx.beginPath();
          this.ctx.moveTo((x+1)*this.square_size+qr_offset,(y)*this.square_size+qr_offset)
          this.ctx.arc((x+dx)*this.square_size+qr_offset, (y+dy)*this.square_size+qr_offset,this.square_size,1.5*Math.PI,0);
          this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
          this.ctx.fill();
        }

        {
          x = continuesSquares[i].c_br[0]
          y = continuesSquares[i].c_br[1]
          dx = 0
          dy = 0
          this.ctx.beginPath();
          this.ctx.moveTo((x+dx)*this.square_size+qr_offset,(y+dy)*this.square_size+qr_offset)
          this.ctx.arc((x+dx)*this.square_size+qr_offset, (y+dy)*this.square_size+qr_offset,this.square_size,0,0.5*Math.PI);
          this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
          this.ctx.fill();

          x = continuesSquares[i].c_br[0]-1
          y = continuesSquares[i].c_br[1]-1
          dx = 0
          dy = 0
          this.ctx.beginPath();
          this.ctx.moveTo((x+1)*this.square_size+qr_offset,(y+1)*this.square_size+qr_offset)
          this.ctx.arc((x+dx)*this.square_size+qr_offset, (y+dy)*this.square_size+qr_offset,this.square_size,0,0.5*Math.PI);
          this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
          this.ctx.fill();
        }
        // this.ctx.beginPath();
        // this.ctx.arc(i*this.square_size+qr_offset+this.square_size/2, ii*this.square_size+qr_offset+this.square_size/2,this.square_size/2,0,2 * Math.PI);
        // this.ctx.fillStyle = this.qr_code_color?this.qr_code_color:"black";
        // this.ctx.fill();
      }
  }

  canFormSquare(qrCode: qrcodegen.QrCode, i: number, ii: number){
    if(i==28 && ii == 28){
      console.log("Small square")
    }
    let minSquareSize=3
    let j= i
    let jj = ii
    j = i
    jj = ii
    while(qrCode.getModule(j+1, jj)){j++} //horizontal check
    let rightTopX = j
    let rightTopY = jj

    if((rightTopX-i)<minSquareSize) return null

    while(qrCode.getModule(rightTopX, jj+1)){jj++}
    let rightBottomFromTopX = rightTopX
    let rightBottomFromTopY = jj

    if((rightBottomFromTopY-ii)<minSquareSize) return null

    j = i
    jj = ii
    while(qrCode.getModule(j, jj+1)){jj++} //vertical check
    let leftBottomX = j
    let leftBottomY = jj

    if((leftBottomY-ii)<minSquareSize) return null

    while(qrCode.getModule(j+1, leftBottomY)){j++}
    let rightBottomFromLeftX = j
    let rightBottomFromLeftY = leftBottomY

    if((rightBottomFromLeftX-i)<minSquareSize) return null
    if(rightBottomFromTopX==rightBottomFromLeftX && rightBottomFromTopY==rightBottomFromLeftY) {
      console.log(rightBottomFromTopX, rightBottomFromLeftX, rightBottomFromTopY, rightBottomFromLeftY)
      return {
        tl: {x: i, y: ii},
        tr: {x: rightTopX, y: rightTopY},
        bl: {x: leftBottomX, y: leftBottomY},
        br: {x: rightBottomFromLeftX, y: rightBottomFromTopY}
      }
    }else
      return null
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
