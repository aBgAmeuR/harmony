use crate::pipeline::error::ParseError;
use crate::pipeline::types::RawInteraction;
use crate::pipeline::PipelineContext;

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.parse",
    fields(
        package_id = ctx.package_id,
        input_files_count = ctx.files.len(),
        validated,
        invalid,
    ),
)]
pub fn run(ctx: &mut PipelineContext) -> Result<(), ParseError> {
    let mut validated = 0usize;
    let mut invalid = 0usize;

    for file in &ctx.files {
        let json: serde_json::Value =
            serde_json::from_str(&file.content).map_err(|source| ParseError::InvalidJson {
                name: file.name.clone(),
                source,
            })?;

        let items = match json {
            serde_json::Value::Array(items) => items,
            single => vec![single],
        };

        if items.is_empty() {
            return Err(ParseError::EmptyFile {
                name: file.name.clone(),
            });
        }

        for item in items {
            match serde_json::from_value::<RawInteraction>(item) {
                Ok(interaction) => {
                    validated += 1;
                    ctx.raw.push(interaction);
                }
                Err(err) => {
                    invalid += 1;
                    tracing::info!(file = %file.name, error = %err, "skipped invalid interaction");
                }
            }
        }
    }

    ctx.stats.parse_validated_count = validated;
    ctx.stats.parse_invalid_count = invalid;

    let span = tracing::Span::current();
    span.record("validated", validated as i64);
    span.record("invalid", invalid as i64);

    tracing::info!(
        validated = validated,
        invalid = invalid,
        "parse stage finished"
    );

    Ok(())
}
