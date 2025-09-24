create table if not exists calendar_integrations
(
    id            bigint auto_increment
        primary key,
    access_token  longtext     null,
    created_at    datetime(6)  null,
    expires_at    datetime(6)  null,
    provider      varchar(255) null,
    refresh_token longtext     null,
    user_id       bigint       null,
    constraint fk_calendar_user
        foreign key (user_id) references users (id)
);

