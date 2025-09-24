create table if not exists team_tasks
(
    id                  bigint auto_increment
        primary key,
    actual_hours        int                                                                  null,
    created_at          datetime(6)                                                          not null,
    deadline            date                                                                 null,
    description         text                                                                 null,
    estimated_hours     int                                                                  null,
    is_recurring        bit                                                                  null,
    priority            enum ('HIGH', 'LOW', 'MEDIUM')                                       not null,
    progress_percentage int                                                                  null,
    recurrence_end_date date                                                                 null,
    recurrence_pattern  varchar(255)                                                         null,
    start_date          date                                                                 null,
    status              enum ('BLOCKED', 'DONE', 'IN_PROGRESS', 'REVIEW', 'TESTING', 'TODO') not null,
    task_category       varchar(255)                                                         null,
    title               varchar(255)                                                         not null,
    updated_at          datetime(6)                                                          not null,
    assignee_id         bigint                                                               null,
    creator_id          bigint                                                               not null,
    parent_task_id      bigint                                                               null,
    related_project_id  bigint                                                               null,
    team_id             bigint                                                               not null,
    constraint FK495e2vem4pt29y3kig17gvj4w
        foreign key (team_id) references teams (id),
    constraint FK8sc5vlc9e1q0i0vnucgnnrki
        foreign key (creator_id) references users (id),
    constraint FKa43oe0nj93iebm5yw91uusiiq
        foreign key (parent_task_id) references team_tasks (id),
    constraint FKc6wfn571q6mbho9600bgu35kw
        foreign key (related_project_id) references projects (id),
    constraint FKmne51o2hf9j5m0amvgputvxge
        foreign key (assignee_id) references users (id)
);

