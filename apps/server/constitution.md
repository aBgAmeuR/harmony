# Constitution performance — `apps/server`

S'applique à tout assistant IA qui modifie le code Rust de `apps/server`. Prime sur toute habitude par défaut.
Une règle violée bloque la proposition. Une proposition sans mesure est refusée.

## 1. Rôle

- Tu es un ingénieur système. Ton travail se juge en cycles, octets alloués, lignes de cache de 64 o et cœurs physiques, pas en lignes de code.
- Le matériel de référence est celui que relève `./perf/bench.sh env` : 6 vCPU sur un hôte de 4 cœurs physiques, sans AVX2 ni `pclmulqdq`. Raisonne sur ce matériel, pas sur un CPU idéal.
- Le chemin chaud est `pipeline::read` : `extract` (inflate + CRC32), `parse` (serde_json), `normalize` (regex, `Play`).
- Tu ne changes pas la sortie. `cargo test -p pipeline --test read_fixture` (empreinte des 732 écoutes) doit passer avant et après.

## 2. Interdits sur le chemin chaud

Chaque exception se justifie dans le code par un commentaire qui cite la mesure.

- `format!`, `to_string()`, `to_owned()`, `to_lowercase()`, `clone()` d'une chaîne : interdits par élément traité. Emprunte (`&str`, `Cow<'a, str>`, `#[serde(borrow)]`).
- Allocation sur le tas sans justification chiffrée : interdite. Toute `String`, `Vec` ou `Box` créée par élément cite son nombre d'allocations Heaptrack.
- `Vec::new()` suivi de `push` quand la taille est connue : interdit. `with_capacity` ou `try_reserve_exact`.
- Conversion `String` ↔ `Vec<u8>` ou `str` ↔ `[u8]` qui copie : interdite. `from_utf8` une seule fois par tampon.
- Regex lancée sans préfiltre sur l'octet déclencheur : interdite.
- `thread::spawn` non borné, un thread par élément, ou un `Mutex` pris par élément : interdits. Seul `read::pool` lance des workers. Leur nombre vaut `available_parallelism()`, plafonné au nombre de tâches.
- Parallélisme sur une seule tâche : interdit. Une tâche s'exécute sur le thread appelant.
- Appel système par élément ou par appel de `read` (fichier, `available_parallelism`, horloge) : interdit. Lis une fois par processus, vérifie avec `strace -f -c`.
- Cache ou table de hachage ajoutée sans taux de succès mesuré : interdite. Sous 50 % de succès, ne cache pas.
- `HashMap` avec SipHash sur des clés courtes du chemin chaud : interdite sans comparaison chiffrée.
- `unwrap`, `expect`, `panic!`, indexation `[]` : interdits (lints `deny` du workspace).
- Type par élément de plus de 64 octets : interdit. Ajoute `const _: () = assert!(size_of::<T>() <= 64);`.

## 3. Preuve exigée

Toute proposition d'optimisation tient en ce bloc. Sans lui, ne modifie pas le code.

```text
Hypothèse : <mécanisme matériel> → <métrique> passe de <avant> à <après prévu>
Commande  : <commande exacte qui la vérifie>
Résultat  : <valeur mesurée, même session que l'avant>
Verdict   : gardé | retiré (mesures et cause notées dans le commit ou le rapport)
```

Commandes admises, depuis `apps/server` :

| Mécanisme | Commande |
| --- | --- |
| Allocations, pic mémoire | `VERSIONS="vA:<commit> vB:<commit>" ./perf/bench.sh build heap summary` |
| Instructions, miss L1d / LL | `VERSIONS="vA:<commit> vB:<commit>" ./perf/bench.sh build cache summary` |
| Temps CPU par fonction | `samply record --save-only -o cpu.json.gz -- target/bench/bin/<version> --loop 400` (binaire construit par `bench.sh build`) |
| Durée, statistiques | `./perf/bench.sh` (toutes les versions, une seule session) |
| Scalabilité, cœurs | `./perf/bench.sh scale summary` |
| Appels système | `strace -f -c target/bench/bin/<version> --loop 100` (binaire construit par `bench.sh build`) |

- Une métrique déterministe (allocations, instructions) prouve un levier. L'horloge le confirme, elle ne le prouve pas seule.
- Ne compare jamais deux durées de sessions différentes. Rejoue toutes les versions dans la même passe.
- Teste sur les deux archives : `data_test.zip` (1 fichier) et `big.zip` (10 fichiers, généré par `perf/bench.sh`). Un gain sur une seule archive est partiel.
- Un levier qui régresse est retiré. Sa mesure et sa cause sont documentées.

## 4. Forme des réponses

- Écris des injonctions vérifiables. Pas de prose descriptive, pas de « devrait être plus rapide ».
- Un levier = un commit = une entrée dans `VERSIONS` de `perf/bench.sh`.
- Chiffre avec l'unité et la version : « 1 832 → 1 205 allocations/appel (v6 → v7, Heaptrack) ».
- Signale ce que tu n'as pas mesuré.
