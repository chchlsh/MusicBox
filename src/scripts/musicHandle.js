import ajax from './ajax.js';
import MusicBox from './musicBox.js';

// const server = 'http://192.168.64.2/api/music.php?type=';
const server = 'https://www.zhanhu56.com/api/music/index.php?type=';

export default class musicHandle{

  constructor(){

    this.initMusicText = [];

    // 音乐类型
    this.aMusicType = document.querySelectorAll('.type input');
    this.oMusicType = document.querySelector('.type input:checked');

    this.musicTextBox = document.getElementById('music-text');
    this.oTitle = document.querySelector('.title');
    this.oSpeed = document.getElementById('speed');
    this.oSpeedValue = document.getElementById('speed-value');

    this.musicType = this.oMusicType.value;
    this.music = this.playMusic();

    this.init();

  }

  // 初始化
  init(){

    // 乐谱编写说明
    this.help();

    // 获取音乐列表
    this.showMusicList();

    // 设置音乐类型
    for(let i = 0; i < this.aMusicType.length; i++){
      this.aMusicType[i].addEventListener('change', (e)=>{
        if(e.target.checked){
          this.musicType = e.target.value;
          this.music.setMusicType(e.target.value);
        }
      });
    }

    // 播放乐谱
    document.addEventListener('keyup', (e)=>{
      if(e.keyCode == 13){  // 按下Enter键
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
    this.oSpeed.addEventListener('input', ()=>{
      this.oSpeedValue.innerHTML = this.oSpeed.value;
      this.oSpeed.style.backgroundSize = (this.oSpeed.value - 60) * 100 / 60 + '% 100%';
      this.music.setPlaySpeed(this.oSpeed.value);
      if(this.chord){
        this.chord.setPlaySpeed(this.oSpeed.value);
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

  // 获取乐谱列表
  showMusicList() {

    // let recordsJson = localStorage.getItem('musicText');
    let oRecords = document.querySelector('.music-name'), btns = '';

    ajax({
      url: server + 'musicList',
      dataType: 'json',
      data: {
        page: 0
      },
      success: (res)=>{

        if(res.code == 200){
          this.initMusicText = res.data.list;
          this.initMusicText.forEach(item => {
            btns += `<div class="btn" data-melody="${ item.melody }" data-chord="${ item.chord }" data-id="${ item.id }"><span>${ item.name }</span></div>`;
          });

          oRecords.innerHTML = btns;
        }
        else{
          console.log(res.msg);
        }

        this.chooseMusic();

      }
    });

  }

  // 播放乐曲
  playMusic(musicText){
    let autoplay = musicText ? Number(this.oSpeed.value) : false;
    return new MusicBox('.music-box', {
      loop: true, // 循环播放
      musicText: musicText,  // 乐谱
      autoplay: autoplay, // 自动弹奏速度
      type: this.musicType,  // 音色类型  sine|square|triangle|sawtooth
      duration: 3  // 键音延长时间
    });
  }

  // 点播乐曲
  chooseMusic() {
    let musicNameBtn = document.querySelectorAll('.music-name .btn');
    for(let i = 0; i < musicNameBtn.length; i++){
      musicNameBtn[i].addEventListener('click', e => {
        if(e.target.tagName.toLowerCase() === 'span'){  // 文字
          let melodyText = e.currentTarget.dataset.melody;
          let chordText = e.currentTarget.dataset.chord;
          this.musicTextBox.value = melodyText;
          this.music.pauseMusic();
          this.music = this.playMusic(melodyText);
          // 和弦
          if(this.chord){
            this.chord.pauseMusic();
          }
          if(chordText){
            this.chord = new MusicBox('.chord', {
              loop: true, // 循环播放
              musicText: chordText,  // 乐谱
              autoplay: this.oSpeed.value, // 自动弹奏速度
              duration: 3,  // 键音延长时间
              volume: .2    // 音量
            });
          }
          this.oTitle.innerHTML = e.currentTarget.querySelector('span').innerHTML;
          document.title = this.oTitle.innerHTML;
        }
        // else{  // 删除曲谱
        //   if(confirm('确定删除？')){
        //     this.deleteMusicText(e.currentTarget.dataset.id);
        //   }
        // }
      });
    }
  }

  // 保存乐谱
  // saveMusicText(name, text) {
  //
  //   // let sameIndex = this.initMusicText.findIndex(item => item.name === name);  // 找出records中名字为name的项索引
  //
  //   $.ajax({
  //     url: server + 'add',
  //     dataType: 'json',
  //     data: { name, text },
  //     success: (res)=>{
  //       this.showMusicList();
  //     }
  //   });
  //
  // }
  //
  // // 删除乐谱
  // deleteMusicText(id) {
  //
  //   $.ajax({
  //     url: server + 'delete',
  //     dataType: 'json',
  //     data: { id },
  //     success: (res)=>{
  //       this.showMusicList();
  //     }
  //   });
  //
  // }

}