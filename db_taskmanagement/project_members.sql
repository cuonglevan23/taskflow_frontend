create table if not exists project_members
(
    id         bigint auto_increment
        primary key,
    joined_at  datetime(6)              null,
    role       enum ('MEMBER', 'OWNER') not null,
    project_id bigint                   null,
    user_id    bigint                   null,
    constraint fk_project_member_project
        foreign key (project_id) references projects (id),
    constraint fk_project_member_user
        foreign key (user_id) references users (id)
)
    auto_increment = 7;

