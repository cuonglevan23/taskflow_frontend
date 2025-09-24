create table if not exists organizations
(
    id           bigint auto_increment
        primary key,
    created_at   datetime(6)  null,
    email_domain varchar(255) null,
    name         varchar(255) null,
    updated_at   datetime(6)  null,
    owner_id     bigint       null,
    constraint UKqcdtxrh2cf9e5oalu6arsox3l
        unique (email_domain),
    constraint fk_organization_owner
        foreign key (owner_id) references users (id)
);

