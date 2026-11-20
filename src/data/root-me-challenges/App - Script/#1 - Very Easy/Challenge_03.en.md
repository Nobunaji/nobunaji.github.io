# Exercise 3 — Bash — System 2

## Context

- Protocol: SSH
- Port: `2222`
- Host: `challenge02.root-me.org`
- User: `app-script-ch12`
- Password: `app-script-ch12`

```bash
ssh -p 2222 app-script-ch12@challenge02.root-me.org
```

## Source Code

```c
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main(){
    setreuid(geteuid(), geteuid());
    system("ls -lA /challenge/app-script/ch12/.passwd");
    return 0;
}
```

## Objective

Read the contents of the secret file `/challenge/app-script/ch12/.passwd`.

## Analysis

The program aligns user IDs via `setreuid(geteuid(), geteuid())` and invokes `system()` with options passed to `ls` on the target file. With the SUID bit set, this preserves the owner's elevated identity across the external call.

## Resolution Hint

Inspect how `ls` is resolved through `PATH` in a privileged context and review how the external command is invoked by `system()`.

## Explanation

`system()` relies on a shell to resolve `ls` via `PATH`, exposing privileged execution to untrusted `PATH` resolution. Defensively, privileged binaries should avoid `system()` and invoke explicit absolute paths directly via APIs such as `execve()`.