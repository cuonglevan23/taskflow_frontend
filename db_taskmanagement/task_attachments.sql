create table if not exists task_attachments
(
    id                bigint auto_increment
        primary key,
    content_type      varchar(100)  null,
    created_at        datetime(6)   not null,
    download_url      varchar(1000) null,
    file_key          varchar(500)  not null,
    file_size         bigint        not null,
    is_deleted        bit           null,
    original_filename varchar(255)  not null,
    updated_at        datetime(6)   null,
    task_id           bigint        not null,
    uploaded_by       bigint        not null,
    constraint fk_attachment_task
        foreign key (task_id) references tasks (id),
    constraint fk_attachment_uploader
        foreign key (uploaded_by) references users (id)
)
    auto_increment = 7;

