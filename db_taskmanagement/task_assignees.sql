create table if not exists task_assignees
(
    id          bigint auto_increment
        primary key,
    assigned_at timestamp default CURRENT_TIMESTAMP not null,
    task_id     bigint                              not null,
    user_id     bigint                              not null,
    constraint UKgm68jn90tan2rp2tn9w38e3w5
        unique (task_id, user_id),
    constraint FKafus7qmwfnqqhkpqquxx23xmq
        foreign key (user_id) references users (id),
    constraint FKs0jy5sv972lpa2wfx95m7xebb
        foreign key (task_id) references tasks (id)
)
    auto_increment = 21;

