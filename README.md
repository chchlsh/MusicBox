# MusicBox
一个音乐盒插件，可以通过输入乐谱来自动播放对应的曲子，同时可以配置其音色和播放速度等。

### 插件所在具体路径： 
```
/src/scripts/musicBox.js
```

### 参数默认配置：
```
{
    loop: false, // 循环播放
    musicText: '',  // 乐谱
    autoplay: 60, // 自动弹奏速度
    type: 'sine',  // 音色类型  sine|square|triangle|sawtooth
    duration: 2,  // 键音延长时间
    volume: 1,     // 音量
    mixing: false,  // 混合立体音
    keyboard: true  // 键盘控制
}
```

### 如何编写乐谱？
>1. 低音由低到高分别依次对应小写字母（c,d,e,f,g,a,b）
>2. 中音由低到高分别依次对应数字（1,2,3,4,5,6,7）
>3. 高音由低到高分别依次对应大写字母（C,D,E,F,G,A,B）
>4. 空格代表四分音符时值，符号"-"代表八分音符时值，符号"="代表十六分音符时值
>5. 音符紧挨一起则代表同时发声，可用于编写和弦

***
项目Demo: https://zhanhu56.com/h5/music_box/
