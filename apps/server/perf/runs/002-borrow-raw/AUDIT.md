# Audit 002 — emprunt des chaînes de `RawPlay`

Levier unique. `RawPlay` emprunte `ts`, `platform`, l'artiste et le titre. Le comportement ne change pas : extract 4 → 1, parse 800, normalize 800 → 732. `cargo test --workspace` et `cargo clippy --workspace --all-targets -- -D warnings` passent.

| Run | Mesure | Avant | Après | Rapport | Levier | Preuve |
| --- | --- | --- | --- | --- | --- | --- |
| 002 | allocations, 40 appels | 426 599 | 331 719 | −2 372 / appel | `RawPlay` emprunte ses quatre chaînes | Heaptrack. L'horloge ne prouve pas ce levier |

La prédiction, écrite avant le diff : environ −2 400 allocations par appel. `at`, `platform` et le titre désérialisé disparaissent. L'artiste est recopié dans `Play`, donc son net est proche de zéro. Elle est confirmée : −2 372. L'écart de 28, ce sont les chaînes JSON échappées, qui ne peuvent pas être empruntées (27 allocations dans `borrow_option_cow` sur 40 tours, soit 1 080 appels).

Le chiffre 426 599 est celui du run 001, déjà dans l'arbre au départ de ce levier. Contre le total publié de 000 (427 199), l'écart est 95 480, soit 2 387 par appel, dont 600 viennent du levier 001.

## Correctif

`crates/domain/src/play/raw.rs`. Les quatre champs deviennent `Cow<'a, str>`, avec `#[serde(borrow)]`. `#[serde(borrow)]` appelle `borrow_cow_str` pour un `Cow` nu, et pas pour `Option<Cow<str>>` : serde ne traverse pas `Option`. Artiste et titre passent par `borrow_option_cow`, qui visite `visit_borrowed_str` et ne copie que dans `visit_str` (échappement).

`Play::try_from` ne possède la chaîne que s'il la garde : `into_owned` quand le trim ne raccourcit pas, `to_owned` du trim sinon. `with_title` stocke le titre déjà nettoyé dans un `Cow::Owned`.

## Charge

Même archive que 000, `crates/pipeline/benches/data_test.zip` (1 528 547 octets). Profil `profiling`. 8 octobre 2026. `rustc 1.96.0 (ac68faa20 2026-05-25)`.

| Étape | Lu | Gardé | Écarté |
| --- | ---: | ---: | ---: |
| Extract | 4 entrées ZIP | 1 fichier audio | 3 |
| Parse | 1 fichier | 800 écoutes brutes | 0 |
| Normalize | 800 | 732 | 68 |

Compteurs stables sur les 30 échantillons. `plays` = 732.

Le fichier audio porte 3 198 chaînes : `ts` 800, `platform` 800, artiste 799, titre 799. Une artiste et un titre sont nuls.

## Horloge

`measure --against perf/runs/000-baseline/timings.json`, 3 tours de chauffe, 30 échantillons. Sortie : `timings.json`.

Médiane **1,362 ms** (1 362 011 ns). La médiane 000 est 1 456 787 ns. `time_ratio_millis` 934, `speedup_millis` 1069. C'est 6,9 %. Deux sessions de la baseline avaient déjà 19 % d'écart. Ce rapport n'est pas un gain.

Spans de la seconde passe, hors de l'horloge de référence :

| Span | Médiane | p95 |
| --- | ---: | ---: |
| `extract_archive` | 0,406 ms | 0,464 ms |
| `parse_interactions` | 0,568 ms | 0,595 ms |
| `normalize_interactions` | 0,382 ms | 0,400 ms |

## Allocations

Heaptrack. Fichiers : `profiles/heap-loop1.zst`, `profiles/heap-loop40.zst`, `profiles/heap-loop40-peaks.txt`, `profiles/heap-loop40-deserialize.txt`.

| | Allocations | Temporaires | Pic heap | Fuites |
| --- | ---: | ---: | ---: | ---: |
| 000, publié | 427 199 | 32 642 | 5,23 Mo | 681 Ko |
| 001, publié | 426 599 | 32 042 | 4,82 Mo | 681,30 K |
| 002, `--loop 1` | 17 921 | 3 078 | — | — |
| 002, `--loop 40` | 331 719 | 32 282 | 4,78 Mo | 681,30 K |

Coût par appel sur ce binaire : (331 719 − 17 921) / 39 = 8 046 allocations. Le pied de `heap-loop40-peaks.txt` :

```text
calls to allocation functions: 331719 (1917450/s)
temporary memory allocations: 32282 (186601/s)
peak heap memory consumption: 4.78M
total memory leaked: 681.30K
```

`heap-loop40-deserialize.txt`, allocations dont la pile contient `deserialize_str` et `borrow_option_cow` :

```text
1080 calls with 1.00K peak consumption from:
    visit_some<>
      at crates/domain/src/play/raw.rs:87
    borrow_option_cow<>
      at crates/domain/src/play/raw.rs:57
```

1 080 / 40 = 27 copies. Le reste des 3 198 chaînes est emprunté. L'artiste emprunté est ensuite possédé dans `required` : ces allocations se déplacent, elles ne disparaissent pas.

## CPU

Samply, `profiles/samply.json.gz`, 400 itérations, 603 échantillons sur le thread `measure`. `samply record` a gardé son serveur local ouvert ; `profile.sh` s'est arrêté là. Le fichier était déjà écrit. Attribution par `addr2line -f -C` sur `target/profiling/measure` et `libc.so.6`.

Feuilles les plus fréquentes : `skip_to_escape` 61, `crc32fast::update_fast_16` 48, `run_utf8_validation` 39, `deserialize_struct` 34, `inflate_fast_help` 34. `System::dealloc` apparaît 22 fois dans les piles, plus comme feuille dominante. La validation UTF-8 ne baisse pas (39 feuilles, 35 dans l'audit 000). Ce n'est pas la preuve de ce levier.

## Cache

Cachegrind, 8 itérations, `profiles/cachegrind.out`. Pas une preuve de ce levier.

```text
Command:  .../target/profiling/measure --zip crates/pipeline/benches/data_test.zip --loop 8
I refs: 171,184,228
D1 miss rate: 1.9%
```

L'audit 000 retient 179,8 M, déjà arrondi. L'audit 001 retient 178 839 787 sur le binaire d'avant ce levier. 171 184 228 contre ces deux chiffres n'est pas le rapport retenu : les bruts ne sont plus appariés dans `000-baseline/profiles/`.

## Non corrigé

`Platform::from` alloue encore `to_lowercase` (`platform.rs`, ligne 38).

`clean::title` enchaîne plusieurs `into_owned` (`clean.rs`, lignes 24-31).

`extract::files` ne rejette pas une inflation supérieure à l'archive. Le plafond du run 001 ne borne que la réserve.

Parse reste le span le plus long (0,568 ms).
