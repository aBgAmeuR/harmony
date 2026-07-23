use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use diesel::result::Error as DieselError;
use diesel_async::pooled_connection::deadpool::PoolError;

/// HTTP error surface for Axum handlers.
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("{0}")]
    BadRequest(String),

    #[error("{0}")]
    UnprocessableEntity(String),

    #[error("{0}")]
    NotFound(String),

    #[error("database error")]
    Database(#[from] DieselError),

    #[error("database pool error")]
    Pool(#[from] PoolError),

    #[error("{0}")]
    Internal(String),
}

impl ApiError {
    pub fn bad_request(message: impl Into<String>) -> Self {
        Self::BadRequest(message.into())
    }

    pub fn unprocessable(message: impl Into<String>) -> Self {
        Self::UnprocessableEntity(message.into())
    }

    pub fn not_found(message: impl Into<String>) -> Self {
        Self::NotFound(message.into())
    }

    pub fn internal(message: impl Into<String>) -> Self {
        Self::Internal(message.into())
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = match &self {
            Self::BadRequest(_) => StatusCode::BAD_REQUEST,
            Self::UnprocessableEntity(_) => StatusCode::UNPROCESSABLE_ENTITY,
            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::Database(DieselError::NotFound) => StatusCode::NOT_FOUND,
            Self::Database(_) | Self::Pool(_) | Self::Internal(_) => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
        };

        let message = match &self {
            Self::Database(DieselError::NotFound) => "package not found".to_string(),
            Self::Database(_) => "database error".to_string(),
            Self::Pool(_) => "database unavailable".to_string(),
            other => other.to_string(),
        };

        (status, message).into_response()
    }
}

impl From<axum::extract::multipart::MultipartError> for ApiError {
    fn from(err: axum::extract::multipart::MultipartError) -> Self {
        Self::BadRequest(err.to_string())
    }
}

/// Validated public package id (alphanumeric only).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PackageId(String);

impl PackageId {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::str::FromStr for PackageId {
    type Err = ApiError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        if value.is_empty() || !value.chars().all(|c| c.is_ascii_alphanumeric()) {
            return Err(ApiError::bad_request("invalid package id"));
        }
        Ok(Self(value.to_string()))
    }
}

impl AsRef<str> for PackageId {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

/// JSON body helper that pairs with [`ApiError`].
pub type ApiResult<T> = Result<Json<T>, ApiError>;
