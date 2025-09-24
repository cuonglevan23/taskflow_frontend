create table if not exists post_attachments
(
    id                bigint auto_increment
        primary key,
    attachment_type   enum ('DOCUMENT', 'IMAGE', 'OTHER', 'VIDEO') not null,
    content_type      varchar(100)                                 null,
    created_at        datetime(6)                                  not null,
    file_size         bigint                                       null,
    original_filename varchar(500)                                 not null,
    s3_key            varchar(1000)                                not null,
    s3_url            varchar(2000)                                null,
    post_id           bigint                                       not null,
    constraint FKdwocy2l1nlf11ebpfrax6sto1
        foreign key (post_id) references posts (id)
)
    auto_increment = 12;

