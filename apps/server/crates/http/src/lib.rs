//! HTTP verbs. `server` mounts them. This crate does not read the environment.

mod config;
mod error;
mod file;
mod health;
mod open;
mod watch;

pub use config::{Limits, config};
pub use error::HttpError;
pub use file::{Body, file};
pub use health::health;
pub use open::{Upload, body_limit, source};
pub use watch::{EVENT, watch};
