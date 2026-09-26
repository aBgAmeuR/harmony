use std::time::Duration;

const DEFAULT_PORT: u16 = 3000;
const TIMEOUT: Duration = Duration::from_secs(3);

pub fn health_url(port: Option<&str>) -> Result<String, String> {
    let port = match port.map(str::trim) {
        None | Some("") => DEFAULT_PORT,
        Some(value) => value
            .parse::<u16>()
            .map_err(|_| format!("PORT is invalid: {value}"))?,
    };
    Ok(format!("http://127.0.0.1:{port}/health"))
}

/// Probes the local `/health` endpoint and returns the process exit code.
pub async fn run() -> i32 {
    match check().await {
        Ok(()) => 0,
        Err(reason) => {
            eprintln!("healthcheck failed: {reason}");
            1
        }
    }
}

async fn check() -> Result<(), String> {
    let port = std::env::var("PORT").ok();
    let url = health_url(port.as_deref())?;
    let client = reqwest::Client::builder()
        .timeout(TIMEOUT)
        .build()
        .map_err(|err| err.to_string())?;
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|err| format!("{url}: {err}"))?;
    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|err| format!("{url}: {err}"))?;
    if status != reqwest::StatusCode::OK || body != "OK" {
        return Err(format!("{url} returned {status}: {body}"));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_or_blank_port_uses_default() {
        assert_eq!(health_url(None).unwrap(), "http://127.0.0.1:3000/health");
        assert_eq!(
            health_url(Some("")).unwrap(),
            "http://127.0.0.1:3000/health"
        );
    }

    #[test]
    fn explicit_port_is_used() {
        assert_eq!(
            health_url(Some("8080")).unwrap(),
            "http://127.0.0.1:8080/health"
        );
    }

    #[test]
    fn invalid_port_is_rejected() {
        let err = health_url(Some("abc")).unwrap_err();
        assert!(err.contains("PORT is invalid: abc"), "{err}");
    }
}
