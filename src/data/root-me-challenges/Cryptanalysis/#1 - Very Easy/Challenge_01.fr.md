# Challenge 1 - Encodage - ASCII

## Contexte
* **Catégorie :** Cryptanalyse
* **Énoncé :** Décoder la chaîne
* **Fichier fourni :** Un fichier `.txt` contenant la chaîne suivante :
```text
4C6520666C6167206465206365206368616C6C656E6765206573743A203261633337363438316165353436636436383964356239313237356433323465`
```

## Résolution
La chaîne est composée uniquement de caractères hexadécimaux (`0-9` et `A-F`) sur un nombre pair de caractères. On convertit donc ces paires hexadécimales en texte ASCII, par exemple en ligne de commande :

```bash
echo "4C6520666C6167206465206365206368616C6C656E6765206573743A203261633337363438316165353436636436383964356239313237356433323465" | xxd -r -p
```

**Résultat obtenu :**
> Le flag de ce challenge est: **<span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content">2ac376481ae546cd689d5b91275d324e</span></span>**

* **Flag :** <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content"><code>2ac376481ae546cd689d5b91275d324e</code></span></span>

## Explication
Le standard **ASCII** associe chaque caractère ou symbole à une valeur numérique. En informatique, on représente souvent ces octets en base 16 (hexadécimal) pour gagner en lisibilité : chaque paire de caractères correspond à un octet. Par exemple, `4C` en hexadécimal vaut `76` en décimal, soit la lettre `L` en ASCII.