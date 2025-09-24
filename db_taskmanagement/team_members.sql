create table if not exists team_members
(
    id        bigint auto_increment
        primary key,
    joined_at datetime(6)              null,
    role      enum ('MEMBER', 'OWNER') not null,
    team_id   bigint                   not null,
    user_id   bigint                   not null,
    constraint fk_teammember_team
        foreign key (team_id) references teams (id),
    constraint fk_teammember_user
        foreign key (user_id) references users (id)
)
    auto_increment = 6;

