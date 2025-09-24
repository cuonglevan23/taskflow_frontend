create table if not exists task_activities
(
    id            bigint auto_increment
        primary key,
    activity_type enum ('ASSIGNEE_ADDED', 'ASSIGNEE_REMOVED', 'COMMENT_ADDED', 'COMMENT_CHANGED', 'COMMENT_DELETED', 'DEADLINE_CHANGED', 'DESCRIPTION_CHANGED', 'FILE_ATTACHED', 'FILE_DELETED', 'PRIORITY_CHANGED', 'PROJECT_CHANGED', 'STATUS_CHANGED', 'TASK_COMPLETED', 'TASK_CREATED', 'TASK_DELETED', 'TASK_REOPENED', 'TASK_UPDATED', 'TEAM_CHANGED', 'TITLE_CHANGED') not null,
    created_at    datetime(6)                                                                                                                                                                                                                                                                                                                                                 not null,
    description   varchar(1000)                                                                                                                                                                                                                                                                                                                                               not null,
    field_name    varchar(100)                                                                                                                                                                                                                                                                                                                                                null,
    new_value     varchar(500)                                                                                                                                                                                                                                                                                                                                                null,
    old_value     varchar(500)                                                                                                                                                                                                                                                                                                                                                null,
    task_id       bigint                                                                                                                                                                                                                                                                                                                                                      not null,
    user_id       bigint                                                                                                                                                                                                                                                                                                                                                      not null,
    constraint fk_task_activity_task
        foreign key (task_id) references tasks (id),
    constraint fk_task_activity_user
        foreign key (user_id) references users (id)
)
    auto_increment = 186;

