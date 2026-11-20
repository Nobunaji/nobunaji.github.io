# Exercice 3 — Bash — Système 2

## Contexte

- Protocole : SSH
- Port : `2222`
- Hôte : `challenge02.root-me.org`
- Utilisateur : `app-script-ch12`
- Mot de passe : `app-script-ch12`

```bash
ssh -p 2222 app-script-ch12@challenge02.root-me.org
```

## Code source

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

## Objectif

Lire le contenu du fichier secret `/challenge/app-script/ch12/.passwd`.

## Analyse

Le programme aligne les identifiants utilisateur via `setreuid(geteuid(), geteuid())` puis invoque `system()` avec des options passées à `ls` sur le fichier cible. Lorsque le binaire dispose du bit SUID, cette séquence maintient l'identité privilégiée du propriétaire lors de l'appel externe.

## Piste de résolution

Auditer la résolution de `ls` via `PATH` dans un contexte privilégié et vérifier comment la commande externe est invoquée par `system()`.

## Explication

`system()` délègue l'exécution à un shell qui résout `ls` selon `PATH`, ce qui expose l'exécution privilégiée à une résolution `PATH` non maîtrisée. Défensivement, il convient d'éviter `system()` dans les binaires privilégiés et d'utiliser un chemin absolu via des appels directs comme `execve()`.