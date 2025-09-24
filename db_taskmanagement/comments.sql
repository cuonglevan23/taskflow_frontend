create table if not exists comments
(
    id         bigint auto_increment
        primary key,
    content    varchar(255) null,
    created_at datetime(6)  null,
    task_id    bigint       null,
    user_id    bigint       null,
    constraint fk_comment_task
        foreign key (task_id) references tasks (id),
    constraint fk_comment_user
        foreign key (user_id) references users (id)
);

