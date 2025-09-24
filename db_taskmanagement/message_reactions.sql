create table if not exists message_reactions
(
    id            bigint auto_increment
        primary key,
    created_at    datetime(6) not null,
    reaction_type varchar(20) not null,
    updated_at    datetime(6) null,
    message_id    bigint      not null,
    user_id       bigint      not null,
    constraint UKash3iaag60c97vheogisbdyub
        unique (message_id, user_id, reaction_type),
    constraint FK1o714y33gam6b6741ci4ho041
        foreign key (message_id) references messages (id),
    constraint FKoip2ttlg2py976foointttaew
        foreign key (user_id) references users (id)
)
    auto_increment = 64;

