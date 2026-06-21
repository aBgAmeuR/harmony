// @generated automatically by Diesel CLI.

diesel::table! {
    package_data (public_id) {
        public_id -> Text,
        value -> Jsonb,
    }
}

diesel::table! {
    packages (id) {
        id -> Int4,
        public_id -> Text,
        file_name -> Text,
        file_size -> Int4,
        status -> Text,
        updated_at -> Timestamp,
        created_at -> Timestamp,
        started_at -> Nullable<Timestamp>,
        error_stage -> Nullable<Text>,
        error_message -> Nullable<Text>,
        data -> Nullable<Jsonb>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(package_data, packages,);
