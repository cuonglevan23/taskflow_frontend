create table if not exists agent_conversations
(
    id                 bigint auto_increment
        primary key,
    agent_active       bit                                               null,
    ai_personality     varchar(255)                                      null,
    category           varchar(255)                                      null,
    conversation_id    varchar(255)                                      not null,
    created_at         datetime(6)                                       null,
    is_deleted         bit                                               null,
    language           varchar(255)                                      null,
    last_activity_at   datetime(6)                                       null,
    message_count      int                                               null,
    satisfaction_score double                                            null,
    status             enum ('ACTIVE', 'ARCHIVED', 'CLOSED', 'TAKEOVER') not null,
    supervisor_id      bigint                                            null,
    tags               varchar(255)                                      null,
    taken_over_at      datetime(6)                                       null,
    title              varchar(255)                                      null,
    updated_at         datetime(6)                                       null,
    user_id            bigint                                            not null,
    constraint UKfby82fj0h3lxfbv4vubpn4t38
        unique (conversation_id)
);

create index idx_category
    on agent_conversations (category);

create index idx_conversation_id
    on agent_conversations (conversation_id);

create index idx_created_at
    on agent_conversations (created_at);

create index idx_last_activity
    on agent_conversations (last_activity_at);

create index idx_status
    on agent_conversations (status);

create index idx_supervisor
    on agent_conversations (supervisor_id);

create index idx_tags_search
    on agent_conversations (tags);

create index idx_user_id
    on agent_conversations (user_id);

create index idx_user_status
    on agent_conversations (user_id, status);

