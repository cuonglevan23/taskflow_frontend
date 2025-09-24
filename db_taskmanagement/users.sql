create table if not exists users
(
    id                   bigint auto_increment
        primary key,
    created_at           datetime(6)                                                              null,
    deleted              bit                                                                      not null,
    email                varchar(255)                                                             not null,
    first_login          bit                                                                      not null,
    password             varchar(255)                                                             null,
    system_role          enum ('ADMIN', 'MEMBER')                                                 not null,
    updated_at           datetime(6)                                                              null,
    default_workspace_id bigint                                                                   null,
    organization_id      bigint                                                                   null,
    last_seen            datetime(6)                                                              null,
    online               bit                                                                      not null,
    last_login_at        datetime(6)                                                              null,
    status               enum ('ACTIVE', 'DELETED', 'INACTIVE', 'LOCKED', 'PENDING', 'SUSPENDED') not null,
    constraint UK6dotkott2kjsp8vw4d0m25fb7
        unique (email),
    constraint UKsmn14scvq0m43aewva8pgtkjc
        unique (default_workspace_id),
    constraint fk_user_default_workspace
        foreign key (default_workspace_id) references teams (id),
    constraint fk_user_organization
        foreign key (organization_id) references organizations (id)
)
    auto_increment = 4;

