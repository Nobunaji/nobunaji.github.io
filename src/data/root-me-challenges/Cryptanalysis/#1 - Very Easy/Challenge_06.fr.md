# Challenge 6 - Hash - MD5

## Contexte
* **Catégorie :** Cryptanalyse
* **Sous-titre :** Bob trouve que Ronald Rivest est un cryptologue formidable.
* **Énoncé :** Identifiez le format du condensat donné et cassez-le.
* **Fichier fourni :** Un fichier texte contenant :

```text
7ecc19e1a0be36ba2c6f05d06b5d3058
```

## Résolution
La chaîne est composée de 32 caractères hexadécimaux (`0-9` et `a-f`), ce qui correspond à un condensat sur 128 bits typique de **MD5** (conçu par Ronald Rivest, comme l'évoque l'indice du challenge).

On place le hash dans un fichier (par exemple `challenge.txt`), puis on utilise **John the Ripper** au format `Raw-MD5` avec une wordlist (par exemple `rockyou.txt`) :

```bash
john --format=Raw-MD5 --wordlist="/usr/share/wordlists/rockyou.txt" challenge.txt
```

**Résultat obtenu :**

> Using default input encoding: UTF-8\
> Loaded 1 password hash (Raw-MD5 [MD5 256/256 AVX2 8x3])\
> Warning: no OpenMP support for this hash type, consider --fork=12\
> Press 'q' or Ctrl-C to abort, almost any other key for status\
> **<span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content">weak</span></span>**             (**?**)\
> 1g 0:00:00:00 DONE (2026-11-26 18:00) 20.00g/s 23439Kp/s 23439Kc/s 23439KC/s webb26..wcballa\
> Use the "--show --format=Raw-MD5" options to display all of the cracked passwords reliably\
> Session completed.

* **Flag :** <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content"><code>weak</code></span></span>

## Explication
L'algorithme **MD5** (*Message Digest 5*), développé par Ronald Rivest, produit une empreinte (condensat) fixe de **128 bits**, généralement représentée sous forme d'une chaîne hexadécimale de **32 caractères**.

MD5 est un algorithme rapide et sans sel par défaut, ce qui le rend très vulnérable aux attaques par dictionnaire ou par tables arc-en-ciel lorsqu'il est utilisé pour hacher des mots de passe simples comme `weak`. Il est aujourd'hui considéré comme cryptographiquement obsolète et ne doit plus être utilisé pour sécuriser des mots de passe ou vérifier l'intégrité face à un attaquant.