# Challenge 10 - CISCO - Salted Password

## Contexte
* **Catégorie :** Cryptanalyse
* **Sous-titre :** Pensez à bien saler avant de hasher !
* **Énoncé :** L’administrateur réseau de votre entreprise a oublié ses mots de passes d’administration des routeurs. Il dispose cependant d’une sauvegarde de sa startup-config. À l’aide de celle-ci, retrouvez ses mots de passes ! Le flag est le mot de passe enable et le mot de passe administrateur concaténés. Bon courage !
* **Fichier fourni :** Un fichier `.txt` contenant la configuration Cisco suivante :

```text
version 15.1
no service timestamps log datetime msec
no service timestamps debug datetime msec
no service password-encryption
!
hostname R1
!
enable secret 5 $1$mERr$A419.HL58lq743wXS4kSM1
!
ip cef
no ipv6 cef
!
username administrator secret 5 $1$mERr$yhf7f2RnC74CxKANvoekD.
!
license udi pid CISCO2911/K9 sn FTX1524V4VG-
!
no ip domain-lookup
!
spanning-tree mode pvst
!
interface GigabitEthernet0/0
 ip address 10.0.0.254 255.255.255.0
 no ip proxy-arp
 duplex auto
 speed auto
!
interface GigabitEthernet0/1
 ip address 11.0.0.1 255.255.255.252
 no ip proxy-arp
 duplex auto
 speed auto
!
interface GigabitEthernet0/2
 no ip address
 duplex auto
 speed auto
 shutdown
!
interface Vlan1
 no ip address
 shutdown
!
router bgp 1
 bgp router-id 1.1.1.1
 bgp log-neighbor-changes
 no synchronization
 neighbor 11.0.0.2 remote-as 2
 network 10.0.0.0 mask 255.255.255.0
!
ip classless
!
ip flow-export version 9
!
no cdp run
!
line con 0
 login local
!
line aux 0
!
line vty 0 4
 login
!
!
!
```

## Résolution
Dans la configuration Cisco, le mot `secret 5` suivi du préfixe `$1$` indique des empreintes au format **MD5-crypt** (`crypt(3)` `$1$`), salées ici avec `mERr`. On repère les deux lignes concernées :

```text
enable secret 5 $1$mERr$A419.HL58lq743wXS4kSM1
username administrator secret 5 $1$mERr$yhf7f2RnC74CxKANvoekD.
```

On isole les deux hashes dans un fichier (par exemple `ch53.txt`) et on lance **John the Ripper** au format `md5crypt` avec la wordlist `rockyou.txt` :

```bash
john --format=md5crypt --wordlist="/usr/share/wordlists/rockyou.txt" ch53.txt
```

**Résultat obtenu :**

> Using default input encoding: UTF-8\
> Loaded 2 password hashes with no different salts (md5crypt, crypt(3) $1$ (and variants) [MD5 256/256 AVX2 8x3])\
> Will run 12 OpenMP threads\
> Press 'q' or Ctrl-C to abort, almost any other key for status\
> **<span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content">dolphinsforever</span></span>**  (**secret**)\
> **<span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content">P@ssw0rd!1</span></span>**       (**administrator**)\
> 2g 0:00:00:42 DONE (2026-11-26 23:11) 0.04756g/s 251220p/s 251220c/s 274178C/s PADIYA..P4lpatine\
> Use the "--show" option to display all of the cracked passwords reliably\
> Session completed.

On obtient `dolphinsforever` pour `enable secret` et `P@ssw0rd!1` pour `administrator`. En concaténant les deux dans l'ordre demandé (`enable` puis `administrateur`), on forme le flag.

* **Mot de passe `enable` :** <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content"><code>dolphinsforever</code></span></span>
* **Mot de passe `administrator` :** <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content"><code>P@ssw0rd!1</code></span></span>
* **Flag :** <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content"><code>dolphinsforeverP@ssw0rd!1</code></span></span>

## Explication
Sous Cisco IOS, l'option `secret 5` utilise l'algorithme **MD5-crypt** (`$1$`), qui combine le mot de passe, un sel (ici `mERr`) et 1000 tours de hachage MD5 afin de compliquer les attaques par tables arc-en-ciel et ralentir le calcul par rapport à un simple MD5 brut.

Malgré ce salage, la vitesse de calcul de MD5 reste relativement élevée sur du matériel moderne, et des mots de passe présents dans `rockyou.txt` (ou construits à partir de motifs très répandus comme `P@ssw0rd!1`) peuvent être retrouvés par attaque par dictionnaire. Sur les équipements Cisco récents, il est recommandé de privilégier des algorithmes plus robustes comme le type 8 (PBKDF2-SHA256) ou le type 9 (scrypt).