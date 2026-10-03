mod album;
mod artist;
#[expect(
    clippy::module_inception,
    reason = "the file is named after the Catalog type it owns"
)]
mod catalog;
mod id;
mod track;

pub use album::{Album, Kind};
pub use artist::Artist;
pub use catalog::Catalog;
pub use id::Id;
pub use track::Track;
