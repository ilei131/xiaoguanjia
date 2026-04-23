
use diesel::prelude::*;

table! {
    users (id) {
        id -> Integer,
        openid -> Text,
        nickname -> Nullable<Text>,
        avatar -> Nullable<Text>,
        email -> Text,
        password_hash -> Text,
        role -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    categories (id) {
        id -> Integer,
        user_id -> Nullable<Integer>,
        name -> Text,
        is_default -> Bool,
        created_at -> Timestamp,
    }
}

table! {
    locations (id) {
        id -> Integer,
        user_id -> Nullable<Integer>,
        name -> Text,
        is_default -> Bool,
        created_at -> Timestamp,
    }
}

table! {
    items (id) {
        id -> Integer,
        user_id -> Integer,
        category_id -> Integer,
        location_id -> Integer,
        name -> Text,
        quantity -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    item_batches (id) {
        id -> Integer,
        item_id -> Integer,
        quantity -> Integer,
        expiry_date -> Date,
        created_at -> Timestamp,
    }
}

joinable!(items -> categories (category_id));
joinable!(items -> locations (location_id));
joinable!(item_batches -> items (item_id));

allow_tables_to_appear_in_same_query!(users, categories, locations, items, item_batches);
