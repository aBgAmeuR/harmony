use std::collections::HashMap;

use crate::pipeline::error::AggregateError;
use crate::pipeline::report::AggregateReport;
use crate::pipeline::types::{Interaction, NormalizedInteraction};

pub struct AggregateInput {
    pub normalized: Vec<NormalizedInteraction>,
    pub deezer_matches: HashMap<String, i64>,
}

pub struct AggregateOutput {
    pub interactions: Vec<Interaction>,
}

pub fn run(input: AggregateInput) -> Result<(AggregateOutput, AggregateReport), AggregateError> {
    let mut skipped = 0usize;
    let mut interactions = Vec::with_capacity(input.normalized.len());

    for item in input.normalized {
        let Some(&track_id) = input.deezer_matches.get(&item.track_key) else {
            skipped += 1;
            continue;
        };

        interactions.push(Interaction {
            ts: item.ts,
            platform: item.platform,
            ms_played: item.ms_played,
            shuffle: item.shuffle,
            skipped: item.skipped,
            offline: item.offline,
            track_id,
        });
    }

    let output_count = interactions.len();
    tracing::info!(
        output_count = output_count,
        skipped = skipped,
        "aggregate stage finished"
    );

    Ok((
        AggregateOutput { interactions },
        AggregateReport { skipped },
    ))
}
