use std::convert::Infallible;
use std::time::Duration;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::sse::{Event, KeepAlive, Sse},
};
use futures::stream::{self, Stream, StreamExt};
use tokio::sync::broadcast;

use crate::AppState;

pub async fn stream_package_progress(
    State(state): State<AppState>,
    Path(public_id): Path<String>,
) -> Result<Sse<impl Stream<Item = Result<Event, Infallible>>>, StatusCode> {
    let Some(snapshot) = state.progress.snapshot_event(&public_id) else {
        return Err(StatusCode::NOT_FOUND);
    };

    let Some(rx) = state.progress.subscribe(&public_id) else {
        return Err(StatusCode::NOT_FOUND);
    };

    let snapshot_data =
        serde_json::to_string(&snapshot).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let snapshot_seq = snapshot.seq();

    let live_stream = stream::unfold(
        (rx, false, snapshot_seq),
        |(mut receiver, mut done, snapshot_seq)| async move {
            if done {
                return None;
            }

            match receiver.recv().await {
                Ok(event) => {
                    if event.seq() <= snapshot_seq {
                        return Some((None, (receiver, done, snapshot_seq)));
                    }

                    let terminal = event.is_terminal();
                    match serde_json::to_string(&event) {
                        Ok(data) => {
                            let sse_event = Event::default()
                                .event("pipeline")
                                .id(event.seq().to_string())
                                .data(data);
                            if terminal {
                                done = true;
                            }
                            Some((Some(Ok(sse_event)), (receiver, done, snapshot_seq)))
                        }
                        Err(_) => Some((None, (receiver, done, snapshot_seq))),
                    }
                }
                Err(broadcast::error::RecvError::Lagged(_)) => {
                    Some((None, (receiver, done, snapshot_seq)))
                }
                Err(broadcast::error::RecvError::Closed) => None,
            }
        },
    )
    .filter_map(|item| async move { item });

    let initial = stream::once(async move {
        Ok(Event::default()
            .event("pipeline")
            .id(snapshot_seq.to_string())
            .data(snapshot_data))
    });

    let combined = initial.chain(live_stream);

    Ok(Sse::new(combined).keep_alive(
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keep-alive"),
    ))
}
