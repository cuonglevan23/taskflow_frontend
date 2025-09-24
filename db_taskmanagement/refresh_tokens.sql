create table if not exists refresh_tokens
(
    id          bigint auto_increment
        primary key,
    created_at  datetime(6)  null,
    device_info varchar(255) null,
    expires_at  datetime(6)  not null,
    is_revoked  bit          null,
    token       text         not null,
    user_id     bigint       not null,
    constraint FK1lih5y2npsf8u5o3vhdb9y0os
        foreign key (user_id) references users (id)
)
    auto_increment = 518;

