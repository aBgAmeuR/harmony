use std::time::Duration;

use tokio::sync::watch;

/// Time left to open connections after a shutdown signal. Docker sends SIGKILL
/// 10 s after SIGTERM by default.
pub const GRACE_PERIOD: Duration = Duration::from_secs(5);

/// Resolves on SIGTERM or Ctrl+C. As PID 1 in a container, the process ignores
/// SIGTERM unless it installs a handler.
pub async fn signal() {
    let ctrl_c = async {
        if let Err(err) = tokio::signal::ctrl_c().await {
            tracing::error!(%err, "failed to listen for Ctrl+C");
            std::future::pending::<()>().await;
        }
    };

    #[cfg(unix)]
    let terminate = async {
        match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
            Ok(mut signal) => {
                signal.recv().await;
            }
            Err(err) => {
                tracing::error!(%err, "failed to listen for SIGTERM");
                std::future::pending::<()>().await;
            }
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {}
        () = terminate => {}
    }
}

/// Resolves once shutdown has started.
pub async fn requested(mut shutdown: watch::Receiver<bool>) {
    let _ = shutdown.wait_for(|stopping| *stopping).await;
}
