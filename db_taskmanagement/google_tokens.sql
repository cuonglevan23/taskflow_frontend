create table if not exists google_tokens
(
    id            bigint auto_increment
        primary key,
    access_token  text         null,
    created_at    datetime(6)  null,
    expires_at    datetime(6)  null,
    is_active     bit          null,
    refresh_token text         null,
    scope         text         null,
    token_type    varchar(255) null,
    updated_at    datetime(6)  null,
    user_id       bigint       not null,
    constraint UKq5l4utrx0badelbjr451kvll7
        unique (user_id),
    constraint FK24ofr5048vobcys2byi5c8quj
        foreign key (user_id) references users (id)
);

