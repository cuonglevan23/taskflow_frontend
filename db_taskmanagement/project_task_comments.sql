create table if not exists project_task_comments
(
    id              bigint auto_increment
        primary key,
    content         text        not null,
    created_at      datetime(6) not null,
    updated_at      datetime(6) null,
    project_task_id bigint      not null,
    user_id         bigint      not null,
    constraint fk_project_task_comment_task
        foreign key (project_task_id) references project_tasks (id),
    constraint fk_project_task_comment_user
        foreign key (user_id) references users (id)
)
    auto_increment = 35;

