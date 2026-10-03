//! 56px JPEG data-url. A bad image returns `None` and the caller continues.

use std::io::Cursor;

use base64::Engine;
use image::ImageReader;
use image::codecs::jpeg::JpegEncoder;
use image::imageops::FilterType;

const SIZE: u32 = 56;
const QUALITY: u8 = 60;

#[must_use]
pub fn data_url(bytes: &[u8]) -> Option<String> {
    let image = ImageReader::new(Cursor::new(bytes))
        .with_guessed_format()
        .ok()?
        .decode()
        .ok()?;
    let resized = image.resize_exact(SIZE, SIZE, FilterType::Triangle);
    let mut jpeg = Vec::new();
    let mut writer = JpegEncoder::new_with_quality(&mut jpeg, QUALITY);
    writer.encode_image(&resized).ok()?;
    Some(format!(
        "data:image/jpeg;base64,{}",
        base64::engine::general_purpose::STANDARD.encode(jpeg)
    ))
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use image::ImageEncoder;

    use super::data_url;

    #[test]
    fn encodes_a_png_as_a_jpeg_data_url() -> Result<(), image::ImageError> {
        let image = image::RgbaImage::new(8, 8);
        let mut png = Cursor::new(Vec::new());
        let encoder = image::codecs::png::PngEncoder::new(&mut png);
        encoder.write_image(
            image.as_raw(),
            image.width(),
            image.height(),
            image::ExtendedColorType::Rgba8,
        )?;

        let url = data_url(png.get_ref());
        assert!(matches!(url, Some(url) if url.starts_with("data:image/jpeg;base64,")));
        Ok(())
    }

    #[test]
    fn rejects_bytes_that_are_not_an_image() {
        assert!(data_url(b"not-an-image").is_none());
    }
}
