create table if not exists projects
(
    id              bigint auto_increment
        primary key,
    created_at      datetime(6)                                                                     null,
    description     varchar(255)                                                                    null,
    end_date        date                                                                            null,
    is_personal     bit                                                                             null,
    name            varchar(255)                                                                    null,
    start_date      date                                                                            null,
    status          enum ('AT_RISK', 'BLOCKED', 'CANCELLED', 'COMPLETED', 'IN_PROGRESS', 'PLANNED') null,
    updated_at      datetime(6)                                                                     null,
    created_by      bigint                                                                          null,
    organization_id bigint                                                                          null,
    owner_id        bigint                                                                          null,
    team_id         bigint                                                                          null,
    constraint fk_project_creator
        foreign key (created_by) references users (id),
    constraint fk_project_organization
        foreign key (organization_id) references organizations (id),
    constraint fk_project_owner
        foreign key (owner_id) references users (id),
    constraint fk_project_team
        foreign key (team_id) references teams (id)
)
    auto_increment = 7;

