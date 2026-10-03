mod id;
#[expect(
    clippy::module_inception,
    reason = "the file is named after the Package type it owns"
)]
mod package;
mod state;

pub use id::{Id, IdError};
pub use package::Package;
pub use state::State;
