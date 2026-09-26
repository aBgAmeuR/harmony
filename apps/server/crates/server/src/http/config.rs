use axum::{Json, extract::State};
use serde::Serialize;

use crate::AppState;

#[derive(Serialize)]
pub struct ServerConfigResponse {
    pub max_upload_bytes: u64,
}

pub async fn get_server_config(State(state): State<AppState>) -> Json<ServerConfigResponse> {
    Json(ServerConfigResponse {
        max_upload_bytes: state.max_upload_bytes as u64,
    })
}
