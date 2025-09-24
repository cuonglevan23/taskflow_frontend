create table if not exists team_project_progress
(
    id                    bigint auto_increment
        primary key,
    completed_tasks       int         null,
    completion_percentage double      null,
    created_at            datetime(6) null,
    last_updated          datetime(6) null,
    total_tasks           int         null,
    updated_at            datetime(6) null,
    project_id            bigint      null,
    team_id               bigint      null,
    constraint fk_team_project_progress_project
        foreign key (project_id) references projects (id),
    constraint fk_team_project_progress_team
        foreign key (team_id) references teams (id)
)
    auto_increment = 2;

