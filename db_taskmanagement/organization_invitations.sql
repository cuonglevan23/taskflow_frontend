create table if not exists organization_invitations
(
    id              bigint auto_increment
        primary key,
    created_at      datetime(6)  null,
    email           varchar(255) null,
    status          varchar(255) null,
    token           varchar(255) null,
    invited_by      bigint       null,
    organization_id bigint       null,
    constraint fk_invitation_organization
        foreign key (organization_id) references organizations (id),
    constraint fk_invitation_user
        foreign key (invited_by) references users (id)
);

