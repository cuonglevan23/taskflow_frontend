create table if not exists tasks
(
    id                        bigint auto_increment
        primary key,
    calendar_synced_at        datetime(6)                                                                          null,
    comment                   text                                                                                 null,
    created_at                datetime(6)                                                                          null,
    deadline                  date                                                                                 null,
    description               varchar(255)                                                                         null,
    google_calendar_event_id  varchar(255)                                                                         null,
    google_calendar_event_url varchar(255)                                                                         null,
    google_meet_link          varchar(255)                                                                         null,
    is_synced_to_calendar     bit                                                                                  null,
    priority_key              varchar(255)                                                                         null,
    start_date                date                                                                                 null,
    status_key                varchar(255)                                                                         null,
    title                     varchar(255)                                                                         null,
    updated_at                datetime(6)                                                                          null,
    url_file                  varchar(1000)                                                                        null,
    creator_id                bigint                                                                               not null,
    project_id                bigint                                                                               null,
    team_id                   bigint                                                                               null,
    is_public                 bit default b'0'                                                                     null,
    priority                  enum ('HIGH', 'LOW', 'MEDIUM')                                                       null,
    status                    enum ('CANCELLED', 'COMPLETED', 'DONE', 'IN_PROGRESS', 'ON_HOLD', 'PENDING', 'TODO') null,
    constraint fk_task_creator
        foreign key (creator_id) references users (id),
    constraint fk_task_project
        foreign key (project_id) references projects (id),
    constraint fk_task_team
        foreign key (team_id) references teams (id)
)
    auto_increment = 38;

create index idx_task_creator
    on tasks (creator_id);

create index idx_task_deadline
    on tasks (deadline);

create index idx_task_priority
    on tasks (priority_key, priority);

create index idx_task_project
    on tasks (project_id);

create index idx_task_status
    on tasks (status_key, status);

create index idx_task_team
    on tasks (team_id);

create index idx_task_updated_at
    on tasks (updated_at);

