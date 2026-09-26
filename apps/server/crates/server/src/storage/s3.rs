use std::path::Path;
use std::time::Duration;

use hmac::{Hmac, Mac};
use reqwest::Client;
use sha2::{Digest, Sha256};

use super::ObjectStore;

const REGION: &str = "auto";
const SERVICE: &str = "s3";

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("failed to upload object to S3: {0}")]
    Upload(String),
}

pub struct S3ObjectStore {
    http: Client,
    endpoint: reqwest::Url,
    bucket: String,
    access_key: String,
    secret_key: String,
}

impl S3ObjectStore {
    pub fn new(
        endpoint: reqwest::Url,
        bucket: String,
        access_key: String,
        secret_key: String,
    ) -> Self {
        let http = Client::builder()
            .timeout(Duration::from_secs(60))
            .build()
            .expect("reqwest client");

        Self {
            http,
            endpoint,
            bucket,
            access_key,
            secret_key,
        }
    }
}

impl ObjectStore for S3ObjectStore {
    async fn put_file(&self, key: &str, path: &Path) -> Result<(), StorageError> {
        let body = tokio::fs::read(path)
            .await
            .map_err(|err| StorageError::Upload(err.to_string()))?;
        let payload_hash = hex_encode(&Sha256::digest(&body));
        let amz_date = chrono::Utc::now().format("%Y%m%dT%H%M%SZ").to_string();
        let url = object_url(&self.endpoint, &self.bucket, key).map_err(StorageError::Upload)?;
        let host = url
            .host_str()
            .ok_or_else(|| StorageError::Upload("S3 endpoint has no host".to_string()))?;
        let host = match url.port() {
            Some(port) => format!("{host}:{port}"),
            None => host.to_string(),
        };
        let canonical_uri = url.path().to_string();
        let authorization = sign_request(&SignInput {
            method: "PUT",
            canonical_uri: &canonical_uri,
            headers: &[
                ("content-type", "application/octet-stream"),
                ("host", &host),
                ("x-amz-content-sha256", &payload_hash),
                ("x-amz-date", &amz_date),
            ],
            payload_hash: &payload_hash,
            region: REGION,
            access_key: &self.access_key,
            secret_key: &self.secret_key,
            amz_date: &amz_date,
        });

        let response = self
            .http
            .put(url)
            .header("content-type", "application/octet-stream")
            .header("x-amz-content-sha256", &payload_hash)
            .header("x-amz-date", &amz_date)
            .header("authorization", authorization)
            .body(body)
            .send()
            .await
            .map_err(|err| StorageError::Upload(err.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            let body = truncate_body(&text);
            tracing::error!(%status, body, "object storage upload failed");
            return Err(StorageError::Upload(format!("status {status}")));
        }

        Ok(())
    }
}

fn object_url(endpoint: &reqwest::Url, bucket: &str, key: &str) -> Result<reqwest::Url, String> {
    let mut url = endpoint.clone();
    let mut segments = url
        .path_segments_mut()
        .map_err(|_| "S3 endpoint cannot be a base URL".to_string())?;
    segments.push(bucket);
    for segment in key.split('/').filter(|segment| !segment.is_empty()) {
        segments.push(segment);
    }
    drop(segments);
    Ok(url)
}

struct SignInput<'a> {
    method: &'a str,
    canonical_uri: &'a str,
    headers: &'a [(&'a str, &'a str)],
    payload_hash: &'a str,
    region: &'a str,
    access_key: &'a str,
    secret_key: &'a str,
    amz_date: &'a str,
}

fn sign_request(input: &SignInput<'_>) -> String {
    let mut headers = input.headers.to_vec();
    headers.sort_by(|left, right| left.0.cmp(right.0));

    let canonical_headers = headers
        .iter()
        .map(|(name, value)| format!("{name}:{}\n", value.trim()))
        .collect::<String>();
    let signed_headers = headers
        .iter()
        .map(|(name, _)| *name)
        .collect::<Vec<_>>()
        .join(";");

    let canonical_request = format!(
        "{method}\n{uri}\n\n{canonical_headers}\n{signed_headers}\n{payload_hash}",
        method = input.method,
        uri = input.canonical_uri,
        payload_hash = input.payload_hash,
    );
    let date_stamp = &input.amz_date[..8];
    let scope = format!("{date_stamp}/{}/{SERVICE}/aws4_request", input.region);
    let string_to_sign = format!(
        "AWS4-HMAC-SHA256\n{}\n{scope}\n{}",
        input.amz_date,
        hex_encode(&Sha256::digest(canonical_request.as_bytes())),
    );
    let signature = hex_encode(&signing_key(
        input.secret_key,
        date_stamp,
        input.region,
        &string_to_sign,
    ));

    format!(
        "AWS4-HMAC-SHA256 Credential={}/{}, SignedHeaders={}, Signature={}",
        input.access_key, scope, signed_headers, signature,
    )
}

fn signing_key(secret: &str, date_stamp: &str, region: &str, string_to_sign: &str) -> Vec<u8> {
    let date_key = hmac_sha256(format!("AWS4{secret}").as_bytes(), date_stamp.as_bytes());
    let region_key = hmac_sha256(&date_key, region.as_bytes());
    let service_key = hmac_sha256(&region_key, SERVICE.as_bytes());
    let signing_key = hmac_sha256(&service_key, b"aws4_request");
    hmac_sha256(&signing_key, string_to_sign.as_bytes())
}

fn hmac_sha256(key: &[u8], data: &[u8]) -> Vec<u8> {
    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC accepts any key length");
    mac.update(data);
    mac.finalize().into_bytes().to_vec()
}

const BODY_LOG_LIMIT: usize = 512;

fn truncate_body(body: &str) -> String {
    let mut truncated = String::new();
    for (index, ch) in body.chars().enumerate() {
        if index == BODY_LOG_LIMIT {
            truncated.push('…');
            break;
        }
        truncated.push(ch);
    }
    truncated
}

fn hex_encode(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut encoded = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        encoded.push(HEX[(byte >> 4) as usize] as char);
        encoded.push(HEX[(byte & 0xf) as usize] as char);
    }
    encoded
}

#[cfg(test)]
mod tests {
    use super::*;

    const EMPTY_PAYLOAD_HASH: &str =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    #[test]
    fn sign_request_matches_aws_sigv4_example() {
        let authorization = sign_request(&SignInput {
            method: "GET",
            canonical_uri: "/test.txt",
            headers: &[
                ("host", "examplebucket.s3.amazonaws.com"),
                ("range", "bytes=0-9"),
                ("x-amz-content-sha256", EMPTY_PAYLOAD_HASH),
                ("x-amz-date", "20130524T000000Z"),
            ],
            payload_hash: EMPTY_PAYLOAD_HASH,
            region: "us-east-1",
            access_key: "AKIAIOSFODNN7EXAMPLE",
            secret_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
            amz_date: "20130524T000000Z",
        });

        assert_eq!(
            authorization,
            "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41"
        );
    }

    #[test]
    fn truncate_body_keeps_short_text() {
        assert_eq!(truncate_body("ok"), "ok");
    }

    #[test]
    fn truncate_body_limits_long_text_on_char_boundaries() {
        let body = "é".repeat(600);
        let truncated = truncate_body(&body);
        assert_eq!(truncated.chars().count(), BODY_LOG_LIMIT + 1);
        assert!(truncated.ends_with('…'));
        assert!(truncated.starts_with('é'));
    }

    #[test]
    fn object_url_uses_path_style() {
        let endpoint = reqwest::Url::parse("https://example.r2.cloudflarestorage.com").unwrap();
        let url = object_url(&endpoint, "harmony", "harmony/abc.duckdb").unwrap();
        assert_eq!(
            url.as_str(),
            "https://example.r2.cloudflarestorage.com/harmony/harmony/abc.duckdb"
        );
    }
}
