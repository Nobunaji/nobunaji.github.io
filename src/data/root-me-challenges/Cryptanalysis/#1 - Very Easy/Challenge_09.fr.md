# Challenge 9 - Chiffrement par décalage

## Contexte
* **Catégorie :** Cryptanalyse
* **Sous-Titre :** Retrouvez le mot de passe
* **Énoncé :** Indice : Tu quoque fili
* **Fichier fourni :** Un fichier binaire (`challenge.bin`) joint au challenge.

## Résolution
L'indice *« Tu quoque fili »* et le titre évoquent un chiffrement inspiré du **chiffre de César** (un décalage sur les octets du fichier binaire, ici testé sur l'ensemble des 256 valeurs possibles d'un octet).

On écrit un script Python (`decrypt.py`) qui lit le fichier binaire et teste tous les décalages de `0` à `255` :

```python
import sys

if len(sys.argv) < 2:
    print(f"Usage: python3 {sys.argv[0]} <fichier.bin>")
    sys.exit(1)

with open(sys.argv[1], "rb") as f:
    data = f.read()

for i in range(256):
    decoded = bytes((b + i) % 256 for b in data)
    print(f"{i:3d}: {decoded.decode('latin-1')}")
```

On exécute le script sur le fichier binaire :

```bash
python3 decrypt.py challenge.bin
```

**Résultat obtenu (extrait autour du décalage `246`) :**

> 244: @p_tmRsncsvt_jgbcp_tcajcn_qqWmj_gfþ\
> 245: Aq\`un Stodtwu\`khcdq\`udbkdo\`rrXnk\`hgt       ÿ\
> **246: Bravo! Tu peux valider avec le pass <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content">Yolaihu</span></span>**\
> 247: Csbwp"!Uv!qfvy!wbmjefs!bwfd!mf!qbtt!Zpmbjiv\
> 248: Dtcxq#"Vw"rgwz"xcnkfgt"cxge"ng"rcuu"\[qnckjw


* **Flag :** <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content"><code>Yolaihu</code></span></span>

## Explication
Le **chiffre de César** consiste à appliquer un décalage fixe aux symboles d'un message. Appliqué ici directement aux octets d'un fichier binaire (`(b + i) % 256`), chaque octet est une valeur numérique (que l'on peut aussi exprimer en octal, décimal ou hexadécimal). Tester les 256 rotations possibles en force brute permet de retrouver rapidement la clé (`246`) produisant un texte lisible en clair.