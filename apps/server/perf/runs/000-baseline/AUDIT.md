# Audit 000 — référence `read`

Auditeur : Antoine JOSSET. Pas de gain. Cette ligne est le point de départ. Une ligne suivante n'a le droit d'annoncer un rapport de temps que si elle nomme le levier et l'outil qui le prouve.

| Run | Mesure | Avant | Après | Rapport | Levier | Preuve |
| --- | --- | --- | --- | --- | --- | --- |
| 000 | médiane de `read::run` | 1,457 ms | — | — | référence, aucun changement de code | `measure`, 30 échantillons, profil `profiling` |

Exemple de ligne valide plus tard : « 10× parce que le titre parsé reste sur la pile au lieu d'un `String` sur le tas », avec un diff Heaptrack qui montre la chute des allocations, pas seulement l'horloge.

## Ce qui a été chronométré

`read` sur `crates/pipeline/benches/data_test.zip` (1 528 547 octets, 1,5 Mo).

L'horloge démarre à l'appel de `read::run` et s'arrête à son retour. La copie de l'archive, `Source::open` et la construction de `Live` sont dehors. Resolve, enrich et persist ne sont pas dans ce run : ils dépendent de Deezer ou d'un catalogue, donc ils ne sont pas reproductibles ici. `read` est la seule étape qui se rejoue à l'identique, à chaque import, et son coût grandit avec la taille de l'export.

Build : `cargo build --profile profiling -p pipeline --bin measure`. Même optimisations que `release` (`opt-level = 3`, LTO thin), symboles conservés pour Samply, Heaptrack et Cachegrind. `release` strippe les symboles, il ne sert pas à profiler.

Machine : VM KVM Proxmox, i440fx, QEMU Virtual CPU 2.5+ sur Intel Core i3-12100 à 3,3 GHz, 6 vCPU (6 cœurs, 1 thread par cœur), caches L1 32 Ko, L2 4 Mo, L3 16 Mo, 10 GiB de RAM, swap 4 GiB, Ubuntu 22.04.5 LTS. Les millisecondes absolues ne se comparent pas à une autre machine. Le rapport avant/après doit rester sur celle-ci.

`rustc 1.96.0 (ac68faa20 2026-05-25)`. 3 tours de chauffe, 30 échantillons. 7 octobre 2026.

## Charge

| Étape | Lu | Gardé | Écarté |
| --- | ---: | ---: | ---: |
| Extract | 4 entrées ZIP | 1 fichier audio | 3 (PDF, historique vidéo, dossier) |
| Parse | 1 fichier | 800 écoutes brutes | 0 |
| Normalize | 800 | 732 | 68 |

Les compteurs sont stables sur les 30 échantillons. `normalize` écarte les lectures dont l'artiste, le titre ou la durée ne passent pas les contrôles.

## Horloge

Médiane **1,457 ms**. Moyenne 1,491 ms. Écart-type 0,094 ms. Min 1,435 ms. p95 1,749 ms. Max 1,758 ms.

Vingt-six des trente valeurs tiennent entre 1,435 ms et 1,503 ms. Quatre échantillons plus lents vont de 1,634 ms à 1,758 ms. Sur un CPU virtuel, cet écart est du bruit de mesure tant qu'un profil ne montre pas deux chemins de code.

## Par étape

`Live::end` enregistre des millisecondes entières. Les trois étapes durent moins d'une milliseconde, donc leur médiane produit est 0. Ce n'est pas « l'étape est gratuite ». C'est la résolution du timer.

Une seconde passe, hors de l'horloge de référence, pose un subscriber `tracing` sur les spans déjà présents dans `read` :

| Span | Médiane | Part | p95 |
| --- | ---: | ---: | ---: |
| `extract_archive` | 0,433 ms | 29,8 % | 0,555 ms |
| `parse_interactions` | 0,648 ms | 44,5 % | 1,045 ms |
| `normalize_interactions` | 0,373 ms | 25,7 % | 0,638 ms |

Somme des médianes : 1,455 ms. L'horloge de `read::run` est à 1,457 ms. L'écart est 2 µs : aucun temps caché entre les étapes.

## Profils

`perf/profile.sh` enchaîne les trois outils sur le même binaire, en mode `--loop`. Chaque tour copie le ZIP (`once` fait `to_vec` avant l'horloge). Cette copie est dans les profils et hors de `read.median_ns`.

### CPU

Samply, `profiles/samply.json.gz`, 400 itérations, 679 échantillons à 1 ms, thread `measure` on-CPU (`threadCPUDelta` d'environ 1 ms par échantillon). Le fichier brut porte des adresses. L'attribution vient de `addr2line -f -C` sur `target/profiling/measure` et sur `libc`.

| Tranche | Échantillons | Part du total | Part de `read` |
| --- | ---: | ---: | ---: |
| Parse | 270 | 39,8 % | 44,7 % |
| Extract | 183 | 27,0 % | 30,3 % |
| Normalize | 144 | 21,2 % | 23,8 % |
| Rust (`drop`, `begin`, `end`) | 7 | 1,0 % | 1,2 % |
| Harnais, hors horloge | 75 | 11,0 % | — |

`read` compte 604 échantillons (679 moins les 75 du harnais). Parse et extract en portent 453, soit 75 % du temps de `read`. L'ordre est le même que les spans : parse, puis extract, puis normalize. Aucune de ces parts n'est un goulot unique, et aucune n'est une accélération : le code n'a pas changé.

Les feuilles les plus fréquentes disent le mécanisme, pas un gain : `skip_to_escape` 62 échantillons, inflate zlib 58 (`inflate_fast_help` 33 plus `inflate_fast_help_impl` 25), `crc32fast::update_fast_16` 50, `deserialize_struct` 45, `dealloc` 44, validation UTF-8 35, `Regex::replacen` 19, `find_fwd` 15. La compilation du NFA regex (`history_pattern`, `cleaners`) n'apparaît que dans 2 échantillons : le `LazyLock` est payé une fois, dilué sur 400 tours. Le coût regex qui reste est la recherche et le remplacement des titres.

Les 75 échantillons du harnais tombent dans `run` à la ligne 407 de `measure.rs`, l'appel `once()` (`run_loop` y est inliné). `once` copie le ZIP avec `to_vec` avant `Instant`. Ils sont dans le profil et hors de `read.median_ns`.

### Allocations

Heaptrack, 40 itérations, `profiles/heaptrack.zst`.

| Allocations | Temporaires | Pic heap | Fuites |
| --- | ---: | ---: | ---: |
| 427 199 | 32 642 (7,6 %) | 5,23 Mo | 681 Ko |

Environ 10 700 allocations par appel, soit 13 par lecture brute. Sur le pic, 3,06 Mo viennent du harnais : le ZIP lu une fois (`fs::read`, 1,53 Mo) plus une copie vivante par tour (`to_vec`, 1,53 Mo). Le pic suivant dans `read` est le `read_to_end` de l'entrée audio (`extract.rs`, 1,05 Mo sur la croissance du tampon). L'origine des 681 Ko comptés comme fuites n'est pas vérifiée.

### Cache

Cachegrind, 8 itérations, `profiles/cachegrind.out`. 179,8 M d'instructions. Le haut du classement est `serde_json` (scan des chaînes, `from_utf8`) et l'inflate zlib du ZIP, puis `malloc` / `memcpy`. Le taux de miss L1 données est 1,9 %. Le cache n'est pas le problème. `memcpy` porte l'essentiel des miss L1 données (285 k lectures, 303 k écritures) : des copies, pas un calcul qui saturerait l'ALU. `normalize::plays` est loin derrière (302 k instructions). Ce n'est pas encore un levier, c'est l'endroit où le prochain diff doit se voir.

## Relancer

Depuis `apps/server` :

```bash
./perf/time.sh
./perf/profile.sh all
```

Comparer un run ultérieur, le levier est obligatoire :

```bash
target/profiling/measure \
  --against perf/runs/000-baseline/timings.json \
  --lever "parse: le titre reste dans un tampon de pile au lieu d'un String" \
  --evidence "heaptrack: les allocations de String dans parse ont disparu"
```
