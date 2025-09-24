create table if not exists messages
(
    id              bigint auto_increment
        primary key,
    content         text                                     null,
    created_at      datetime(6)                              null,
    file_name       varchar(255)                             null,
    file_size       bigint                                   null,
    file_url        varchar(1000)                            null,
    is_deleted      bit                                      null,
    is_edited       bit                                      null,
    reply_to_id     bigint                                   null,
    type            enum ('FILE', 'IMAGE', 'SYSTEM', 'TEXT') not null,
    updated_at      datetime(6)                              null,
    conversation_id bigint                                   not null,
    sender_id       bigint                                   not null,
    constraint FK4ui4nnwntodh6wjvck53dbk9m
        foreign key (sender_id) references users (id),
    constraint FKt492th6wsovh1nush5yl5jj8e
        foreign key (conversation_id) references conversations (id)
)
    auto_increment = 453;

