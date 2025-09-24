create table if not exists audit_logs
(
    id          bigint auto_increment
        primary key,
    action      varchar(500) not null,
    created_at  datetime(6)  not null,
    user_id     bigint       null,
    details     tinytext     null,
    entity_id   varchar(50)  null,
    entity_type varchar(50)  null,
    ip_address  varchar(45)  null,
    session_id  varchar(100) null,
    severity    varchar(20)  null,
    success     bit          null,
    user_agent  varchar(500) null,
    constraint fk_auditlog_user
        foreign key (user_id) references users (id)
)
    auto_increment = 4;

create index idx_audit_created_at
    on audit_logs (created_at);

create index idx_audit_entity_type
    on audit_logs (entity_type);

create index idx_audit_ip_address
    on audit_logs (ip_address);

create index idx_audit_severity
    on audit_logs (severity);

create index idx_audit_user_id
    on audit_logs (user_id);

