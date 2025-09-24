create table if not exists conversation_members
(
    id              bigint auto_increment
        primary key,
    is_active       bit                      null,
    joined_at       datetime(6)              null,
    left_at         datetime(6)              null,
    role            enum ('ADMIN', 'MEMBER') not null,
    conversation_id bigint                   not null,
    user_id         bigint                   not null,
    constraint FKnxfbup81m9td8l03se3rg2icf
        foreign key (conversation_id) references conversations (id),
    constraint FKosvpesom2hosqrhos0cf6uel0
        foreign key (user_id) references users (id)
)
    auto_increment = 10;

