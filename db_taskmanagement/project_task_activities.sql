create table if not exists project_task_activities
(
    id              bigint auto_increment
        primary key,
    activity_type   enum ('ASSIGNEE_ADDED', 'ASSIGNEE_REMOVED', 'COMMENT_ADDED', 'COMMENT_CHANGED', 'COMMENT_DELETED', 'DEADLINE_CHANGED', 'DESCRIPTION_CHANGED', 'FILE_ATTACHED', 'FILE_DELETED', 'PRIORITY_CHANGED', 'PROJECT_CHANGED', 'STATUS_CHANGED', 'TASK_COMPLETED', 'TASK_CREATED', 'TASK_DELETED', 'TASK_REOPENED', 'TASK_UPDATED', 'TEAM_CHANGED', 'TITLE_CHANGED') not null,
    created_at      datetime(6)                                                                                                                                                                                                                                                                                                                                                 not null,
    description     varchar(500)                                                                                                                                                                                                                                                                                                                                                not null,
    field_name      varchar(100)                                                                                                                                                                                                                                                                                                                                                null,
    new_value       varchar(1000)                                                                                                                                                                                                                                                                                                                                               null,
    old_value       varchar(1000)                                                                                                                                                                                                                                                                                                                                               null,
    project_task_id bigint                                                                                                                                                                                                                                                                                                                                                      not null,
    user_id         bigint                                                                                                                                                                                                                                                                                                                                                      not null,
    constraint fk_project_task_activity_task
        foreign key (project_task_id) references project_tasks (id)
            on update cascade on delete cascade,
    constraint fk_project_task_activity_user
        foreign key (user_id) references users (id)
)
    auto_increment = 236;

