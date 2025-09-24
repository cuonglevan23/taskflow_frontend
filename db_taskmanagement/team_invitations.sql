create table if not exists team_invitations
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6)                                         null,
    email      varchar(255)                                        null,
    status     enum ('ACCEPTED', 'DECLINED', 'EXPIRED', 'PENDING') not null,
    token      varchar(255)                                        null,
    invited_by bigint                                              not null,
    team_id    bigint                                              not null,
    constraint FK94y6185ayqs9qplrsjuid1tj7
        foreign key (invited_by) references users (id),
    constraint FKn2spna496q3cr3fmqc8gda2my
        foreign key (team_id) references teams (id)
);

