create table if not exists task_status_history
(
    id         bigint auto_increment
        primary key,
    changed_at datetime(6)  null,
    new_status varchar(255) null,
    old_status varchar(255) null,
    changed_by bigint       null,
    task_id    bigint       null,
    constraint fk_task_status_history_task
        foreign key (task_id) references tasks (id),
    constraint fk_task_status_history_user
        foreign key (changed_by) references users (id)
);

