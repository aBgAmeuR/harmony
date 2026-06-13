use crate::pipeline::error::PersistError;
use crate::pipeline::PipelineContext;
use crate::upsert_package_data;

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.persist",
    fields(
        package_id = ctx.package_id,
        public_id = %ctx.public_id,
        interactions_count = ctx.interactions.len(),
        tracks_count = ctx.deezer_tracks.len(),
        artists_count = ctx.deezer_artists.len(),
        albums_count = ctx.deezer_albums.len(),
    ),
)]
pub fn run(ctx: &mut PipelineContext) -> Result<(), PersistError> {
    let value = serde_json::json!({
        "interactions": ctx.interactions,
        "tracks": ctx.deezer_tracks,
        "artists": ctx.deezer_artists,
        "albums": ctx.deezer_albums,
    });

    let mut conn = ctx
        .db_pool
        .get()
        .map_err(|e| PersistError::Pool(e.to_string()))?;

    upsert_package_data(&mut conn, &ctx.public_id, value)?;

    Ok(())
}
