# Audit 001 — réserve de la taille ZIP déclarée

Levier unique, dans `crates/pipeline/src/read/extract.rs`. Le comportement ne change pas : extract 4 → 1, parse 800, normalize 800 → 732. `cargo test --workspace` et `cargo clippy --workspace --all-targets -- -D warnings` passent.

| Run | Mesure | Avant | Après | Rapport | Levier | Preuve |
| --- | --- | --- | --- | --- | --- | --- |
| 001 | `realloc` via `read_to_end`, 40 appels | 600, pic 1,05 Mo | 0 | 0 | réserve de `file.size()`, plafonnée à la longueur de l'archive | Heaptrack. L'horloge ne prouve pas ce levier |

La prédiction, écrite avant le diff : au plus 1 `realloc` par appel sur ce site, et un effet d'horloge sous 5 %, donc invisible. Elle est confirmée : 0 `realloc`. L'horloge bouge de 2,9 % (`speedup_millis` 1029) contre une baseline d'une autre session.

## Correctif

`files` construisait un `Vec` vide puis appelait `read_to_end`. `ZipFile` ne passe pas de `size_hint`. `default_read_to_end` réserve 32 octets à chaque tampon plein, et `grow_amortized` double.

L'entrée audio de `data_test.zip` déclare 637 504 octets. L'archive en fait 1 528 547. La réserve est donc la taille déclarée entière. Au-delà de la longueur déjà en mémoire, on ne réserve pas : l'en-tête ZIP peut mentir, et `extract::files` ne reçoit pas `MAX_UPLOAD_MB`. `read_to_end` peut encore grandir si l'inflation dépasse ce plafond. Un `try_reserve` refusé est ignoré, pour ne pas ajouter d'erreur.

```rust
let mut body = Vec::new();
if let Ok(declared) = usize::try_from(file.size()) {
    let _ = body.try_reserve(declared.min(bytes.len()));
}
file.read_to_end(&mut body)
    .map_err(zip::result::ZipError::from)?;
```

## Charge

Même archive que 000, `crates/pipeline/benches/data_test.zip` (1 528 547 octets). Même binaire de mesure, profil `profiling`. 8 octobre 2026. `rustc 1.96.0 (ac68faa20 2026-05-25)`.

| Étape | Lu | Gardé | Écarté |
| --- | ---: | ---: | ---: |
| Extract | 4 entrées ZIP | 1 fichier audio | 3 |
| Parse | 1 fichier | 800 écoutes brutes | 0 |
| Normalize | 800 | 732 | 68 |

Compteurs stables sur les 30 échantillons. `plays` = 732.

## Horloge

`measure --against perf/runs/000-baseline/timings.json`, 3 tours de chauffe, 30 échantillons. Sortie : `timings.json`.

Médiane **1,415 ms** (1 414 569 ns). Moyenne 1,445 ms. Écart-type 0,105 ms. Min 1,390 ms. p95 1,685 ms. Max 1,914 ms.

Vingt-sept valeurs tiennent entre 1,390 ms et 1,444 ms. Trois échantillons plus lents : 1,555 ms, 1,685 ms, 1,914 ms.

La médiane 000 est 1 456 787 ns, soit 1,457 ms. `time_ratio_millis` 971, `speedup_millis` 1029. C'est 2,9 %. Deux sessions de la baseline avaient déjà 19 % d'écart. Ce rapport n'est pas un gain.

Spans de la seconde passe, hors de l'horloge de référence :

| Span | Médiane | p95 |
| --- | ---: | ---: |
| `extract_archive` | 0,410 ms | 0,441 ms |
| `parse_interactions` | 0,621 ms | 0,650 ms |
| `normalize_interactions` | 0,367 ms | 0,390 ms |

## Allocations

Heaptrack, 40 itérations, enregistré avant l'écrasement de `000-baseline/profiles/`. Fichiers : `profiles/heaptrack.zst`, `profiles/heap-peaks.txt`, `profiles/heap-read-to-end.txt`.

Référence 000, captures du 7 octobre. Le `heap-peaks.txt` de cette date, relu avant qu'il soit réécrit, portait : `1.05M consumed over 600 calls` depuis `grow_amortized` → `default_read_to_end` → `extract.rs:36`. L'audit 000 retient le même pic, 1,05 Mo, et 427 199 allocations. Ce fichier n'est plus sur le disque : la copie actuelle de `000-baseline/profiles/heap-peaks.txt` est une passe du 8 octobre sur le binaire modifié (`637.50K consumed over 40 calls`, `extract.rs:39`).

| | Allocations | Temporaires | Pic heap | Fuites |
| --- | ---: | ---: | ---: | ---: |
| 000, 7 octobre | 427 199 | 32 642 | 5,23 Mo | 681 Ko |
| 001 | 426 599 | 32 042 | 4,82 Mo | 681,30 K |

Écart d'allocations : 600, soit les 15 `realloc` par appel.

`heap-peaks.txt` de 001, sous `GlobalAlloc::alloc` et non sous `realloc` :

```text
637.50K consumed over 40 calls from:
    try_reserve
    files
      at crates/pipeline/src/read/extract.rs:39
```

637,50 K est l'affichage de 637 504 octets, la taille déclarée. Un `alloc` par appel, plus de doublement.

`heaptrack_print --filter-bt-function read_to_end` sur `profiles/heaptrack.zst` : aucune trace d'allocation. Le même filtre sur la capture du 7 octobre listait les 600 appels.

Le pic heap a été remesuré dans la même session, 40 tours, code sans réserve puis avec. Sorties : `peak-check/before/heap-peaks.txt` et `peak-check/after/heap-peaks.txt`.

```text
before: peak heap memory consumption: 5.23M
        1.05M consumed over 600 calls from extract.rs:36
after:  peak heap memory consumption: 4.82M
        637.50K consumed over 40 calls from extract.rs:37
```

4,82 / 5,23 = 0,922, soit −7,8 % sur les pics arrondis par Heaptrack. L'écart affiché, 0,41 Mo, est le tampon qui s'arrêtait à 1 048 576 octets au lieu de 637 504.

## Cache

Pas une preuve de ce levier.

`./perf/profile.sh` sans `OUT` a réécrit `000-baseline/profiles/cachegrind.txt` le 8 octobre 2026. L'annotation du 7 octobre (179,8 M d'instructions, 8 itérations, miss L1 données 1,9 %, `memcpy` 285 k lectures et 303 k écritures, `normalize::plays` 302 k instructions) ne survit que dans l'audit 000. Le fichier présent, et sa copie dans ce dossier, est une seule capture du binaire modifié :

```text
Command:  .../target/profiling/measure --zip crates/pipeline/benches/data_test.zip --loop 8
Data file: perf/runs/000-baseline/profiles/cachegrind.out
178,839,787 Ir
```

178 839 787 contre le 179,8 M écrit le 7 octobre n'est pas un diff : il n'y a plus de brut apparié, et 179,8 M est déjà arrondi.

## Non corrigé

`extract::files` ne rejette pas une inflation supérieure à l'archive. Le plafond ne borne que la réserve.

Parse reste le span le plus long (0,621 ms, extract 0,410 ms).

Les `realloc` encore attribués à `files` dans `heap-peaks.txt` viennent de la compilation du regex (`extract.rs:53`), une fois.
