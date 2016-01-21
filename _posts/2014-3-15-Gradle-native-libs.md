---
layout: post
title: Android Studio 打包 .so 库
tags:
  - Android
---

UPDATE: 新版本已经直接支持导入 Native libs  
~~This was mistaken text~~  
~~ 前段时间利用 `libvlcjni.so` 写个播放器, 但是 `Android Studio` 所使用的 `Gradle` 并不支持 NDK. ~~
~~ 网上找到的很多方法都挺麻烦的, 于是折腾出以下这个比较奇葩的解决方案.~~
<!-- nomore -->
~~ 将含有所需的 `.so` 库的目录 `armeabi-v7a` 放到另一个新建的目录 `lib`.~~
~~ 将整个 `lib` 添加到 `.zip` 压缩包, 扩展名改为 `.jar`, 然后放入 `libs` 目录, 编译时就会直接打包进 apk.~~
~~ 其实网上那些写脚本处理的和这个流程好像是差不多的, 不过对 `Gradle` 不熟, 就用这个方法也挺方便的.~~
![IDEA-Native-Library](http://gncy2013.github.io/images/idea-native-lib.png)