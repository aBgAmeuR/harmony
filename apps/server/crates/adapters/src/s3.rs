//! S3-compatible [`Blob`](domain::ports::Blob). Signing is `SigV4`. Tests do not call the network.

use std::path::PathBuf;
use std::time::Duration;

use chrono::Utc;
use domain::artifact::Artifact;
use domain::package;
use domain::ports::{Blob, GetError, PutError};
use hmac::{Hmac, Mac};
use reqwest::Url;
use reqwest::blocking::Client;
use sha2::{Digest, Sha256};

const SERVICE: &str = "s3";

type HmacSha256 = Hmac<Sha256>;

/// Object store addressed as `{endpoint}/{bucket}/harmony/{id}.duckdb`.
#[must_use]
pub struct S3 {
    http: Client,
    endpoint: Url,
    bucket: String,
    region: String,
    access_key: String,
    secret_key: String,
}

impl S3 {
    /// # Errors
    ///
    /// [`PutError`] when the endpoint or the HTTP client cannot be built.
    pub fn open(
        endpoint: &str,
        bucket: impl Into<String>,
        region: impl Into<String>,
        access_key: impl Into<String>,
        secret_key: impl Into<String>,
    ) -> Result<Self, PutError> {
        let endpoint = Url::parse(endpoint).map_err(|err| PutError::new(err.to_string()))?;
        let http = Client::builder()
            .timeout(Duration::from_mins(1))
            .build()
            .map_err(|err| PutError::new(err.to_string()))?;
        Ok(Self {
            http,
            endpoint,
            bucket: bucket.into(),
            region: region.into(),
            access_key: access_key.into(),
            secret_key: secret_key.into(),
        })
    }

    fn key(id: package::Id) -> String {
        format!("harmony/{id}.duckdb")
    }

    fn cache(id: package::Id) -> PathBuf {
        std::env::temp_dir().join(format!("harmony-{id}.duckdb"))
    }
}

impl Blob for S3 {
    fn put(&self, id: package::Id, artifact: &Artifact) -> Result<(), PutError> {
        let body = std::fs::read(artifact.path()).map_err(|err| PutError::new(err.to_string()))?;
        let url =
            object_url(&self.endpoint, &self.bucket, &Self::key(id)).map_err(PutError::new)?;
        let response = send(
            &self.http,
            "PUT",
            &url,
            &self.region,
            &self.access_key,
            &self.secret_key,
            Some(body),
        )
        .map_err(PutError::new)?;
        if response.status().is_success() {
            Ok(())
        } else {
            Err(PutError::new(format!(
                "s3 status {}",
                response.status().as_u16()
            )))
        }
    }

    fn get(&self, id: package::Id) -> Result<Artifact, GetError> {
        let url =
            object_url(&self.endpoint, &self.bucket, &Self::key(id)).map_err(GetError::new)?;
        let response = send(
            &self.http,
            "GET",
            &url,
            &self.region,
            &self.access_key,
            &self.secret_key,
            None,
        )
        .map_err(GetError::new)?;
        let status = response.status();
        if status.as_u16() == 404 {
            return Err(GetError::new(format!("missing {id}")));
        }
        if !status.is_success() {
            return Err(GetError::new(format!("s3 status {}", status.as_u16())));
        }
        let bytes = response
            .bytes()
            .map_err(|err| GetError::new(err.to_string()))?;
        let path = Self::cache(id);
        std::fs::write(&path, &bytes).map_err(|err| GetError::new(err.to_string()))?;
        Ok(Artifact::new(path))
    }
}

fn send(
    http: &Client,
    method: &str,
    url: &Url,
    region: &str,
    access_key: &str,
    secret_key: &str,
    body: Option<Vec<u8>>,
) -> Result<reqwest::blocking::Response, String> {
    let payload = body.as_deref().unwrap_or(b"");
    let payload_hash = hex_encode(&Sha256::digest(payload));
    let amz_date = Utc::now().format("%Y%m%dT%H%M%SZ").to_string();
    let host = host_header(url)?;
    let content_type = "application/octet-stream";
    let with_type = [
        ("content-type", content_type),
        ("host", host.as_str()),
        ("x-amz-content-sha256", payload_hash.as_str()),
        ("x-amz-date", amz_date.as_str()),
    ];
    let without_type = [
        ("host", host.as_str()),
        ("x-amz-content-sha256", payload_hash.as_str()),
        ("x-amz-date", amz_date.as_str()),
    ];
    let headers: &[(&str, &str)] = if body.is_some() {
        &with_type
    } else {
        &without_type
    };
    let authorization = sign_request(&SignInput {
        method,
        canonical_uri: url.path(),
        headers,
        payload_hash: &payload_hash,
        region,
        access_key,
        secret_key,
        amz_date: &amz_date,
    })?;
    let request = match method {
        "PUT" => http.put(url.clone()),
        "GET" => http.get(url.clone()),
        _ => return Err(format!("unsupported s3 method {method}")),
    };
    let request = request
        .header("x-amz-content-sha256", &payload_hash)
        .header("x-amz-date", &amz_date)
        .header("authorization", authorization);
    let request = match body {
        Some(body) => request.header("content-type", content_type).body(body),
        None => request,
    };
    request.send().map_err(|err| err.to_string())
}

fn object_url(endpoint: &Url, bucket: &str, key: &str) -> Result<Url, String> {
    let mut url = endpoint.clone();
    {
        let mut segments = url
            .path_segments_mut()
            .map_err(|()| "s3 endpoint cannot be a base url".to_owned())?;
        segments.push(bucket);
        for segment in key.split('/').filter(|segment| !segment.is_empty()) {
            segments.push(segment);
        }
    }
    Ok(url)
}

fn host_header(url: &Url) -> Result<String, String> {
    let host = url
        .host_str()
        .ok_or_else(|| "s3 endpoint has no host".to_owned())?;
    match url.port() {
        Some(port) => Ok(format!("{host}:{port}")),
        None => Ok(host.to_owned()),
    }
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

fn sign_request(input: &SignInput<'_>) -> Result<String, String> {
    let mut headers = input.headers.to_vec();
    headers.sort_by(|left, right| left.0.cmp(right.0));

    let mut canonical_headers = String::new();
    for (name, value) in &headers {
        canonical_headers.push_str(name);
        canonical_headers.push(':');
        canonical_headers.push_str(value.trim());
        canonical_headers.push('\n');
    }
    let signed_headers = headers
        .iter()
        .map(|(name, _value)| *name)
        .collect::<Vec<_>>()
        .join(";");
    let canonical_request = format!(
        "{method}\n{uri}\n\n{canonical_headers}\n{signed_headers}\n{payload_hash}",
        method = input.method,
        uri = input.canonical_uri,
        payload_hash = input.payload_hash,
    );
    let date_stamp = input
        .amz_date
        .get(..8)
        .ok_or_else(|| "s3 date is short".to_owned())?;
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
    )?);
    Ok(format!(
        "AWS4-HMAC-SHA256 Credential={}/{}, SignedHeaders={}, Signature={}",
        input.access_key, scope, signed_headers, signature,
    ))
}

fn signing_key(
    secret: &str,
    date_stamp: &str,
    region: &str,
    string_to_sign: &str,
) -> Result<Vec<u8>, String> {
    let date_key = hmac_sha256(format!("AWS4{secret}").as_bytes(), date_stamp.as_bytes())?;
    let region_key = hmac_sha256(&date_key, region.as_bytes())?;
    let service_key = hmac_sha256(&region_key, SERVICE.as_bytes())?;
    let signing_key = hmac_sha256(&service_key, b"aws4_request")?;
    hmac_sha256(&signing_key, string_to_sign.as_bytes())
}

fn hmac_sha256(key: &[u8], data: &[u8]) -> Result<Vec<u8>, String> {
    let mut mac = HmacSha256::new_from_slice(key).map_err(|err| err.to_string())?;
    mac.update(data);
    Ok(mac.finalize().into_bytes().to_vec())
}

fn hex_encode(bytes: &[u8]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut encoded = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        let high = usize::from(byte >> 4);
        let low = usize::from(byte & 0xf);
        let Some(high) = HEX.get(high).copied() else {
            continue;
        };
        let Some(low) = HEX.get(low).copied() else {
            continue;
        };
        encoded.push(high as char);
        encoded.push(low as char);
    }
    encoded
}

#[cfg(test)]
mod tests {
    use super::{SignInput, object_url, sign_request};

    const EMPTY_HASH: &str = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    #[derive(Debug)]
    #[allow(
        dead_code,
        reason = "the harness prints this only when a fixture fails"
    )]
    enum Fixture {
        Url(String),
        Sign(String),
    }

    #[test]
    fn sign_request_matches_the_aws_sigv4_example() -> Result<(), Fixture> {
        let authorization = sign_request(&SignInput {
            method: "GET",
            canonical_uri: "/test.txt",
            headers: &[
                ("host", "examplebucket.s3.amazonaws.com"),
                ("range", "bytes=0-9"),
                ("x-amz-content-sha256", EMPTY_HASH),
                ("x-amz-date", "20130524T000000Z"),
            ],
            payload_hash: EMPTY_HASH,
            region: "us-east-1",
            access_key: "AKIAIOSFODNN7EXAMPLE",
            secret_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
            amz_date: "20130524T000000Z",
        })
        .map_err(Fixture::Sign)?;

        assert_eq!(
            authorization,
            "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41"
        );
        Ok(())
    }

    #[test]
    fn object_url_uses_path_style() -> Result<(), Fixture> {
        let endpoint = reqwest::Url::parse("https://example.r2.cloudflarestorage.com")
            .map_err(|err| Fixture::Url(err.to_string()))?;
        let url = object_url(&endpoint, "harmony", "harmony/abc.duckdb").map_err(Fixture::Url)?;
        assert_eq!(
            url.as_str(),
            "https://example.r2.cloudflarestorage.com/harmony/harmony/abc.duckdb"
        );
        Ok(())
    }
}
