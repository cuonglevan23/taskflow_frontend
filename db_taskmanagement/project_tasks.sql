create table if not exists project_tasks
(
    id                        bigint auto_increment
        primary key,
    actual_hours              int                                                                  null,
    created_at                datetime(6)                                                          not null,
    deadline                  date                                                                 null,
    description               text                                                                 null,
    estimated_hours           int                                                                  null,
    priority                  enum ('HIGH', 'LOW', 'MEDIUM')                                       not null,
    progress_percentage       int                                                                  null,
    start_date                date                                                                 null,
    status                    enum ('BLOCKED', 'DONE', 'IN_PROGRESS', 'REVIEW', 'TESTING', 'TODO') not null,
    title                     varchar(255)                                                         not null,
    updated_at                datetime(6)                                                          not null,
    assignee_id               bigint                                                               null,
    creator_id                bigint                                                               not null,
    parent_task_id            bigint                                                               null,
    project_id                bigint                                                               not null,
    calendar_synced_at        datetime(6)                                                          null,
    comment                   text                                                                 null,
    google_calendar_event_id  varchar(255)                                                         null,
    google_calendar_event_url varchar(255)                                                         null,
    google_meet_link          varchar(255)                                                         null,
    is_synced_to_calendar     bit default b'0'                                                     null,
    url_file                  varchar(1000)                                                        null,
    constraint FK2niynf6cxjslt7toyi0n4fsec
        foreign key (assignee_id) references users (id),
    constraint FK7bubpfeh9bhiaog37gf6b0dlq
        foreign key (parent_task_id) references project_tasks (id),
    constraint FKhsx8wvsrs7t8x9hq10jncbisx
        foreign key (project_id) references projects (id),
    constraint FKnt7hk1xy8i4878eofw9dx8pgt
        foreign key (creator_id) references users (id)
)
    auto_increment = 41;

create index idx_project_task_assignee
    on project_tasks (assignee_id);

create index idx_project_task_creator
    on project_tasks (creator_id);

create index idx_project_task_deadline
    on project_tasks (deadline);

create index idx_project_task_parent
    on project_tasks (parent_task_id);

create index idx_project_task_priority
    on project_tasks (priority);

create index idx_project_task_project
    on project_tasks (project_id);

create index idx_project_task_status
    on project_tasks (status);

create index idx_project_task_updated
    on project_tasks (updated_at);

