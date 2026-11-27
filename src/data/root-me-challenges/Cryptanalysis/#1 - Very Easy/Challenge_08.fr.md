# Challenge 8 - Hash - SHA2

## Contexte
* **Catégorie :** Cryptanalyse
* **Énoncé :** Ce condensat a été volé lors du détournement d’une session sur une application critique, des erreurs ont pu survenir lors de l’interception. Aucune tentative de crack n’a abouti jusque là ; le format de hash semble inconnu. A vous de retrouver le clair correspondant. Pour valider, entrez le SHA-1 de ce mot de passe.
* **Fichier fourni :** Un fichier texte contenant :

```text
96719db60d8e3f498c98d94155e1296aac105ck4923290c89eeeb3ba26d3eef92
```

## Résolution
La famille **SHA-2** (ici **SHA-256**) produit un condensat de 256 bits, soit **64 caractères hexadécimaux** (32 octets). Or, la chaîne fournie comporte 65 caractères et contient un `k`, caractère invalide en hexadécimal (`0-9` et `a-f`).

On retire ce `k` parasite pour obtenir le hash SHA-256 valide de 64 caractères :

```text
96719db60d8e3f498c98d94155e1296aac105c4923290c89eeeb3ba26d3eef92
```

On place ce hash dans un fichier (par exemple `challenge.txt`) et on lance **John the Ripper** en attaque par masque (`?a` représente tous les caractères imprimables ASCII) sur des longueurs de 1 à 7 :

```bash
john --format=raw-sha256 --mask='?a?a?a?a?a?a?a' --min-length=1 --max-length=7 challenge.txt
```

**Résultat obtenu :**

> Using default input encoding: UTF-8\
> Loaded 1 password hash (Raw-SHA256 [SHA256 256/256 AVX2 8x])\
> Warning: poor OpenMP scalability for this hash type, consider --fork=12\
> Will run 12 OpenMP threads\
> Press 'q' or Ctrl-C to abort, almost any other key for status\
> 0g 0:00:00:00  (3) 0g/s 0p/s 0c/s 0C/s\
> 0g 0:00:00:00 0.96% (4) (ETA: 22:21:04) 0g/s 15728Kp/s 15728Kc/s 15728KC/s um~..+~ma\
> 0g 0:00:00:02 1.05% (5) (ETA: 22:24:14) 0g/s 38765Kp/s 38765Kc/s 38765KC/s 5o'|..,)raa\
> **4dM1n**           (**?**)\
> 1g 0:00:00:15 DONE (5) (2026-11-26 22:21) 0.06361g/s 31279Kp/s 31279Kc/s 31279KC/s $ik1n..g).1n\
> Use the "--show --format=Raw-SHA256" options to display all of the cracked passwords reliably\
> Session completed.

Le mot de passe en clair est `4dM1n`. Comme l'énoncé demande de valider avec le **SHA-1** de ce mot de passe :

```bash
echo -n "4dM1n" | sha1sum
```

* **Flag :** <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content"><code>a7c9d5a37201c08c5b7b156173bea5ec2063edf9</code></span></span>

## Explication
Les fonctions de hachage comme **SHA-256** ont une taille de sortie fixe (256 bits, soit 64 caractères en représentation hexadécimale) et n'utilisent que les chiffres `0-9` et les lettres `a-f` (ou `A-F`). La présence d'un caractère hors alphabet hexadécimal lors d'une interception ou d'une copie indique une corruption de données qu'il faut corriger avant d'identifier ou casser le hash.

De plus, un mot de passe court (`4dM1n`, 5 caractères) avec substitution *leet speak* reste vulnérable à une attaque par masque sur des longueurs courtes, et l'énoncé exige ici une étape supplémentaire : calculer l'empreinte **SHA-1** du clair trouvé pour valider le challenge.