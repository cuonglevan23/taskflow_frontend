create table if not exists user_task_statuses
(
    id           bigint auto_increment
        primary key,
    color        varchar(255) not null,
    display_name varchar(255) not null,
    is_active    bit          not null,
    is_default   bit          not null,
    sort_order   int          not null,
    status_key   varchar(255) not null,
    user_id      bigint       not null,
    constraint UKdc6d77eqrg5l2fduea57xi266
        unique (user_id, status_key),
    constraint fk_user_task_status_user
        foreign key (user_id) references users (id)
);

