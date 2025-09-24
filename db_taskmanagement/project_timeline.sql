create table if not exists project_timeline
(
    id                 bigint auto_increment
        primary key,
    created_at         datetime(6)                                                                                                                                                                                                                        not null,
    event_description  varchar(255)                                                                                                                                                                                                                       not null,
    event_type         enum ('PROJECT_CREATED', 'PROJECT_DELETED', 'PROJECT_DESCRIPTION_CHANGED', 'PROJECT_END_DATE_CHANGED', 'PROJECT_NAME_CHANGED', 'PROJECT_OWNER_CHANGED', 'PROJECT_START_DATE_CHANGED', 'PROJECT_STATUS_CHANGED', 'PROJECT_UPDATED') not null,
    new_value          varchar(255)                                                                                                                                                                                                                       null,
    old_value          varchar(255)                                                                                                                                                                                                                       null,
    changed_by_user_id bigint                                                                                                                                                                                                                             null,
    project_id         bigint                                                                                                                                                                                                                             not null,
    constraint FK55e5wl131xwgl34ay8ay7edrs
        foreign key (changed_by_user_id) references users (id),
    constraint FKl6rfcp0mxcq0ppd5y9k1ggwst
        foreign key (project_id) references projects (id)
)
    auto_increment = 22;

