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
```nasm
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
```nasm
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
然而简单的爆破并没有什么卵用, 所以要找到验证密钥的算法, 上面的 `TEST EAX,EAX` 用了 `CALL 00401230` 的返回值, 于是右键选择 Go to 选择 expression 跳到这里. 就是下面这一大坨代码.  
```asm
CPU Disasm
Address   Hex dump          Command                                  Comments
00401230  /$  8B0D BC564000 MOV ECX,DWORD PTR DS:[4056BC]
00401236  |.  83EC 30       SUB ESP,30
00401239  |.  8D4424 00     LEA EAX,[LOCAL.11]
0040123D  |.  53            PUSH EBX
0040123E  |.  56            PUSH ESI
0040123F  |.  8B35 94404000 MOV ESI,DWORD PTR DS:[<&USER32.GetDlgIte
00401245  |.  6A 10         PUSH 10                                  ; /MaxCount = 16.
00401247  |.  50            PUSH EAX                                 ; |String => OFFSET LOCAL.11
00401248  |.  68 E8030000   PUSH 3E8                                 ; |ItemID = 1000.
0040124D  |.  51            PUSH ECX                                 ; |hDialog => [4056BC] = 001304BC, class = #32770
0040124E  |.  33DB          XOR EBX,EBX                              ; |
00401250  |.  FFD6          CALL ESI                                 ; \USER32.GetDlgItemTextA
00401252  |.  83F8 03       CMP EAX,3
00401255  |.  73 0B         JAE SHORT 00401262                       ; 这里 如果 EAX 长度不小于 3 则跳转, 否则 RETN, EAX 是 Reg name
00401257  |.  5E            POP ESI
00401258  |.  B8 01000000   MOV EAX,1
0040125D  |.  5B            POP EBX
0040125E  |.  83C4 30       ADD ESP,30
00401261  |.  C3            RETN
00401262  |>  A1 BC564000   MOV EAX,DWORD PTR DS:[4056BC]
00401267  |.  8D5424 28     LEA EDX,[LOCAL.3]
0040126B  |.  6A 10         PUSH 10
0040126D  |.  52            PUSH EDX
0040126E  |.  68 E9030000   PUSH 3E9
00401273  |.  50            PUSH EAX
00401274  |.  FFD6          CALL ESI
00401276  |.  0FBE4424 08   MOVSX EAX,BYTE PTR SS:[ARG.2]            ; name 第一位放入 EAX
0040127B  |.  0FBE4C24 09   MOVSX ECX,BYTE PTR SS:[ARG.2+1]          ; name 第二位放入 ECX
00401280  |.  99            CDQ                                      ; EAX 扩展为 64 位 QWORD 
00401281  |.  F7F9          IDIV ECX                                 ; 把 EDX:EAX 除以 ECX，余数放在 EDX (EDX:EAX) = (EDX:EAX) / ECX 
00401283  |.  8BCA          MOV ECX,EDX                              ; 余数存到 ECX
00401285  |.  83C8 FF       OR EAX,FFFFFFFF                          ; EAX 全置 1
00401288  |.  0FBE5424 0A   MOVSX EDX,BYTE PTR SS:[ARG.2+2]          ; name 第三位放入 EDX
0040128D  |.  0FAFCA        IMUL ECX,EDX                             ; ECX = ECX * EDX
00401290  |.  41            INC ECX                                  ; ECX = ECX + 1
00401291  |.  33D2          XOR EDX,EDX                              ; EDX = 0
00401293  |.  F7F1          DIV ECX                                  ; (EDX:EAX) = (EDX:EAX) / ECX 
00401295  |.  50            PUSH EAX                                 ; /Arg1
00401296  |.  E8 A5000000   CALL 00401340                            ; \ncrackme.00401340 保存 EAX 到4050AC

Address   Hex dump          Command                                  Comments
00401340  /$  8B4424 04     MOV EAX,DWORD PTR SS:[ARG.1]             ; ncrackme.00401340(guessed Arg1)
00401344  |.  A3 AC504000   MOV DWORD PTR DS:[4050AC],EAX
00401349  \.  C3            RETN
0040134A  /$  A1 AC504000   MOV EAX,DWORD PTR DS:[4050AC]            ; ncrackme.0040134A(guessed void)
0040134F  |.  69C0 FD430300 IMUL EAX,EAX,343FD                       ; EAX = EAX * 343FD 
00401355  |.  05 C39E2600   ADD EAX,269EC3                           ; EAX = EAX + 269EC3
0040135A  |.  A3 AC504000   MOV DWORD PTR DS:[4050AC],EAX            ; 保存 EAX 到4050AC
0040135F  |.  C1F8 10       SAR EAX,10                               ; 向右移 10 位
00401362  |.  25 FF7F0000   AND EAX,00007FFF                         ; 与 7FFF
00401367  \.  C3            RETN
```
上面这一堆运算用正常人看着舒服点的样子写就是下面这样  
```c
ECX = name[0] % name[1]  
ECX = name[2] * (name[0] % name[1])  
ECX = (name[2] * (name[0] % name[1]) + 1)  
EAX = 0xFFFFFFFF / (name[2] * (name[0] % name[1]) + 1)  
EAX = (0xFFFFFFFF / (name[2] * (name[0] % name[1]) + 1)) * 0x343FD  
EAX = (0xFFFFFFFF / (name[2] * (name[0] % name[1]) + 1)) * 0x343FD + 0x269EC3 保存到 4050AC  
EAX = ((0xFFFFFFFF / (name[2] * (name[0] % name[1]) + 1)) * 0x343FD + 0x269EC3) >> 0x10  
EAX = (((0xFFFFFFFF / (name[2] * (name[0] % name[1]) + 1)) * 0x343FD + 0x269EC3) >> 0x10) AND 0x7FFF  
```



```asm
004012A0  |>  E8 A5000000   /CALL 0040134A                           ; [ncrackme.0040134A
004012A5  |.  99            |CDQ
004012A6  |.  B9 1A000000   |MOV ECX,1A
004012AB  |.  F7F9          |IDIV ECX
004012AD  |.  80C2 41       |ADD DL,41                               ; 加41
004012B0  |.  885434 18     |MOV BYTE PTR SS:[ESI+ESP+18],DL
004012B4  |.  46            |INC ESI
004012B5  |.  83FE 0F       |CMP ESI,0F                              ; 0 到 15 循环
004012B8  |.^ 72 E6         \JB SHORT 004012A0
004012BA  |.  57            PUSH EDI
004012BB  |.  8D7C24 0C     LEA EDI,[ARG.3]
004012BF  |.  83C9 FF       OR ECX,FFFFFFFF
004012C2  |.  33C0          XOR EAX,EAX
004012C4  |.  33F6          XOR ESI,ESI
004012C6  |.  F2:AE         REPNE SCAS BYTE PTR ES:[EDI]
004012C8  |.  F7D1          NOT ECX
004012CA  |.  49            DEC ECX
004012CB  |.  74 59         JZ SHORT 00401326
004012CD  |>  8A4434 0C     /MOV AL,BYTE PTR SS:[ESI+ESP+0C]
004012D1  |.  C0F8 05       |SAR AL,5
004012D4  |.  0FBEC0        |MOVSX EAX,AL
004012D7  |.  8D1480        |LEA EDX,[EAX*4+EAX]
004012DA  |.  8D04D0        |LEA EAX,[EDX*8+EAX]
004012DD  |.  8D0440        |LEA EAX,[EAX*2+EAX]
004012E0  |.  85C0          |TEST EAX,EAX
004012E2  |.  7E 0A         |JLE SHORT 004012EE
004012E4  |.  8BF8          |MOV EDI,EAX
004012E6  |>  E8 5F000000   |/CALL 0040134A                          ; [ncrackme.0040134A
004012EB  |.  4F            ||DEC EDI
004012EC  |.^ 75 F8         |\JNZ SHORT 004012E6
004012EE  |>  E8 57000000   |CALL 0040134A                           ; [ncrackme.0040134A
004012F3  |.  99            |CDQ
004012F4  |.  B9 1A000000   |MOV ECX,1A
004012F9  |.  8D7C24 0C     |LEA EDI,[ARG.3]
004012FD  |.  F7F9          |IDIV ECX
004012FF  |.  0FBE4C34 2C   |MOVSX ECX,BYTE PTR SS:[ESI+ESP+2C]
00401304  |.  80C2 41       |ADD DL,41
00401307  |.  0FBEC2        |MOVSX EAX,DL
0040130A  |.  2BC1          |SUB EAX,ECX
0040130C  |.  885434 1C     |MOV BYTE PTR SS:[ESI+ESP+1C],DL
00401310  |.  99            |CDQ                                     ; Calculates abs(EAX)
00401311  |.  33C2          |XOR EAX,EDX
00401313  |.  83C9 FF       |OR ECX,FFFFFFFF
00401316  |.  2BC2          |SUB EAX,EDX
00401318  |.  03D8          |ADD EBX,EAX
0040131A  |.  33C0          |XOR EAX,EAX
0040131C  |.  46            |INC ESI
0040131D  |.  F2:AE         |REPNE SCAS BYTE PTR ES:[EDI]
0040131F  |.  F7D1          |NOT ECX
00401321  |.  49            |DEC ECX
00401322  |.  3BF1          |CMP ESI,ECX
00401324  |.^ 72 A7         \JB SHORT 004012CD
00401326  |>  5F            POP EDI
00401327  |.  8BC3          MOV EAX,EBX
00401329  |.  5E            POP ESI
0040132A  |.  5B            POP EBX
0040132B  |.  83C4 30       ADD ESP,30
0040132E  \.  C3            RETN
```

还有简单的方法, 打开 IDA Pro, 按 F5, 然后就有 C 语言代码了.  
```c
if ( GetDlgItemTextA(dword_4056BC, 1000, &String, 16) >= 3 )
  {
    GetDlgItemTextA(dword_4056BC, 1001, v12, 16);
    sub_401340(0xFFFFFFFFu / (v10 * String % v9 + 1));
    v2 = 0;
    do
      v11[v2++] = rand() % 26 + 65;
    while ( v2 < 0xF );
    v3 = 0;
    if ( strlen(&String) != 0 )
    {
      do
      {
        if ( 123 * (char)(*(&String + v3) >> 5) > 0 )
        {
          v4 = 123 * (char)(*(&String + v3) >> 5);
          do
          {
            rand();
            --v4;
          }
          while ( v4 );
        }
        v5 = rand();
        v6 = v12[v3];
        v11[v3] = v5 % 26 + 65;
        v7 = (signed int)(char)(v5 % 26 + 65) - v6;
        v0 += (HIDWORD(v7) ^ v7) - HIDWORD(v7);
        ++v3;
      }
      while ( v3 < strlen(&String) );
    }
    result = v0;
  }
  else
  {
    result = 1;
  }
  return result;
```

keygen  
```c
#include<stdio.h>
main()
{
 int i,j,k,len;
 char name[20],psw[20],key[20];
 
 long ax,cx,sum,dx,loc;
 
 printf("name:");
 scanf("%s",name);
 
 sum=0;
 ax=name[0];
 cx=name[1];
 cx=ax%cx;
 loc=0x002266f0;
 ax|=0xffffffff;
 cx=cx*name[2]+1;
 
 for(i=0;i<0x0f;i++)
 {
  ax=loc;
  ax=ax*0x343FD;
  ax+=0x269EC3;
  loc=ax;
  ax>>=0x10;
  ax&=0x7fff;
  key[i]=ax%0x1a+0x41;
 }
 
 len=strlen(name);
 
 for(i=0;i<len;i++)
 {
  ax=name[i];
  ax>>=5;
  ax&=0x0ff;
  dx=ax*5;
  ax=(ax+dx*8)*3;
  if(ax==0)break;
  
  k=ax;
  for(j=0;j<=k;j++)
  {
   ax=loc;
   ax=ax*0x343FD;
   ax+=0x269EC3;
   loc=ax;
   ax>>=0x10;
   ax&=0x7fff;
  }
  dx=ax%0x1a+0x41;
  printf("%c",dx);//计算每位码值
  ax=dx-psw[i];
  key[i]=dx;
  sum+=ax;
  
 }
 printf("\n");
 getchar();
 
}
```
心好累, 不想写了