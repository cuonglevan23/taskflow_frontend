create table if not exists conversations
(
    id          bigint auto_increment
        primary key,
    avatar_url  varchar(255)             null,
    created_at  datetime(6)              null,
    created_by  bigint                   null,
    description varchar(500)             null,
    is_active   bit                      null,
    name        varchar(100)             null,
    type        enum ('DIRECT', 'GROUP') not null,
    updated_at  datetime(6)              null
)
    auto_increment = 7;

