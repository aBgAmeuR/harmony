use super::Id;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Artist {
    id: Id,
    name: String,
    image: Option<String>,
    uri: String,
}

impl Artist {
    #[must_use]
    pub fn new(id: Id, name: String, image: Option<String>, uri: String) -> Self {
        Self {
            id,
            name,
            image,
            uri,
        }
    }

    #[must_use]
    pub const fn id(&self) -> Id {
        self.id
    }

    #[must_use]
    pub fn name(&self) -> &str {
        &self.name
    }

    #[must_use]
    pub fn image(&self) -> Option<&str> {
        self.image.as_deref()
    }

    #[must_use]
    pub fn uri(&self) -> &str {
        &self.uri
    }
}
