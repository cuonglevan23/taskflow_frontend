create table if not exists notification_metadata
(
    notification_id bigint       not null,
    metadata_value  varchar(255) null,
    metadata_key    varchar(255) not null,
    constraint `PRIMARY`
        primary key (notification_id, metadata_key),
    constraint FK375ja66l26pvxrai1u8ondks2
        foreign key (notification_id) references notifications (id)
);

