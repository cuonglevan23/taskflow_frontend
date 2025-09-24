create table if not exists oauth_providers
(
    id               bigint auto_increment
        primary key,
    access_token     text         null,
    avatar_url       varchar(255) null,
    created_at       datetime(6)  null,
    display_name     varchar(255) null,
    email            varchar(255) null,
    provider_name    varchar(255) not null,
    provider_user_id varchar(255) not null,
    refresh_token    text         null,
    token_expires_at datetime(6)  null,
    updated_at       datetime(6)  null,
    user_id          bigint       not null,
    constraint FKjm6xdbkpwi6ejep2u3rh3nlri
        foreign key (user_id) references users (id)
)
    auto_increment = 4;

