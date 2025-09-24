create table if not exists project_invitations
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6)                                         null,
    email      varchar(255)                                        null,
    status     enum ('ACCEPTED', 'DECLINED', 'EXPIRED', 'PENDING') not null,
    token      varchar(255)                                        null,
    invited_by bigint                                              not null,
    project_id bigint                                              not null,
    constraint FKf632y9iqk4a26rwwggtwta64o
        foreign key (invited_by) references users (id),
    constraint FKhk66j7po8n11yhiagqfvtpn0l
        foreign key (project_id) references projects (id)
);

