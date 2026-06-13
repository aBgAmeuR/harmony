use crate::pipeline::error::AggregateError;
use crate::pipeline::types::Interaction;
use crate::pipeline::PipelineContext;

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.aggregate",
    fields(
        package_id = ctx.package_id,
        input_count = ctx.normalized.len(),
        output_count,
        skipped,
    ),
)]
pub fn run(ctx: &mut PipelineContext) -> Result<(), AggregateError> {
    let mut skipped = 0usize;

    for item in &ctx.normalized {
        let Some(&track_id) = ctx.deezer_matches.get(&item.track_key) else {
            skipped += 1;
            continue;
        };

        ctx.interactions.push(Interaction {
            ts: item.ts.clone(),
            platform: item.platform.clone(),
            ms_played: item.ms_played,
            shuffle: item.shuffle,
            skipped: item.skipped,
            offline: item.offline,
            track_id,
        });
    }

    ctx.stats.interactions_skipped_count = skipped;

    let output_count = ctx.interactions.len();
    let span = tracing::Span::current();
    span.record("output_count", output_count as i64);
    span.record("skipped", skipped as i64);

    tracing::info!(
        output_count = output_count,
        skipped = skipped,
        "aggregate stage finished"
    );

    Ok(())
}
