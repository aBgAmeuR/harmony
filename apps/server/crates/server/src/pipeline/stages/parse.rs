use crate::pipeline::error::ParseError;
use crate::pipeline::report::ParseReport;
use crate::pipeline::types::{ArchiveFile, RawInteraction};

pub struct ParseInput {
    pub files: Vec<ArchiveFile>,
}

pub struct ParseOutput {
    pub raw: Vec<RawInteraction>,
}

pub fn run(input: ParseInput) -> Result<(ParseOutput, ParseReport), ParseError> {
    let mut raw = Vec::new();
    let mut validated = 0usize;
    let mut invalid = 0usize;

    for file in &input.files {
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
                    raw.push(interaction);
                }
                Err(err) => {
                    invalid += 1;
                    tracing::info!(file = %file.name, error = %err, "skipped invalid interaction");
                }
            }
        }
    }

    Ok((ParseOutput { raw }, ParseReport { validated, invalid }))
}
