//! Types the pipeline consumes and produces.
//!
//! `pipeline`, `adapters`, and `http` depend on this crate. It depends on none of them.

pub mod artifact;
pub mod catalog;
pub mod fail;
pub mod job;
pub mod matching;
pub mod observe;
pub mod package;
pub mod play;
pub mod ports;
pub mod source;
pub mod stage;
