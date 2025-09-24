create table if not exists agent_chat_messages
(
    id               bigint auto_increment
        primary key,
    ai_model         varchar(255)                         null,
    confidence_score double                               null,
    content          text                                 not null,
    created_at       datetime(6)                          null,
    detected_intent  varchar(255)                         null,
    is_deleted       bit                                  null,
    language         varchar(255)                         null,
    message_id       varchar(255)                         not null,
    processed_at     datetime(6)                          null,
    rag_context      text                                 null,
    sender_type      enum ('AGENT', 'SUPERVISOR', 'USER') not null,
    session_id       varchar(255)                         null,
    tags             varchar(255)                         null,
    updated_at       datetime(6)                          null,
    user_id          bigint                               null,
    conversation_id  bigint                               not null,
    constraint UKn8jqikuso79hku6xbkxu31mg6
        unique (message_id),
    constraint FK4wmpsm39ul6s31at9nsqki7tn
        foreign key (conversation_id) references agent_conversations (id)
);

create index idx_conversation_created
    on agent_chat_messages (conversation_id, created_at);

create index idx_created_at
    on agent_chat_messages (created_at);

create index idx_sender_type
    on agent_chat_messages (sender_type);

create index idx_session_id
    on agent_chat_messages (session_id);

create index idx_user_created
    on agent_chat_messages (user_id, created_at);

create index idx_user_session_created
    on agent_chat_messages (user_id, session_id, created_at);

