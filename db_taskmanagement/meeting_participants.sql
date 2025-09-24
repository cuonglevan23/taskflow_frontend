create table if not exists meeting_participants
(
    id         bigint auto_increment
        primary key,
    status     varchar(50) null,
    meeting_id bigint      not null,
    user_id    bigint      not null,
    constraint fk_participant_meeting
        foreign key (meeting_id) references meetings (id),
    constraint fk_participant_user
        foreign key (user_id) references users (id)
);

