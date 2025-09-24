create table if not exists email_log
(
    id               bigint auto_increment
        primary key,
    body             text                                         null,
    created_at       datetime(6)                                  null,
    direction        enum ('IN', 'OUT')                           not null,
    error_message    text                                         null,
    gmail_message_id varchar(255)                                 null,
    has_attachments  bit                                          null,
    label_ids        text                                         null,
    recipient_email  varchar(255)                                 null,
    sender_email     varchar(255)                                 null,
    sent_at          datetime(6)                                  null,
    status           enum ('DRAFT', 'FAILED', 'RECEIVED', 'SENT') not null,
    subject          varchar(255)                                 null,
    thread_id        varchar(255)                                 null,
    updated_at       datetime(6)                                  null,
    user_id          bigint                                       not null,
    constraint FKij2strun7lyh9j91n67wvsblp
        foreign key (user_id) references users (id)
)
    auto_increment = 133;

