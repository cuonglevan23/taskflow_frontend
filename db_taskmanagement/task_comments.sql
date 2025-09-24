create table if not exists task_comments
(
    id         bigint auto_increment
        primary key,
    content    text        not null,
    created_at datetime(6) not null,
    updated_at datetime(6) null,
    task_id    bigint      not null,
    user_id    bigint      not null,
    constraint fk_task_comment_task
        foreign key (task_id) references tasks (id),
    constraint fk_task_comment_user
        foreign key (user_id) references users (id)
)
    auto_increment = 18;

