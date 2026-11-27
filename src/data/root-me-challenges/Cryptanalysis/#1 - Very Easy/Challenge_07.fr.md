# Challenge 7 - Hash - NT

## Contexte
* **Catégorie :** Cryptanalyse
* **Sous-titre :** Une règle pour les maitriser toutes
* **Énoncé :** Récupérez le mot de passe de l’utilisateur Administrator depuis les informations sorties par l’outil secretsdump de la suite Impacket.
* **Fichier fourni :** Un fichier `.txt` contenant la sortie de `secretsdump` :

```text
[*] Target system bootKey: 0xf1527e4742bbac097f937cc4ac8508e4
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:b4f79698831d92b61f886438e36c0c52:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
ASPNET:1025:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DBAdmin:1028:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
sshd:1037:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
service_user:1038:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
[*] Dumping cached domain logon information (domain/username:hash)
ROOTME.LOCAL/PODALIRIUS:$DCC2$10240#PODALIRIUS#9d3e8dbe4d9816fa1a5dda431ef2f6f1
ROOTME.LOCAL/SHUTDOWN:$DCC2$10240#SHUTDOWN#9d3e8dbe4d9816fa1a5dda431ef2f6f1
[*] Dumping LSA Secrets
[*] $MACHINE.ACC
ROOTME\PC01$:aes256-cts-hmac-sha1-96:e6d5ab8e29fb4f648490fb1cb099b64dffbd2b9e77d46b8df41bc482d590bfe3
ROOTME\PC01$:aes128-cts-hmac-sha1-96:971589d11f2a62980fcab210fa442f4a
ROOTME\PC01$:des-cbc-md5:f18f6dfb6b197fe9
ROOTME\PC01$:plain_password_hex:a918646aa8406975d5ed97534946ef780d48075e618e309b30bf5c9f
ROOTME\PC01$:88c2213866d15f645295e3ebc8779879:ba380afe874fbc0d99b16f8188968133:::
[*] DPAPI_SYSTEM
dpapi_machinekey:0xf35c35eddeecd7b0da287db2e4f8b89b96387157
dpapi_userkey:0x04b4fb8214fb142f86ca2c34de1866f7e565f6f1
[*] NL$KM
 0000   E4 7B 83 10 D7 9D A9 FE  C5 B7 F9 CB 81 27 2A 13   .{...........'*.
 0010   9B 61 D1 F2 9C 0B 1C 8C  53 55 42 46 02 51 10 AC   .A......SUBF.Q..
 0020   4C 02 88 83 CF 37 C8 0C  D3 16 71 96 9E 0E B5 46   L....7....Q....F
 0030   C5 A4 D0 26 8A 77 40 85  B2 E6 1A 8D CF CB A3 46   ...&.W@........F
NL$KM:e47b8310d79da9fec5b7f9cb81272a139b61d1f29c0b1c8c53554246025110ac4c028883cf37c80cd31671969e0eb546c5a4d0268a774085b2e61a8dcfcba346
[*] _SC_sshd
service_user:Mdp!1256@
[*] Cleaning up...
```

## Résolution
Sous `Dumping local SAM hashes (uid:rid:lmhash:nthash)`, on isole la ligne d' `Administrator` :

```text
Administrator:500:aad3b435b51404eeaad3b435b51404ee:b4f79698831d92b61f886438e36c0c52:::
```

On place cette ligne dans un fichier (par exemple `challenge.txt`) et on lance **John the Ripper** avec la wordlist `rockyou.txt`, le format `NT` et les règles `Jumbo` :

```bash
john --format=NT --wordlist="/usr/share/wordlists/rockyou.txt" --rules=Jumbo challenge.txt
```

**Résultat obtenu :**

> Using default input encoding: UTF-8\
> Loaded 1 password hash (NT [MD4 256/256 AVX2 8x3])\
> Warning: no OpenMP support for this hash type, consider --fork=12\
> Press 'q' or Ctrl-C to abort, almost any other key for status\
> **<span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content">iloveyou99!</span></span>**      (**?**)\
> 1g 0:00:01:39 DONE (2026-11-26 21:30) 0.01003g/s 5367Kp/s 5367Kc/s 5367KC/s leana!..girl13!\
> Use the "--show --format=NT" options to display all of the cracked passwords reliably\
> Session completed.

* **Flag :** <span class="spoiler-blur-container" data-inline><span class="spoiler-blur-overlay"><span class="spoiler-blur-text">[RÉDIGÉ]</span></span><span class="spoiler-blur-content"><code>iloveyou99!</code></span></span>

## Explication
Le hash **NT** (NTLM) correspond à un condensat **MD4** calculé sur le mot de passe encodé en UTF-16LE, sans sel. Les règles de mangling (`Jumbo`) appliquent des variations courantes (ajout de chiffres ou de symboles, comme ici `99!` sur `iloveyou`), exposant les mots de passe dérivés de mots courants.