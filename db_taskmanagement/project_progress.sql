create table if not exists project_progress
(
    id                    bigint auto_increment
        primary key,
    completed_tasks       int         null,
    completion_percentage double      null,
    created_at            datetime(6) null,
    last_updated          datetime(6) null,
    total_tasks           int         null,
    total_teams           int         null,
    updated_at            datetime(6) null,
    project_id            bigint      null,
    constraint fk_project_progress_project
        foreign key (project_id) references projects (id)
)
    auto_increment = 6;

