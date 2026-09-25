use std::collections::HashMap;
use std::sync::{Arc, Mutex, MutexGuard};

use rand::Rng;

const PUBLIC_ID_LEN: usize = 6;

/// Package metadata kept for the life of the API process.
///
/// Restarting the server drops every record. Upload bytes already live only in
/// RAM, so a restart cannot resume a job either.
#[derive(Debug, Clone)]
pub struct Package {
    pub id: i32,
    pub public_id: String,
    pub file_name: String,
    pub file_size: i32,
    pub status: String,
    pub started_at: Option<chrono::NaiveDateTime>,
    pub error_stage: Option<String>,
    pub error_message: Option<String>,
    pub data: Option<serde_json::Value>,
    pub updated_at: chrono::NaiveDateTime,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum StoreError {
    #[error("package not found")]
    NotFound,
}

#[derive(Clone)]
pub struct PackageStore {
    inner: Arc<Mutex<PackageStoreInner>>,
}

struct PackageStoreInner {
    next_id: i32,
    by_id: HashMap<i32, Package>,
    by_public_id: HashMap<String, i32>,
}

impl PackageStore {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(PackageStoreInner {
                next_id: 1,
                by_id: HashMap::new(),
                by_public_id: HashMap::new(),
            })),
        }
    }

    pub fn create_package(&self, file_name: &str, file_size: i32) -> Package {
        let mut guard = lock(&self.inner);
        let now = now();
        let id = guard.next_id;
        guard.next_id += 1;

        let mut public_id = generate_public_id();
        while guard.by_public_id.contains_key(&public_id) {
            public_id = generate_public_id();
        }

        let package = Package {
            id,
            public_id: public_id.clone(),
            file_name: file_name.to_string(),
            file_size,
            status: "pending".to_string(),
            started_at: None,
            error_stage: None,
            error_message: None,
            data: None,
            updated_at: now,
            created_at: now,
        };

        guard.by_public_id.insert(public_id, id);
        guard.by_id.insert(id, package.clone());
        package
    }

    pub fn get_by_public_id(&self, public_id: &str) -> Result<Package, StoreError> {
        let guard = lock(&self.inner);
        let id = guard
            .by_public_id
            .get(public_id)
            .copied()
            .ok_or(StoreError::NotFound)?;
        guard.by_id.get(&id).cloned().ok_or(StoreError::NotFound)
    }

    pub fn mark_running(&self, package_id: i32) {
        let mut guard = lock(&self.inner);
        let Some(package) = guard.by_id.get_mut(&package_id) else {
            return;
        };
        if package.status != "pending" {
            return;
        }
        package.status = "running".to_string();
        package.started_at = Some(now());
    }

    pub fn set_completed(&self, package_id: i32, payload: serde_json::Value) {
        let mut guard = lock(&self.inner);
        let Some(package) = guard.by_id.get_mut(&package_id) else {
            return;
        };
        package.status = "completed".to_string();
        package.data = Some(payload);
    }

    pub fn set_failed(&self, package_id: i32, stage: &str, message: &str) {
        let mut guard = lock(&self.inner);
        let Some(package) = guard.by_id.get_mut(&package_id) else {
            return;
        };
        package.status = "failed".to_string();
        package.error_stage = Some(stage.to_string());
        package.error_message = Some(message.to_string());
    }

    pub fn set_failed_with_data(
        &self,
        package_id: i32,
        stage: &str,
        message: &str,
        payload: serde_json::Value,
    ) {
        let mut guard = lock(&self.inner);
        let Some(package) = guard.by_id.get_mut(&package_id) else {
            return;
        };
        package.status = "failed".to_string();
        package.error_stage = Some(stage.to_string());
        package.error_message = Some(message.to_string());
        package.data = Some(payload);
    }
}

fn lock(inner: &Mutex<PackageStoreInner>) -> MutexGuard<'_, PackageStoreInner> {
    // A poisoned lock means a previous request panicked while holding it. The
    // map is still readable, so later requests keep serving the surviving records.
    inner
        .lock()
        .unwrap_or_else(std::sync::PoisonError::into_inner)
}

fn now() -> chrono::NaiveDateTime {
    chrono::Utc::now().naive_utc()
}

fn generate_public_id() -> String {
    rand::rng()
        .sample_iter(&rand::distr::Alphanumeric)
        .take(PUBLIC_ID_LEN)
        .map(char::from)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_package_is_readable_by_public_id() {
        let store = PackageStore::new();
        let created = store.create_package("history.zip", 12);

        let loaded = store.get_by_public_id(&created.public_id).unwrap();

        assert_eq!(loaded.id, created.id);
        assert_eq!(loaded.file_name, "history.zip");
        assert_eq!(loaded.file_size, 12);
        assert_eq!(loaded.status, "pending");
        assert!(loaded.started_at.is_none());
    }

    #[test]
    fn get_by_public_id_returns_not_found_for_unknown_id() {
        let store = PackageStore::new();

        let err = store.get_by_public_id("missing").unwrap_err();

        assert_eq!(err, StoreError::NotFound);
    }

    #[test]
    fn mark_running_records_started_at_only_once() {
        let store = PackageStore::new();
        let created = store.create_package("history.zip", 1);

        store.mark_running(created.id);
        let running = store.get_by_public_id(&created.public_id).unwrap();
        let started_at = running.started_at;

        store.mark_running(created.id);
        let again = store.get_by_public_id(&created.public_id).unwrap();

        assert_eq!(again.status, "running");
        assert_eq!(again.started_at, started_at);
        assert!(started_at.is_some());
    }

    #[test]
    fn set_completed_stores_progress_json() {
        let store = PackageStore::new();
        let created = store.create_package("history.zip", 1);
        let payload = serde_json::json!({ "totalDurationMs": 10 });

        store.set_completed(created.id, payload.clone());
        let loaded = store.get_by_public_id(&created.public_id).unwrap();

        assert_eq!(loaded.status, "completed");
        assert_eq!(loaded.data, Some(payload));
    }

    #[test]
    fn set_failed_with_data_stores_error_and_progress() {
        let store = PackageStore::new();
        let created = store.create_package("history.zip", 1);
        let payload = serde_json::json!({ "steps": [] });

        store.set_failed_with_data(created.id, "parse", "bad zip", payload.clone());
        let loaded = store.get_by_public_id(&created.public_id).unwrap();

        assert_eq!(loaded.status, "failed");
        assert_eq!(loaded.error_stage.as_deref(), Some("parse"));
        assert_eq!(loaded.error_message.as_deref(), Some("bad zip"));
        assert_eq!(loaded.data, Some(payload));
    }
}
