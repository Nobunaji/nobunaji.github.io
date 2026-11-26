# Exercice 2 - Encodage - UU

## Contexte
* **Catégorie :** Cryptanalyse
* **Énoncé :** Retrouver le mot de passe de validation.
* **Fichier fourni :** Un fichier texte (par exemple `challenge.txt`) contenant :

```text
_=_ 
_=_ Part 001 of 001 of file root-me_challenge_uudeview
_=_ 

begin 644 root-me_challenge_uudeview
B5F5R>2!S:6UP;&4@.RD*4$%34R`](%5,5%)!4TE-4$Q%"@``
`
end
```

## Résolution
La structure avec `begin 644 ...` et `end` est caractéristique de l'encodage **uuencode** (Unix-to-Unix encoding).

On décode le fichier avec `uudecode` qu'on affiche dans la sortie standard `stdout` avec l'option `-o -` ou `-o /dev/stdout` :

```bash
uudecode -o - challenge.txt
```

**Résultat obtenu :**
> Very simple ;)\
> PASS = ULTRASIMPLE

* **Mot de passe :** `ULTRASIMPLE`

## Explication
L'encodage **UU** (*uuencode* / *uudecode*) permet de convertir des données binaires en caractères ASCII imprimables afin de les transmettre facilement sur des canaux texte (comme d'anciens protocoles mail ou forums).

La ligne `begin 644 root-me_challenge_uudeview` indique les permissions Unix (`644`) et le nom du fichier de sortie (`root-me_challenge_uudeview`). Chaque ligne encodée commence par un caractère indiquant le nombre d'octets d'origine représentés sur la ligne, suivi des caractères ASCII décodables par `uudecode`.