create table if not exists teams
(
    id                   bigint auto_increment
        primary key,
    created_at           datetime(6)  null,
    description          text         null,
    is_default_workspace bit          null,
    name                 varchar(255) null,
    updated_at           datetime(6)  null,
    created_by           bigint       null,
    organization_id      bigint       null,
    constraint fk_team_creator
        foreign key (created_by) references users (id),
    constraint fk_team_organization
        foreign key (organization_id) references organizations (id)
)
    auto_increment = 4;

