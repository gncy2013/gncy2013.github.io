---
layout: post
title: ncrackme 分析
tags:
  - Crack
  - Disassembly
  - ncrackme
---

好多年前无聊找东西折腾的时候曾经尝试过破解看雪 CrackMe 板块版主 riijj 写的几个入门的 CrackMe, 但是当时太弱而且相关的东西基本都不会就放弃了 (现在还是好弱啊摔(╯°Д°)╯︵ ┻━┻).  
然后这么多年过去了居然又遇到这个程序了, 课上老师正好拿了其中一个 CrackMe 当例子讲, 于是回来自己破, 过程记录下.
<!-- more -->
首先是这个 CrackMe 程序的下载链接: [ncrackme](http://pan.baidu.com/s/1pJFHYbh)  
搭配版主自己写的详解食用风味更佳: [【原创】riijj Crackme (1) 的详解](http://bbs.pediy.com/showthread.php?t=7505)  
  
下面是我自己破解过程的记录.  
先直接打开程序, 随便输几个号码, 点击 Register 之后出现 failed 的消息窗口.  
接下来就可以打开 OD 加载它, 代码窗口右键搜索名称, 输入 `MessageBox` 就会跳转到消息框的函数在代码中的位置, 按 `F2` 设断点.  
运行程序, 输入任意内容, 点击 Register, 到达断点, 代码如下  
```asm
CPU Disasm
Address   Hex dump          Command                                  Comments
76FFFD1E  /$  8BFF          MOV EDI,EDI                              ; ID_X USER32.MessageBoxA(hOwner,Text,Caption,Type)
76FFFD20  |.  55            PUSH EBP
76FFFD21  |.  8BEC          MOV EBP,ESP
76FFFD23  |.  6A 00         PUSH 0                                   ; /LanguageID = LANG_NEUTRAL
76FFFD25  |.  FF75 14       PUSH DWORD PTR SS:[ARG.4]                ; |Type => [ARG.4]
76FFFD28  |.  FF75 10       PUSH DWORD PTR SS:[ARG.3]                ; |Caption => [ARG.3]
76FFFD2B  |.  FF75 0C       PUSH DWORD PTR SS:[ARG.2]                ; |Text => [ARG.2]
76FFFD2E  |.  FF75 08       PUSH DWORD PTR SS:[ARG.1]                ; |hOwner => [ARG.1]
76FFFD31  |.  E8 A0FFFFFF   CALL MessageBoxExA                       ; \USER32.MessageBoxExA
76FFFD36  |.  5D            POP EBP
76FFFD37  \.  C2 1000       RETN 10
```
这时按 `F8` 单步执行, 停到 `76FFFD36`, 点击确定按钮后跳到如下代码的 `004010A1` 处  
```asm
CPU Disasm
Address   Hex dump          Command                                  Comments
00401050  /$  817C24 08 110 CMP DWORD PTR SS:[ARG.2],111             ; HEX ncrackme.00401050(guessed hWnd,Msg,wParam,lParam)
00401058  |.  75 74         JNE SHORT 004010CE
0040105A  |.  8B4424 0C     MOV EAX,DWORD PTR SS:[ARG.3]
0040105E  |.  66:3D EA03    CMP AX,3EA
00401062  |.  75 42         JNE SHORT 004010A6
00401064  |.  E8 C7010000   CALL 00401230
00401069  |.  85C0          TEST EAX,EAX
0040106B  |.  6A 00         PUSH 0                                   ; //Type = MB_OK|MB_DEFBUTTON1|MB_APPLMODAL
0040106D  |.  68 80504000   PUSH OFFSET 00405080                     ; ||Caption = "ncrackme"
00401072  |.  75 1B         JNZ SHORT 0040108F                       ; ||
00401074  |.  A1 B8564000   MOV EAX,DWORD PTR DS:[4056B8]            ; ||
00401079  |.  68 64504000   PUSH OFFSET 00405064                     ; ||Text = "Registration successful."
0040107E  |.  50            PUSH EAX                                 ; ||hOwner => [4056B8] = 001A0162, class = myWindowClass, text = Newbie smallsize crackme - v1
0040107F  |.  FF15 C0404000 CALL DWORD PTR DS:[<&USER32.MessageBoxA> ; |\USER32.MessageBoxA
00401085  |.  E8 A6020000   CALL 00401330                            ; |
0040108A  |.  33C0          XOR EAX,EAX                              ; |
0040108C  |.  C2 1000       RETN 10                                  ; |
0040108F  |>  8B0D B8564000 MOV ECX,DWORD PTR DS:[4056B8]            ; |
00401095  |.  68 50504000   PUSH OFFSET 00405050                     ; |Text = "Registration fail."
0040109A  |.  51            PUSH ECX                                 ; |hOwner => [4056B8] = 001A0162, class = myWindowClass, text = Newbie smallsize crackme - v1
0040109B  |.  FF15 C0404000 CALL DWORD PTR DS:[<&USER32.MessageBoxA> ; \USER32.MessageBoxA
004010A1  |.  33C0          XOR EAX,EAX                              ; <== 停到这一行了
004010A3  |.  C2 1000       RETN 10
004010A6  |>  66:3D EB03    CMP AX,3EB
004010AA  |.  75 22         JNE SHORT 004010CE
004010AC  |.  A1 C0564000   MOV EAX,DWORD PTR DS:[4056C0]
004010B1  |.  85C0          TEST EAX,EAX
004010B3  |.  74 19         JZ SHORT 004010CE
004010B5  |.  8B15 B8564000 MOV EDX,DWORD PTR DS:[4056B8]
004010BB  |.  6A 00         PUSH 0                                   ; /Type = MB_OK|MB_DEFBUTTON1|MB_APPLMODAL
004010BD  |.  68 80504000   PUSH OFFSET 00405080                     ; |Caption = "ncrackme"
004010C2  |.  68 30504000   PUSH OFFSET 00405030                     ; |Text = "good function, i was cracked"
004010C7  |.  52            PUSH EDX                                 ; |hOwner => [4056B8] = 001A0162, class = myWindowClass, text = Newbie smallsize crackme - v1
004010C8  |.  FF15 C0404000 CALL DWORD PTR DS:[<&USER32.MessageBoxA> ; \USER32.MessageBoxA
004010CE  |>  33C0          XOR EAX,EAX
004010D0  \.  C2 1000       RETN 10
```
上面的代码里有三个 `MessageBox`, `00401072  |.  75 1B         JNZ SHORT 0040108F` 这一行就是判断点击 Register 后是弹出哪个消息的代码.  
往上看, `JNZ` 使用的结果来自于 `00401069  |.  85C0          TEST EAX,EAX`. `EAX` 不是 0 则跳到 fail, 如果是 0 则跳到 successful.  
于是可以简单地把 `JNZ` 改成 `JZ`, 则 key 错误时也会直接弹出 successful 的消息窗口.  
未完待续...
