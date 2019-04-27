/**
 *
 * 音乐盒
 *
 * 2018.11.14 by wangrui
 *
 */

class MusicBox {

  constructor(selector, options){

    let defaults = {

      loop: false, // 循环播放
      musicText: '',  // 乐谱
      autoplay: 60, // 自动弹奏速度
      type: 'sine',  // 音色类型  sine|square|triangle|sawtooth
      duration: 2,  // 键音延长时间
      volume: 1     // 音量

    };

    this.selector = selector;
    this.opts = Object.assign(defaults, options);

    // 创建新的音频上下文接口
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // 音阶频率
    this.arrFrequency = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568, 1760, 1967];
    // 音符
    this.arrNotes = ['c', 'd', 'e', 'f', 'g', 'a', 'b', '1', '2', '3', '4', '5', '6', '7', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
    // 键码值
    this.keyCodes = [81, 87, 69, 82, 84, 89, 85, 49, 50, 51, 52, 53, 54, 55, 65, 83, 68, 70, 71, 72, 74];

    // 绘制钢琴
    this.draw();

    this.speed = 60;
    this.paused = false;

    // 播放乐谱
    if(this.opts.autoplay){
      this.speed = this.opts.autoplay === true ? this.speed : this.opts.autoplay;
      this.playMusic(this.opts.musicText);
    }

  }

  // 创建乐音
  createMusic(note){

    let index = this.arrNotes.indexOf(note);

    if(index !== -1){
      this.createSound(this.arrFrequency[index]);
    }

  }

  // 创建声音
  createSound(freq) {

    // 创建一个OscillatorNode, 它表示一个周期性波形（振荡），基本上来说创造了一个音调
    let oscillator = this.audioCtx.createOscillator();
    // 创建一个GainNode,它可以控制音频的总音量
    let gainNode = this.audioCtx.createGain();
    // 把音量，音调和终节点进行关联
    oscillator.connect(gainNode);
    // this.audioCtx.destination返回AudioDestinationNode对象，表示当前audio context中所有节点的最终节点，一般表示音频渲染设备
    gainNode.connect(this.audioCtx.destination);
    // 指定音调的类型  sine|square|triangle|sawtooth
    oscillator.type = this.opts.type;
    // 设置当前播放声音的频率，也就是最终播放声音的调调
    oscillator.frequency.value = freq;
    // 当前时间设置音量为0
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    // 0.01秒后音量为this.opts.volume
    gainNode.gain.linearRampToValueAtTime(this.opts.volume, this.audioCtx.currentTime + 0.01);
    // 音调从当前时间开始播放
    oscillator.start(this.audioCtx.currentTime);
    // this.opts.duration秒内声音慢慢降低，是个不错的停止声音的方法
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + this.opts.duration);
    // this.opts.duration秒后完全停止声音
    oscillator.stop(this.audioCtx.currentTime + this.opts.duration);

  }

  // 绘制钢琴
  draw(){

    this.musicBtn = null;

    let musicBtns = document.querySelector(this.selector),
        li = '',
        noteClass = '';
    let lowHighNote = { c: 1, d: 2, e: 3, f: 4, g: 5, a: 6, b: 7};  // 字母与高低音阶匹配表

    for(let i = 0; i < this.arrFrequency.length; i++){
      noteClass = (this.arrNotes[i] >= 'a' && this.arrNotes[i] <= 'g') ? 'low' : ((this.arrNotes[i] >= 'A' && this.arrNotes[i] <= 'G') ? 'high' : '');
      li += '<li><span></span><i class="'+ noteClass +'">'+ (lowHighNote[this.arrNotes[i].toLowerCase()] || this.arrNotes[i]) +'</i></li>'
    }

    musicBtns.innerHTML = '<ul>'+ li +'</ul>';

    // 鼠标点击发声
    this.musicBtn = musicBtns.querySelectorAll('li');
    for(let i = 0; i < this.arrFrequency.length; i++){
      this.musicBtn[i].addEventListener('mousedown',(e)=>{
        this.pressBtn(i);
      })
    }

    // 鼠标起来时样式消失
    document.addEventListener('mouseup', () => {
      for(let i = 0; i < this.arrFrequency.length; i++){
        this.musicBtn[i].className = '';
      }
    });
    // document.onmouseup = () => {
    //   for(let i = 0; i < this.arrFrequency.length; i++){
    //     this.musicBtn[i].className = '';
    //   }
    // };

    // 键盘按键发声
    document.addEventListener('keydown', (e) => {
      let nodeName = document.activeElement.nodeName.toLowerCase();
      if(nodeName !== 'input' && nodeName !== 'textarea'){  // 此时焦点不在input或textarea上
        if(this.keyCodes.indexOf(e.keyCode) !== -1){
          this.pressBtn(this.keyCodes.indexOf(e.keyCode));
        }
      }
    });

  }

  // 按下钢琴键
  pressBtn(i) {

    this.musicBtn[i].className = 'cur';
    this.createSound(this.arrFrequency[i]);
    setTimeout(() => {
      this.musicBtn[i].className = '';
    },300);

  }

  // 播放乐谱
  playMusic(musicText) {

    let noteArr = musicText.split('');
    let delayTime = 1000 * 60;

    (async () => {
        try{
          let i = 0;
          while (!this.paused) {
            if(i >= noteArr.length){  // 停止或者循环
              if(this.opts.loop){
                i = 0;
              }
              else {
                break;
              }
            }
            let n = this.arrNotes.indexOf(noteArr[i]);  // 钢琴键位置
            if(n !== -1){  // 发出乐音
              this.pressBtn(n);
            }
            else{
              switch (noteArr[i]) {
                case '0': break; // 休止符
                case '-': await sleep(delayTime / (2 * this.speed)); break; // 八分音符时值
                case '=': await sleep(delayTime / (4 * this.speed)); break; // 十六分音符时值
                default: await sleep(delayTime / this.speed); break; // 四分音符时值
              }
            }
            i++;
          }
        }
        catch (e) {
          location.reload();
        }
    })();

  }

  // 暂停播放
  pauseMusic(){

    this.paused = true;

  }

  // 设置音乐类型
  setMusicType(type){

    this.opts.type = type;

  }

  // 设置播放速度
  setPlaySpeed(speed){

    this.speed = speed;

  }

}

// 延迟执行
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

window.MusicBox = MusicBox;

export default MusicBox;