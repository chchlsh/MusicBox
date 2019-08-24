import ajax from './ajax.js';
import MusicBox from './musicBox.js';

// const server = 'http://192.168.64.2/api/music.php?type=';
const server = 'https://www.zhanhu56.com/api/music/index.php?type=';

export default class musicHandle{

  constructor(){

    // 乐谱数据
    this.initMusicText = [];

    this.oTitle = document.querySelector('.title');

    // 音乐类型
    this.aMusicType = document.querySelectorAll('.type input');
    this.oMusicType = document.querySelector('.type input:checked');

    this.musicTextBox = document.getElementById('music-text');
    this.oMusicName = document.querySelector('.music-name');
    this.oSpeed = document.getElementById('speed');
    this.oSpeedValue = document.getElementById('speed-value');

    this.musicTypes = ['sine', 'square', 'triangle', 'sawtooth'];
    this.curType = Number(this.oMusicType.value); // 当前音色类型
    this.musicType = this.musicTypes[this.curType];  // 音色类型
    this.music = this.playMusic();  // music对象
    this.paused = true;  // 是否停止播放
    this.curMusic = -1; // 当前音乐
    this.speed = Number(this.oSpeed.value);  // 播放速度

    this.init();

  }

  // 初始化
  init(){

    // 背景图片
    let oBg = document.querySelector('.bg');
    oBg.src = require(`../images/bg_${ Math.ceil(Math.random() * 4) }.jpg`);

    // 乐谱编写说明
    this.help();

    // 获取音乐列表
    this.showMusicList();

    // 设置音乐类型
    for(let i = 0; i < this.aMusicType.length; i++){
      this.aMusicType[i].addEventListener('change', (e)=>{
        if(e.target.checked){
          this.setMusicType(e.target.value);
        }
      });
    }

    // 播放乐谱
    document.addEventListener('keyup', (e)=>{
      if(e.keyCode === 13){  // 按下Enter键
        let text = this.musicTextBox.value;  // 获取乐谱
        if(text){
          this.music.pauseMusic();
          this.music = this.playMusic(text);

          // let musicName = prompt('请输入曲名') || '';
          // if(musicName.trim() !== ''){
          //   this.saveMusicText(musicName.trim(), encodeURIComponent(text));
          //   this.oTitle.innerHTML = musicName;
          // }
        }
        else{
          alert('请输入乐谱！');
        }
      }
    });

    // 设置播放速度
    this.setMusicSpeed(this.oSpeed.value);
    this.oSpeed.addEventListener('input', ()=>{
      this.setMusicSpeed(this.oSpeed.value);
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
      let nodeName = document.activeElement.nodeName.toLowerCase();
      if(nodeName !== 'textarea'){  // 此时焦点不在textarea上
        const step = Number(this.oSpeed.step);
        const min = Number(this.oSpeed.min);
        const max = Number(this.oSpeed.max);
        const typeLen = this.aMusicType.length;
        switch (e.keyCode) {
          // 停止与播放
          case 32: {
            if(this.curMusic === -1) this.curMusic = 0;
            if(!this.paused){ // 若正播放，则停止
              this.pauseMusic();
              this.paused = true;
            } else { // 若已停止，则播放
              this.chooseMusic(this.curMusic);
              this.paused = false;
            }
          } break;
          // 减慢播放速度
          case 189: {
            if(this.speed > min) this.speed -= step;
            this.setMusicSpeed(this.speed);
          } break;
          // 加快播放速度
          case 187: {
            if(this.speed < max) this.speed += step;
            this.setMusicSpeed(this.speed);
          } break;
          // 上一种音色类型
          case 37: {
            this.curType = (this.curType + typeLen - 1) % typeLen;
            this.setMusicType(this.curType);
          } break;
          // 下一种音色类型
          case 39: {
            this.curType = (this.curType + 1) % typeLen;
            this.setMusicType(this.curType);
          } break;
          // 上一首
          case 38: {
            if(this.initMusicText.length){
              this.curMusic = (this.curMusic + this.initMusicText.length - 1) % this.initMusicText.length;
              this.chooseMusic(this.curMusic);
            }
          } break;
          // 下一首
          case 40: {
            if(this.initMusicText.length){
              this.curMusic = (this.curMusic + 1) % this.initMusicText.length;
              this.chooseMusic(this.curMusic);
            }
          } break;
        }
      }
    });

  }

  // 乐谱编写说明
  help(){
    document.querySelector('.help .icon').addEventListener('click', () => {
      document.querySelector('.popop').classList.add('show');
    });
    document.querySelector('.help .close').addEventListener('click', () => {
      document.querySelector('.popop').classList.remove('show');
    });
  }

  // 设置音色类型
  setMusicType(typeId){
    this.aMusicType[typeId].checked = true;
    this.musicType = this.musicTypes[typeId];
    this.music.setMusicType(this.musicType);
  }

  // 获取乐谱列表
  showMusicList() {

    let btns = '';

    ajax({
      url: server + 'musicList',
      dataType: 'json',
      data: {
        page: 0
      },
      success: (res)=>{
        if(res.code === 200){
          this.initMusicText = res.data.list;
          this.initMusicText.forEach(item => {
            btns += `<div class="btn"><span>${ item.name }</span></div>`;
          });

          this.oMusicName.innerHTML = btns;

          // 点播乐曲
          this.aMusicName = document.querySelectorAll('.music-name .btn');
          for(let i = 0; i < this.aMusicName.length; i++){
            this.aMusicName[i].addEventListener('click', e => {
              this.curMusic = i;
              this.chooseMusic(i);
            });
          }
        }
        else{
          console.log(res.msg);
        }

      }
    });

  }

  // 播放乐曲
  playMusic(musicText){
    let autoplay = musicText ? Number(this.oSpeed.value) : false;
    return new MusicBox('.music-box', {
      loop: true, // 循环播放
      musicText: decodeURIComponent(musicText),  // 乐谱
      autoplay: autoplay, // 自动弹奏速度
      type: this.musicType,  // 音色类型  sine|square|triangle|sawtooth
      duration: 3,  // 键音延长时间
      mixing: true
    });
  }

  // 设置播放速度
  setMusicSpeed(speed){
    this.oSpeed.value = speed;
    this.oSpeedValue.innerHTML = speed;
    this.oSpeed.style.backgroundSize = (speed - 60) * 100 / 60 + '% 100%';
    this.music.setPlaySpeed(speed);
    if(this.chord){
      this.chord.setPlaySpeed(speed);
    }
  }

  // 点播乐曲
  chooseMusic(i) {
    let melodyText = this.initMusicText[i].melody;
    let chordText = this.initMusicText[i].chord;
    for(let i = 0; i < this.aMusicName.length; i++){
      this.aMusicName[i].classList.remove('cur');
    }
    this.aMusicName[i].classList.add('cur');
    this.paused = false;
    this.musicTextBox.value = decodeURIComponent(melodyText);
    this.music.pauseMusic();
    this.music = this.playMusic(melodyText);
    // 和弦
    if(this.chord){
      this.chord.pauseMusic();
    }
    if(chordText){
      this.chord = new MusicBox('.chord', {
        loop: true, // 循环播放
        musicText: decodeURIComponent(chordText),  // 乐谱
        autoplay: this.oSpeed.value, // 自动弹奏速度
        duration: 3,  // 键音延长时间
        volume: .2    // 音量
      });
    }
    this.oTitle.innerHTML = this.initMusicText[i].name;
    document.title = this.oTitle.innerHTML;
  }

  // 停止点播
  pauseMusic(){
    this.music.pauseMusic();
    // 和弦
    if(this.chord){
      this.chord.pauseMusic();
    }
  }

}