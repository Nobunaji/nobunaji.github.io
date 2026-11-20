```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

void    checkArg(const char *a) {
  while (*a) {
    if (   (*a == ';')
        || (*a == '&')
        || (*a == '|')
        || (*a == ',')
        || (*a == '$')
        || (*a == '(')
        || (*a == ')')
        || (*a == '{')
        || (*a == '}')
        || (*a == '`')
        || (*a == '>')
        || (*a == '<') ) {
      puts("Forbidden !!!");
      exit(2);
    }
    a++;
  }
}
 
int     main() {
  char  *arg = malloc(0x20);
  char  *cmd = malloc(0x400);
  setreuid(geteuid(), geteuid());
 
  strcpy(cmd, "/bin/ls -l ");
 
  printf("Enter directory you want to display : ");
 
  gets(arg);
  checkArg(arg);
 
  strcat(cmd, arg);
  system(cmd);
 
  return 0;
}
```

Dump of assembler code for function main:
   0x000000000000094c <+0>:     push   rbp
   0x000000000000094d <+1>:     mov    rbp,rsp
   0x0000000000000950 <+4>:     push   rbx
   0x0000000000000951 <+5>:     sub    rsp,0x18
   0x0000000000000955 <+9>:     mov    edi,0x20
   0x000000000000095a <+14>:    call   0x730 <malloc@plt>
   0x000000000000095f <+19>:    mov    QWORD PTR [rbp-0x20],rax
   0x0000000000000963 <+23>:    mov    edi,0x400
   0x0000000000000968 <+28>:    call   0x730 <malloc@plt>
   0x000000000000096d <+33>:    mov    QWORD PTR [rbp-0x18],rax
   0x0000000000000971 <+37>:    call   0x710 <geteuid@plt>
   0x0000000000000976 <+42>:    mov    ebx,eax
   0x0000000000000978 <+44>:    call   0x710 <geteuid@plt>
   0x000000000000097d <+49>:    mov    esi,ebx
   0x000000000000097f <+51>:    mov    edi,eax
   0x0000000000000981 <+53>:    call   0x740 <setreuid@plt>
   0x0000000000000986 <+58>:    mov    rax,QWORD PTR [rbp-0x18]
   0x000000000000098a <+62>:    movabs rcx,0x20736c2f6e69622f
   0x0000000000000994 <+72>:    mov    QWORD PTR [rax],rcx
   0x0000000000000997 <+75>:    mov    DWORD PTR [rax+0x8],0x206c2d
   0x000000000000099e <+82>:    lea    rdi,[rip+0xf3]        # 0xa98
   0x00000000000009a5 <+89>:    mov    eax,0x0
   0x00000000000009aa <+94>:    call   0x700 <printf@plt>
   0x00000000000009af <+99>:    mov    rax,QWORD PTR [rbp-0x20]
   0x00000000000009b3 <+103>:   mov    rdi,rax
   0x00000000000009b6 <+106>:   mov    eax,0x0
   0x00000000000009bb <+111>:   call   0x720 <gets@plt>
   0x00000000000009c0 <+116>:   mov    rax,QWORD PTR [rbp-0x20]
   0x00000000000009c4 <+120>:   mov    rdi,rax
   0x00000000000009c7 <+123>:   call   0x88a <checkArg>
   0x00000000000009cc <+128>:   mov    rdx,QWORD PTR [rbp-0x20]
   0x00000000000009d0 <+132>:   mov    rax,QWORD PTR [rbp-0x18]
   0x00000000000009d4 <+136>:   mov    rsi,rdx
   0x00000000000009d7 <+139>:   mov    rdi,rax
   0x00000000000009da <+142>:   call   0x750 <strcat@plt>
   0x00000000000009df <+147>:   mov    rax,QWORD PTR [rbp-0x18]
   0x00000000000009e3 <+151>:   mov    rdi,rax
   0x00000000000009e6 <+154>:   call   0x6f0 <system@plt>
   0x00000000000009eb <+159>:   mov    eax,0x0
   0x00000000000009f0 <+164>:   add    rsp,0x18
   0x00000000000009f4 <+168>:   pop    rbx
   0x00000000000009f5 <+169>:   pop    rbp
   0x00000000000009f6 <+170>:   ret

On doit écraser cmd pour remplacer l'appel de /bin/ls -l par une autre commande

https://corruptedprotocol.medium.com/pe32-stack-buffer-overflow-basic-rootme-app-system-877a4bb457c1

https://gitlab.com/rsheasby/root-me-app-system/-/blob/master/04.%20ELF%20x86%20-%20Format%20string%20bug%20basic%201/instructions.md