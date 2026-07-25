use std::time::Duration;

use base64::{Engine as _, engine::general_purpose::STANDARD};
use image::ImageReader;
use image::codecs::jpeg::JpegEncoder;
use image::imageops::FilterType;
use reqwest::Client;

pub const IMAGE_SIZE: u32 = 56;
pub const JPEG_QUALITY: u8 = 60;

pub fn encode_image_data_url(bytes: &[u8]) -> Option<String> {
    let image = ImageReader::new(std::io::Cursor::new(bytes))
        .with_guessed_format()
        .ok()?
        .decode()
        .ok()?;

    let resized = image.resize_exact(IMAGE_SIZE, IMAGE_SIZE, FilterType::Triangle);

    let mut encoded = Vec::new();
    let mut encoder = JpegEncoder::new_with_quality(&mut encoded, JPEG_QUALITY);
    encoder.encode_image(&resized).ok()?;

    Some(format!(
        "data:image/jpeg;base64,{}",
        STANDARD.encode(encoded)
    ))
}

pub async fn build_image_data_url(http: &Client, url: &str) -> Option<String> {
    let trimmed = url.trim();
    if trimmed.is_empty() {
        return None;
    }

    let response = http.get(trimmed).send().await.ok()?;
    if !response.status().is_success() {
        return None;
    }

    let bytes = response.bytes().await.ok()?;
    encode_image_data_url(&bytes)
}

pub fn cdn_http_client() -> Result<Client, reqwest::Error> {
    Client::builder().timeout(Duration::from_secs(5)).build()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_image_data_url_produces_jpeg_data_url() {
        let mut image = image::RgbaImage::new(64, 64);
        for (x, y, pixel) in image.enumerate_pixels_mut() {
            *pixel = image::Rgba([x as u8, y as u8, 128, 255]);
        }

        let mut png_bytes = Vec::new();
        image
            .write_to(
                &mut std::io::Cursor::new(&mut png_bytes),
                image::ImageFormat::Png,
            )
            .expect("png encode");

        let data_url = encode_image_data_url(&png_bytes).expect("image encode");

        assert!(data_url.starts_with("data:image/jpeg;base64,"));
        assert!(data_url.len() > "data:image/jpeg;base64,".len());
    }

    #[test]
    fn encode_image_data_url_rejects_invalid_bytes() {
        assert!(encode_image_data_url(b"not-an-image").is_none());
    }
}
