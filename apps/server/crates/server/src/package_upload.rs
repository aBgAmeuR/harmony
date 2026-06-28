#[derive(Debug, Clone)]
pub struct PackageUpload {
    pub zip_bytes: Vec<u8>,
    pub selected_files: Option<Vec<String>>,
}
