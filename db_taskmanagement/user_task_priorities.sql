create table if not exists user_task_priorities
(
    id           bigint auto_increment
        primary key,
    color        varchar(255) not null,
    display_name varchar(255) not null,
    is_active    bit          not null,
    is_default   bit          not null,
    priority_key varchar(255) not null,
    sort_order   int          not null,
    user_id      bigint       not null,
    constraint UK4fou43ayuniknm9htm10k2c5q
        unique (user_id, priority_key),
    constraint fk_user_task_priority_user
        foreign key (user_id) references users (id)
);

