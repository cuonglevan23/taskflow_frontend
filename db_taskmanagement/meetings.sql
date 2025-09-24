create table if not exists meetings
(
    id           bigint auto_increment
        primary key,
    description  varchar(255) null,
    location     varchar(255) null,
    meeting_time datetime(6)  null,
    title        varchar(255) null,
    created_by   bigint       null,
    project_id   bigint       null,
    constraint fk_meeting_creator
        foreign key (created_by) references users (id),
    constraint fk_meeting_project
        foreign key (project_id) references projects (id)
);

